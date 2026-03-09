import type { PokeParams } from "@/src/renderer/types";
import { PokeConfig, PokeMode } from "../config/types";
import { Debug } from "../debug";
import { NativePoke } from "../impl/nativepoke";

export async function sendPoke(params: PokeParams): Promise<boolean> {
    var cfg: PokeConfig = PluginSettings.main.readConfig("qwqnt-poke", new PokeConfig());
    switch (cfg.mode) {
        case PokeMode.NATIVE:
            return NativePoke.doPoke(params);
        case PokeMode.NAPCAT:
            Debug.warn("MAIN/Dispatcher", "NapCat poke method not implemented");
            return false;
        case PokeMode.HTTP_API:
            Debug.warn("MAIN/Dispatcher", "HTTP_API poke method not implemented");
            return false;
        default:
            Debug.error("MAIN/Dispatcher", "Unknown PokeMode:", cfg.mode);
            return false;
    }
}