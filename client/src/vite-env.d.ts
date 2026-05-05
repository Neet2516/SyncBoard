/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_WS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'quill' {
  export interface RangeStatic {
    index: number
    length: number
  }

  export default class Quill {
    constructor(container: Element | string, options?: Record<string, unknown>)
    getFormat(index?: number, length?: number): Record<string, any>
    getSelection(focus?: boolean): RangeStatic | null
    format(name: string, value: any): void
    removeFormat(index: number, length: number): void
    focus(): void
  }
}
