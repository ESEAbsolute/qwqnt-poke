import { Debug } from "@/src/debug";
import { PokeConfig, PokeMode } from "./types";
import path from "path";
import fs from "fs";

export class Config {
    private static instance: Config;

    private config: PokeConfig;
    private configPath: string;

    private constructor() {
        this.config = new PokeConfig();
        
        this.config.mode = PokeMode.NATIVE;
        this.config.napcatConfig = {
            http_port: 3000,
            token: "sample_token",

            raw_port: "3000"
        };
        this.config.httpConfig = {
            url: "localhost:3000",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer sample_token"
            },
            groupChatBody: "{ group_id: <group>, user_id: <target> }",
            privateChatBody: "{ user_id: <target> }",

            raw_headers: "{ \"Content-Type\": \"application/json\", \"Authorization\": \"Bearer sample_token\" }"
        };

        const liteLoaderPath = (global as any).LiteLoader?.path?.config;
        if (liteLoaderPath) {
            this.configPath = path.join(liteLoaderPath, "qwqnt-poke", "config.json");
        } else {
            // Fallback for development or if LiteLoader path is missing
            this.configPath = path.join(__dirname, "..", "..", "config", "config.json");
        }
        
        const configDir = path.dirname(this.configPath);
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        this.loadConfig();
    }

    private loadConfig() {
        if (fs.existsSync(this.configPath)) {
            try {
                const data = fs.readFileSync(this.configPath, "utf-8");
                const loadedConfig = JSON.parse(data);
                
                // No merging. 
                // Directly validate the loaded config.
                // If validation passes, use it.
                // If validation fails, discard it (keep defaults) and overwrite the invalid file with defaults.

                if (!this.setConfig(loadedConfig)) {
                    Debug.success("CONFIG", "Config loaded from file.");
                } else {
                    Debug.error("CONFIG", "Config file validation failed, using defaults.");
                    this.saveConfig(); // Overwrite invalid file with defaults
                }

            } catch (e) {
                Debug.error("CONFIG", "Failed to load config file, overwriting with defaults:", e);
                this.saveConfig();
            }
        } else {
            Debug.warn("CONFIG", "Config file not found, creating default.");
            this.saveConfig();
        }
    }

    private saveConfig() {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4), "utf-8");
            Debug.success("CONFIG", "Config saved to " + this.configPath);
        } catch (e) {
            Debug.error("CONFIG", "Failed to save config:", e);
        }
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    public setMode(mode: PokeMode) {
        this.config.mode = mode;
        this.saveConfig();
    }

    public setConfig(raw: PokeConfig) : boolean {
        var interrupted = false;

        const newConfig = raw;
        
        // 1. napcatConfig raw_port to port
        if (raw.napcatConfig) {
            let validatedPort: number = Number(raw.napcatConfig.raw_port);
            if (Number.isNaN(validatedPort)) {
                Debug.error("CONFIG", "http_port must be a number or string convertible to numbers");
                interrupted = true
            } else {
                newConfig.napcatConfig.http_port = validatedPort;
            }
        }
        
        // 2. httpConfig raw_headers to headers
        if (raw.httpConfig.raw_headers && raw.httpConfig.raw_headers != "") {
            let validatedHeaders: Record<string, string> = {};
            const parsed = JSON.parse(raw.httpConfig.raw_headers);
            if (typeof parsed === "object" && parsed !== null) {
                for (const [k, v] of Object.entries(parsed)) {
                    validatedHeaders[k] = String(v);
                }
                newConfig.httpConfig.headers = validatedHeaders;
            } else {
                Debug.error("CONFIG", "Parsed raw_headers type mismatched, expected Record<string, string | number>");
                interrupted = true
            }
        } else {
            newConfig.httpConfig.raw_headers = "";
            newConfig.httpConfig.headers = {};
        }
        
        if (!interrupted) {
            this.config = newConfig;
            this.saveConfig();
        }
        return interrupted;
    }

    public getConfig() {
        return this.config;
    }
}

