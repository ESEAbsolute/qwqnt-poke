import type { PokeParams } from "@/src/renderer/types";
import { PokeConfig, PokeMode } from "../config/types";
import { Debug } from "../debug";
import { NativePoke } from "../impl/nativepoke";

export async function sendPoke(params: PokeParams) {
    var cfg: PokeConfig = PluginSettings.main.readConfig("qwqnt-poke", new PokeConfig());
    switch (cfg.mode) {
        case PokeMode.NATIVE:
            NativePoke.doPoke(params);
            break;
        case PokeMode.NAPCAT:
            Debug.warn("MAIN/Dispatcher", "NapCat poke method not implemented");
            break;
        case PokeMode.HTTP_API:
            Debug.warn("MAIN/Dispatcher", "HTTP_API poke method not implemented");
            break;
        default:
            Debug.error("MAIN/Dispatcher", "Unknown PokeMode:", cfg.mode);
    }
}