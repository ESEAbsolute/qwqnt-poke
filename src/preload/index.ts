import type { PokeConfig, PokeMode } from "@/src/config/types";
import { Debug, MessageLevel } from "@/src/debug";
import { PokeParams } from "@/src/renderer/types";
import { contextBridge, ipcRenderer } from "electron";

declare global {
    interface Window {
        qwqntPoke: {
            sendPoke: (params: PokeParams) => Promise<boolean>;
            imagineRootPath: () => Promise<string>;
            getConfigFile: () => Promise<string>;
            getConfig: () => PokeConfig;
            setMode: (mode: PokeMode) => void;
            setConfig: (config: PokeConfig) => void;
            test: () => boolean;
            debugLog: (...args: any) => void;
            debugWarn: (...args: any) => void;
            debugError: (...args: any) => void;
        };
    }
}

contextBridge.exposeInMainWorld("qwqntPoke", {
    sendPoke: async (params: PokeParams) => {
        return await ipcRenderer.invoke("poke.sendPoke", params);
    },
    imagineRootPath: async () => {
        return await ipcRenderer.invoke("poke.imagineRootPath");
    },
    getConfigFile: async () => {
        return await ipcRenderer.invoke("poke.getConfigFile");
    },
    getConfig: () => {
        return ipcRenderer.invoke("poke.getConfig");
    },
    setMode: (mode: PokeMode) => {
        return ipcRenderer.invoke("poke.setMode", mode);
    },
    setConfig: (config: PokeConfig) => {
        return ipcRenderer.invoke("poke.setConfig", config);
    },
    test: () => {
        return ipcRenderer.send("poke.test");
    },
    debugLog: (...args: any) => {
        ipcRenderer.send("poke.debugLog", ...args);
    },
    debugWarn: (...args: any) => {
        ipcRenderer.send("poke.debugWarn", ...args);
    },
    debugError: (...args: any) => {
        ipcRenderer.send("poke.debugError", ...args);
    }
});

// Debug.log("Preload", MessageLevel.INFO, "Preload process initialized.");

