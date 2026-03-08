
import type { NodeIQQNTWrapperSession, NodeIKernelMsgService, WrapperNodeApi } from "@/src/wrapper/types";
import { getWrapperNodeApi } from "@/src/wrapper/loader";
import { Debug, MessageLevel } from "@/src/debug";

let sessionInstance: NodeIQQNTWrapperSession | null = null;
let msgServiceInstance: NodeIKernelMsgService | null = null;

export function getSession(): NodeIQQNTWrapperSession {
    if (sessionInstance) {
        return sessionInstance;
    }

    const wrapperApi = getWrapperNodeApi();
    
    try {
        sessionInstance = wrapperApi.NodeIQQNTWrapperSession.getNTWrapperSession("nt_1");
        if (sessionInstance) {
            Debug.log("Wrapper/Session", MessageLevel.DEBUG, "Successfully acquired existing session: nt_1");
            return sessionInstance;
        } else {
            Debug.warn("Wrapper/Session", "getNTWrapperSession(\"nt_1\") returned null/undefined");
            throw new Error("getNTWrapperSession(\"nt_1\") returned null/undefined");
        }
    } catch (e) {
        Debug.error("Wrapper/Session", "Failed to get session \"nt_1\":", e);
        throw e;
    }
}

export function getMsgService(): NodeIKernelMsgService {
    if (msgServiceInstance) {
        return msgServiceInstance;
    }
    
    const session = getSession();
    msgServiceInstance = session.getMsgService();
    
    if (!msgServiceInstance) {
        Debug.error("Wrapper/Session", "getNTWrapperSession(\"nt_1\") returned null/undefined");
        throw new Error("Failed to get MsgService from session");
    }
    
    return msgServiceInstance;
}
