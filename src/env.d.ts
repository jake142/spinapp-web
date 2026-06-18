/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_COUNTER_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
