import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    let excludeFromCopy: string[]
    interface Canvas {
      __registerShortcutsCopyCallback(event: ClipboardEvent): void
      __registerShortcutsPasteCallback(event: ClipboardEvent): void
      __createCopy(): any
    }
  }
}
