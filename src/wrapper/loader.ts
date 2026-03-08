import { Debug } from "@/src/debug";
import type { WrapperNodeApi } from "@/src/wrapper/types";

export function getWrapperNodeApi(): WrapperNodeApi {
    // const nodeModules = Object.keys(require.cache).filter(id => id.endsWith(".node"));

    for (const id in require.cache) {
        if (id.includes("wrapper.node")) {
            const mod = require.cache[id];
            if (mod && mod.exports) {
                if (mod.exports.NodeIQQNTWrapperSession) {
                    return mod.exports as WrapperNodeApi;
                }
            }
        }
    }
    
    try {
        const fs = require("fs");
        const path = require("path");
        const resourcesPath = process.resourcesPath;
        const wrapperPath = path.join(resourcesPath, "app", "wrapper.node");
        if (fs.existsSync(wrapperPath)) {
            try {
                const wrapper = require(wrapperPath);
                if (wrapper && wrapper.NodeIQQNTWrapperSession) {
                    Debug.success("Successfully loaded wrapper.node");
                    return wrapper as WrapperNodeApi;
                }
            } catch (loadErr) {
                Debug.error("Wrapper/Loader", "Failed to require wrapper.node:", loadErr);
            }
        } else {
            Debug.error("Wrapper/Loader", "wrapper.node not found at:", wrapperPath);
        }
    } catch (e) {
        Debug.error("Wrapper/Loader", "Error searching file system:", e);
    }

    throw new Error("Failed to find wrapper.node in require cache. Ensure NTQQ has loaded it.");
}
