/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REOWN_PROJECT_ID?: string;
  readonly VITE_ZEC_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
