import { Debug, MessageLevel } from "@/src/debug";
import { PokeParams } from "@/src/renderer/types";
import { ipcMain } from "electron";
import { sendPoke } from "@/src/main/dispatcher";
import { Config } from "@/src/config";
import { PokeConfig, type PokeMode } from "@/src/config/types";
import { initNapcatNativeLoader } from "./napcatnativeloader";
import path, { dirname, resolve } from "path";
import { fileURLToPath } from "url";

function initIpc() {
    ipcMain.handle("poke.sendPoke", async (event: any, params: PokeParams) => {
        Debug.log("Main/IPCHandler", MessageLevel.TRACE, "Handling sendPoke with Params: ", params);
        return await sendPoke(params);
    });

    ipcMain.handle("poke.imagineRootPath", async (event: any) => {
        const mainDir: string = dirname(fileURLToPath(import.meta.url));
        // qwqnt-poke-ts\dist\main
        return resolve(mainDir, "..", "..")
    });

    ipcMain.handle("poke.getConfigFile", (event: any) => {
        return path.join(
            dirname(fileURLToPath(import.meta.url)),
            "../../static/config.html"
        );
    });

    ipcMain.handle("poke.getConfig", () => {
        return Config.getInstance().getConfig();
    });

    ipcMain.handle("poke.setMode", (event: any, mode: PokeMode) => {
        Config.getInstance().setMode(mode);
    });

    ipcMain.handle("poke.setConfig", (event: any, config: PokeConfig) => {
        if (config) {
            return Config.getInstance().setConfig(config);
        }
        return false;
    });

    ipcMain.on("poke.test", (event: any) => {
        return true;
    });

    ipcMain.on("poke.debugLog", (event: any, ...args: any) => {
        console.log(...args)
    });

    ipcMain.on("poke.debugWarn", (event: any, ...args: any) => {
        console.warn(...args)
    });

    ipcMain.on("poke.debugError", (event: any, ...args: any) => {
        console.error(...args)
    });
}

initIpc();
initNapcatNativeLoader();

Debug.log("MAIN", MessageLevel.INFO, "Main process initialized (TypeScript).");

