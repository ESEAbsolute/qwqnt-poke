import { Debug, MessageLevel } from "@/src/debug";

export function hookAllMessages() {
    const msgListEls = document.querySelectorAll(".chat-msg-area__vlist .message-container.vue-component, .chat-msg-area__vlist .message.vue-component");
    const onUserDblclicks = new WeakMap<Element, boolean>();

    msgListEls.forEach(msgEl => {
        if (onUserDblclicks.has(msgEl)) return;
        onUserDblclicks.set(msgEl, true);

        const el = msgEl as HTMLElement;
        el.__VUE__?.forEach(vue => {
            if (vue?.data?.onUserDblclick) {
                    vue.data.onUserDblclick = function (event: Event) {
                    Debug.log("Renderer/Hook", MessageLevel.DEBUG, "blocked default dblclick jump")
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                };
            }
        });
    });
    Debug.log("Renderer/Hook", MessageLevel.TRACE, "hookAllMessages done.");
}

export function initHooks() {
    const waitForMsgList = setInterval(() => {
        const msgList = document.querySelector(".chat-msg-area__vlist");
        if (msgList) {
            clearInterval(waitForMsgList);
            const observer = new MutationObserver(() => hookAllMessages());
            observer.observe(msgList, { childList: true, subtree: true });
            Debug.log("Renderer/Hook", MessageLevel.DEBUG, "msgList observed")
            hookAllMessages();
        }
    }, 100);
}
