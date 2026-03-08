import { Debug, MessageLevel } from "@/src/debug";
import { PokeParams, type MsgRecord } from "./types";

function isAvatar(target: HTMLElement) {
    return (
        target.classList.contains('avatar') && 
        target.closest('.avatar-span') && 
        target.closest('.message-container')
    );
}

export async function addDblclickListener() {
    Debug.log("Renderer/Poke", MessageLevel.DEBUG, "dblclick listener starts to add");
    document.addEventListener("dblclick", async (e: MouseEvent) => {
        const target: HTMLElement = e.target as HTMLElement;
        Debug.log("Renderer/Poke", MessageLevel.DEBUG, "dblclicked element as HTMLElement:", target.outerHTML);
        var success = false;
        if (isAvatar(target)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            success = await doPoke(getPokeElement(target));
        }
    }, true);
}

function shakeElement(el: HTMLElement, duration: number = 300, intensity: number = 3) {
    const start = performance.now();
    
    const animate = (now: number) => {
        const elapsed = now - start;
        if (elapsed < duration) {
            const offset = Math.sin((elapsed / 50) * Math.PI) * intensity;
            el.style.transform = `translateX(${offset}px)`;
            requestAnimationFrame(animate);
        } else {
            el.style.transform = "translateX(0)";
        }
    };
    requestAnimationFrame(animate);
}

function extractInfo(el: HTMLElement): MsgRecord | undefined {
    return el.__VUE__?.[0]?.ctx.overriddenMsgRecord ?? undefined;
}

function getPokeElement(ctxEl: HTMLElement | null | undefined, depth: number = 5): HTMLElement | null {
    Debug.log("Renderer/Poke", MessageLevel.TRACE, "PokeElement ctxEl:", ctxEl);
    if (!ctxEl || depth <= 0) return null;
    const info = extractInfo(ctxEl);
    if (info) return ctxEl;
    return getPokeElement(ctxEl.parentElement, depth - 1);
}

async function doPoke(ctxEl: HTMLElement | null | undefined): Promise<boolean> {
    Debug.log("Renderer/Poke", MessageLevel.TRACE, "doPoke ctxEl:", ctxEl);
    if (!ctxEl) return false;

    const info: MsgRecord | undefined = extractInfo(ctxEl);
    Debug.log("Renderer/Poke", MessageLevel.TRACE, "doPoke info:", info);
    if (!info) return false;

    const params: PokeParams = new PokeParams(info);
    Debug.log("Renderer/Poke", MessageLevel.TRACE, "Resolved params:", params);

    // Animation
    const avatar = ctxEl.querySelector(".avatar-span") as HTMLElement | null;

    if (!avatar) {
        return false;
    }

    var result: boolean = await window.qwqntPoke.sendPoke(params);

    if (result) shakeElement(avatar);
    return result;
}
