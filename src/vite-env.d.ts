/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_VERSION?: string;
    readonly VITE_ENVIRONMENT?: 'mainnet' | 'testnet' | 'devnet';
    readonly VITE_DEV_ADDRESS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
