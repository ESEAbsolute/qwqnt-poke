let colors = { 
    // https://talyian.github.io/ansicolors/
    reset:  "\x1b[0m",
    label:  "\x1b[38;5;117m", // 出于某种原因的喜欢这个颜色
    cyan:   "\x1b[36m",       // 这个也一样
    green:  "\x1b[38;5;121m",
    yellow: "\x1b[38;5;221m",
    red:    "\x1b[38;5;196m",
};

export enum MessageLevel {
    CRITICAL = -1,
    INFO = 0,
    DEBUG = 1,
    VERBOSE = 2,
    TRACE = 3
}

function needsIpc(): boolean {
    return ( // why??????
        typeof window !== "undefined"
    );
}

function safeSerialize(arg: any): string {
    if (arg === null || arg === undefined) return arg;
    
    // Handle DOM elements
    if (typeof HTMLElement !== 'undefined' && arg instanceof HTMLElement) {
        // Return a string representation instead of Object Object
        return `[HTMLElement: ${arg.tagName.toLowerCase()}${arg.id ? '#' + arg.id : ''}${arg.className ? '.' + arg.className.split(' ').join('.') : ''}]`;
    }

    return arg;
}

function processArgsForIpc(args: any[]): string[] {
    try {
        return args.map(arg => {
            return safeSerialize(arg);
        });
    } catch (e) {
        return ["[Serialization Error]"];
    }
}

export class Debug {
    private static muted: boolean = false;
    private static level: MessageLevel = MessageLevel.INFO;
    private static label: string = "qwqnt-poke";

    static setMuted(value: boolean) {
        Debug.muted = value;
    }

    static setLevel(value: MessageLevel) {
        Debug.level = value;
    }

    private static get tagLabel() {
        return `${colors.label}[${Debug.label}]${colors.reset}`;
    }

    private static tagI: string = `${colors.cyan}[I]`;
    private static tagS: string = `${colors.green}[S]`;
    private static tagW: string = `${colors.yellow}[W]`;
    private static tagE: string = `${colors.red}[E]`;

    static log(tag: string, message: any, ...args: any[]): void;
    static log(tag: string, level: MessageLevel, message: any, ...args: any[]): void;
    static log(tag: string, levelOrMsg: any, ...rest: any[]) {
        if (Debug.muted) return;

        let level: MessageLevel = MessageLevel.DEBUG;
        let args: any[];
        if (typeof levelOrMsg === "number") {
            level = levelOrMsg;
            args = rest;
        } else {
            args = [levelOrMsg, ...rest];
        }

        if (level > this.level) return;
        if (needsIpc()) {
            console.log(`[${Debug.label}] [I] [${tag}]`, ...args)
            const ipcArgs = processArgsForIpc(args);
            try {
                window.qwqntPoke.debugLog(`${Debug.tagLabel} ${Debug.tagI} [${tag}]`, ...ipcArgs, colors.reset);
            } catch (e) {}
        } else {
            console.log(`${Debug.tagLabel} ${Debug.tagI} [${tag}]`, ...args, colors.reset);
        }
    }

    static success(tag: string, ...args: any[]) {
        if (Debug.muted || MessageLevel.INFO > Debug.level) return;
        if (needsIpc()) {
            console.log(`[${Debug.label}] [I] [${tag}]`, ...args)
            const ipcArgs = processArgsForIpc(args);
            try {
                window.qwqntPoke.debugLog(`${Debug.tagLabel} ${Debug.tagS} [${tag}]`, ...ipcArgs, colors.reset);
            } catch (e) {}
        } else {
            console.log(`${Debug.tagLabel} ${Debug.tagS} [${tag}]`, ...args, colors.reset);
        }
    }

    static warn(tag: string, ...args: any[]) {
        if (Debug.muted || MessageLevel.INFO > Debug.level) return;
        if (needsIpc()) {
            console.warn(`[${Debug.label}] [W] [${tag}]`, ...args)
            const ipcArgs = processArgsForIpc(args);
            try {
                window.qwqntPoke.debugWarn(`${Debug.tagLabel} ${Debug.tagW} [${tag}]`, ...ipcArgs, colors.reset);
            } catch (e) {}
        } else {
            console.warn(`${Debug.tagLabel} ${Debug.tagW} [${tag}]`, ...args, colors.reset);
        }
    }

    static error(tag: string, ...args: any[]) {
        if (Debug.muted || MessageLevel.CRITICAL > Debug.level) return;
        if (needsIpc()) {
            console.error(`[${Debug.label}] [E] [${tag}]`, ...args)
            const ipcArgs = processArgsForIpc(args);
            try {
                window.qwqntPoke.debugError(`${Debug.tagLabel} ${Debug.tagE} [${tag}]`, ...ipcArgs, colors.reset);
            } catch (e) {}
        } else {
            console.error(`${Debug.tagLabel} ${Debug.tagE} [${tag}]`, ...args, colors.reset)
        }
    }
}