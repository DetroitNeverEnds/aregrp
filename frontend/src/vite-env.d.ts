/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
    readonly VITE_YANDEX_MAPS_API_KEY: string;
    readonly VITE_YANDEX_METRIKA_ID: string;
    readonly VITE_API_HOST: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

interface Window {
    ym: ((...args: unknown[]) => void) & {
        a?: unknown[][];
        l?: number;
    };
}
