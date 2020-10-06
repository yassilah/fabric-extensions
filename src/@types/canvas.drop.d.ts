import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      __registerShortcutsDropCallback(event: DragEvent): void
    }
  }
}
