/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SEI_CHAIN_ID: string
  readonly VITE_SOLANA_NETWORK: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 