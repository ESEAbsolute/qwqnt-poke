import { Debug, MessageLevel } from "../debug";
import { isNapi2NativeLoaderHooked } from "../main/napcatnativeloader";
import { PokeParams } from "../renderer/types";
import { getMsgService } from "../wrapper/session";
import { ProtoField, ProtoMessage } from "@saltify/typeproto";

const OidbSvcTrpcTcp0XED3_1 = {
    uin: ProtoField(1, "uint32"),
    groupUin: ProtoField(2, "uint32"),
    friendUin: ProtoField(5, "uint32"),
    ext: ProtoField(6, "uint32", "optional"),
};

const OidbSvcTrpcTcpBase = {
    command: ProtoField(1, "uint32"),
    subCommand: ProtoField(2, "uint32"),
    errorCode: ProtoField(3, "uint32"),
    body: ProtoField(4, "bytes"),
    errorMsg: ProtoField(5, "string", "optional"),
    isReserved: ProtoField(12, "uint32"),
};

export class NativePoke {
    public static async doPoke(params: PokeParams): Promise<boolean> {
        if (!isNapi2NativeLoaderHooked()) {
            Debug.error("MAIN/Impl", "Napi2NativeLoader not hooked, poke cancelled");
            return false;
        }
        if (!getMsgService()) {
            Debug.error("MAIN/Impl", "MsgService not available, poke cancelled");
            return false;
        }
        Debug.log("MAIN/Impl", MessageLevel.DEBUG, "doPoke in NativePoke with params", params);

        const packet = this.buildPacket(params);
        Debug.log("MAIN/Impl", MessageLevel.DEBUG, "doPoke packet:", packet);

        const res = await this.sendPacket(packet.cmd, packet.data);
        try {
            const responseData = this.decode(res.data, OidbSvcTrpcTcpBase);
            if (responseData.errorCode !== 0) {
                throw new Error(`OidbSvcTrpcTcpBase error: ${responseData.errorMsg} (code=${responseData.errorCode})`);
            }
            
            Debug.success("MAIN/Impl", "Sent successfully. Response:", responseData);
            return true;
        } catch (e: any) {
            Debug.error("MAIN/Impl", "Sent failed: ", e);
            return false;
        }
    }

    static sendPacket(cmd: string, data: Buffer): Promise<any> {
        const service = getMsgService();
        const timeout = 5000;

        const sendPromise = service.sendSsoCmdReqByContend(cmd, data)
            .then(ret => {
                Debug.log("MAIN/Impl", MessageLevel.VERBOSE, "raw response:", ret);
                if (!ret) throw new Error('Response is undefined/null');
                const buffer = (ret as { rspbuffer: Buffer; }).rspbuffer || 
                                (Buffer.isBuffer(ret) ? ret : undefined);
                if (!buffer) {
                    Debug.log("MAIN/Impl", MessageLevel.VERBOSE, "Invalid response structure:", ret);
                    throw new Error(`Invalid response structure keys: ${Object.keys(ret).join(',')}`);
                }
                return { seq: 0, cmd, data: (ret as { rspbuffer: Buffer; }).rspbuffer };
            });

        const timeoutPromise = new Promise<any>((_resolve, reject) => {
            setTimeout(() => reject(new Error(`Timeout = ${timeout}ms`)), timeout);
        });
        
        return Promise.race([sendPromise, timeoutPromise]);
    }

    static buildPacket(params: PokeParams) {
        const payload = {
            uin: params.user_id,
            ext: 0,
            ...(params.is_group 
                ? { groupUin: params.group_id } 
                : { friendUin: params.user_id }
            )
        }
        const body = this.encode(payload, OidbSvcTrpcTcp0XED3_1);
        const dataPayload = {
            command: 0xED3,
            subCommand: 1,
            body,
            isReserved: 1
        };
        const data: Uint8Array = this.encode(dataPayload, OidbSvcTrpcTcpBase);
        
        return {
            cmd: "OidbSvcTrpcTcp.0xED3_1",
            data: Buffer.from(data),
        };
    }

    // totally not make fucking sense for marking type as any
    static encode(params: any, proto: any): Uint8Array {
        const msg = ProtoMessage.of(proto);
        return msg.encode(params);
    }
    static decode(params: any, proto: any): any {
        const msg = ProtoMessage.of(proto);
        return msg.decode(params);
    }
}