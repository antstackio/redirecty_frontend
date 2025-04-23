/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CF_API_KEY: string;
  readonly VITE_CF_ACCOUNT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
