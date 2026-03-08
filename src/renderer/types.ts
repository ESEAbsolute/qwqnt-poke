export interface PokeSender {
    sendPoke(params: PokeParams): Promise<boolean>;
}

export interface MsgRecord {
    readonly chatType: number;
    readonly peerUin: string;
    readonly senderUin: string;
}

export class PokeParams {
    static toStr(): any {
        throw new Error("Method not implemented.");
    }
    readonly is_group: boolean;
    readonly group_id: number;
    readonly user_id: number;
    
    constructor (rec: MsgRecord) {
        this.is_group = rec.chatType !== 1;
        this.group_id = this.is_group ? +rec.peerUin : +rec.senderUin;
        this.user_id = +rec.senderUin;
    }
    
    toPacketPayload() {
        if (this.is_group) {
            return {
                uin: this.group_id,
                ext: 0,
                groupUin: this.group_id,
            }
        }
        return {
            uin: this.group_id,
            ext: 0,
            friendUin: this.group_id,
        }
    }
}

declare global {
    interface HTMLElement {
        __VUE__?: Array<{
            ctx: {
                overriddenMsgRecord?: MsgRecord;
            };
            data?: {
                onUserDblclick?: (event: Event) => void;
            };
        }>;
    }
}
