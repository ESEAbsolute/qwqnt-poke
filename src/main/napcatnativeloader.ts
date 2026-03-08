// This file contains code derived from NapCat
// Copyright © 2024 Mlikiowa
//
// Used with permission from the author.
// The native code is restricted to usage within the qwqnt-poke project.
// Redistribution or derivation outside this project is not permitted.
//
// Original project:
// https://github.com/NapNeko/NapCatQQ

import { Debug, MessageLevel } from "@/src/debug";
import * as os from "os";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { constants } from "node:os";

import offset from "../../napcat_native/napi2native.json";
interface OffsetType {
    [key: string]: {
        recv: string;
        send: string;
    };
}

interface BypassOptions {
    hook?: boolean;
    window?: boolean;
    module?: boolean;
    process?: boolean;
    container?: boolean;
    js?: boolean;
}

interface Napi2NativeExportType {
    initHook?: (send: string, recv: string) => boolean;
    setVerbose?: (verbose: boolean) => void;
    enableAllBypasses?: (options?: BypassOptions) => boolean;
}

class Napi2NativeLoader {
    private readonly supportedPlatforms = ["win32.x64", "linux.x64", "linux.arm64", "darwin.x64", "darwin.arm64"];
    private readonly exports: { exports: Napi2NativeExportType; } = { exports: {} };
    private _loaded: boolean = false;

    constructor() {
        this.load();
    }

    private load(): void {
        const platform = process.platform + "." + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            Debug.warn("Napi2NativeLoader", "Unsupported Platform:", platform)
            this._loaded = false;
            return;
        }

        const nativeModulePath = path.join(
            dirname(fileURLToPath(import.meta.url)),
            "../../napcat_native/napi2native/napi2native." + platform + ".node"
        );
        if (!fs.existsSync(nativeModulePath)) {
            Debug.warn("Napi2NativeLoader", "Missing Runtime File:", nativeModulePath);
            this._loaded = false;
            return;
        }

        try {
            Debug.log("Napi2NativeLoader", MessageLevel.TRACE, "exports:", this.exports);
            Debug.log("Napi2NativeLoader", MessageLevel.TRACE, "RTLD_LAZY:", constants.dlopen.RTLD_LAZY);
            process.dlopen(this.exports, nativeModulePath, constants.dlopen.RTLD_LAZY);
            this._loaded = true;
            Debug.success("Napi2NativeLoader", "Loaded Successfully");
        } catch (error) {
            Debug.error("Napi2NativeLoader", "Load Failed:", error);
            this._loaded = false;
        }
    }

    get nativeExports (): Napi2NativeExportType {
        return this.exports.exports;
    }
    
    initHook (send: string, recv: string): boolean {
        if (!this._loaded) {
            Debug.warn("Napi2NativeLoader", "Napi2NativeLoader not loaded, cannot initialize Hook");
            return false;
        }

        try {
            return this.nativeExports.initHook?.(send, recv) ?? false;
        } catch (error) {
            Debug.error("Napi2NativeLoader", "Error occured during initHook:", error);
            return false;
        }
    }
}

var loader: Napi2NativeLoader = new Napi2NativeLoader();
var available: boolean = false;

export function isNapi2NativeLoaderHooked(): boolean {
    return available;
}

export async function initNapcatNativeLoader(): Promise<void> {
    const path = require("path");
    const resourcesPath = process.resourcesPath;
    const version = path.basename(path.dirname(resourcesPath));

    Debug.log("NapcatNativeLoader", MessageLevel.INFO, "QQ Version:", version)

    const typedOffset: OffsetType = offset;
    const table = typedOffset[version + "-" + os.arch()];

    const isNewQQ = parseInt(version.slice(-5)) >= 40824;
    if (isNewQQ) {
        if (table) {
            const success = loader.initHook(table.send, table.recv);
            if (success) {
                available = true;
            }
        } else {
            Debug.warn("NapcatNativeLoader", "Offset table not found for version:", version, "arch:", os.arch());
        }
    } else {
        Debug.warn("NapcatNativeLoader", "QQ version too old:", version);
    }
}