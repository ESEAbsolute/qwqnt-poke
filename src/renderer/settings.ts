import packageJson from "@/package"
import { Debug, MessageLevel } from "@/src/debug";
import { PokeConfig } from "@/src/config/types";

async function getStaticUrl(...args: string[]) {
    var basePath: string = await window.qwqntPoke.imagineRootPath();
    Debug.log("Renderer/Settings", MessageLevel.TRACE, "basePath:", basePath);
    Debug.log("Renderer/Settings", MessageLevel.TRACE, "...args:", ...args);
    const fullPath = await Hako.parsePath(basePath, ...args);
    return qwqnt.framework.protocol.pathToStorageUrl(fullPath);
}

export async function loadConfig() {
    Debug.log("Renderer/Settings", MessageLevel.VERBOSE, "Setting Windows Created.");
    try {
        const view = await PluginSettings.renderer.registerPluginSettings(packageJson);
        view.classList.add("poke-settings");
        Debug.log("Renderer/Settings", MessageLevel.VERBOSE, "Setting List Registered");

        const settingsUrl = await getStaticUrl("static", "settings.html");
        Debug.log("Renderer/Settings", MessageLevel.DEBUG, "Setting URL:", settingsUrl);

        view.innerHTML = await (await fetch(settingsUrl)).text();

        var cfg: PokeConfig = PluginSettings.renderer.readConfig("qwqnt-poke", new PokeConfig());
        PluginSettings.renderer.writeConfig("qwqnt-poke", cfg);

        Debug.log("Renderer/Settings", MessageLevel.INFO, "Setting Windows registered.");
    } catch (e) {
        Debug.error("Renderer/Settings", "Failed to register settings view:", e);
    }
}
