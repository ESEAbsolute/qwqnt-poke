export interface NodeIKernelMsgService {
    sendSsoCmdReqByContend(cmd: string, content: Buffer): Promise<unknown>;
}

export interface NodeIQQNTWrapperSession {
    getNTWrapperSession(id: string): NodeIQQNTWrapperSession;
    getMsgService(): NodeIKernelMsgService;
}

export interface WrapperNodeApi {
    NodeIQQNTWrapperSession: NodeIQQNTWrapperSession;
}
