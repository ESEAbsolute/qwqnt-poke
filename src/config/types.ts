export enum PokeMode {
    NATIVE = "native",
    NAPCAT = "napcat",
    HTTP_API = "http_api"
}

type NapcatConfig = {
    http_port: number;
    token: string;
    raw_port?: string;
}

type HttpConfig = {
    url: string;
    method?: "GET" | "POST" | "PUT" | "DELETE"; 
    headers?: Record<string, string>;
    groupChatBody?: any;
    privateChatBody?: any;
    queryParams?: Record<string, string | number>;
    raw_headers?: string;
}

export class PokeConfig {
    public mode: PokeMode = PokeMode.NATIVE;
    public napcatConfig: NapcatConfig = {
        http_port: 3000,
        token: "sample_token",
        raw_port: "3000"
    };
    public httpConfig: HttpConfig = {
        url: "localhost:3000",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer sample_token"
        },
        // Support Placeholders <target> <group>
        // <target> is the qq number of the poked target
        // <group> is the qq group involved
        groupChatBody: "{ group_id: <group>, <user_id>: <target> }",
        privateChatBody: "{ user_id: <target> }",
        raw_headers: "{ \"Content-Type\": \"application/json\", \"Authorization\": \"Bearer sample_token\" }"
    };
}