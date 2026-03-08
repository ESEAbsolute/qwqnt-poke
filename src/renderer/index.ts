import { initHooks } from "./hook";
import { addDblclickListener } from "./poke";
import { loadConfig } from "./settings";
import { Debug, MessageLevel } from "@/src/debug";

RendererEvents.onMessageWindowCreated(() => {
    initHooks()
    addDblclickListener()
    Debug.log("Renderer", MessageLevel.INFO, "Renderer Hooks initialized.");
});

RendererEvents.onSettingsWindowCreated(async () => {
    loadConfig()
});


