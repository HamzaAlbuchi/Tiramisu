/// <reference types="vite/client" />

declare module "*.woff2?url" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Set in public/api-config.js; overwritten at Docker container start from VITE_API_BASE_URL. */
  __TIRAMISU_API_BASE__?: string;
}
