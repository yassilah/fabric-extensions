import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      initialize(): this
      shortcuts: { [key: string]: (this: Canvas, event: KeyboardEvent) => void }
      __registerShortcuts(): void
      __unregisterShortcuts(): void
      __registerShortcutsCallback(event: KeyboardEvent): void
    }
    interface IUtil {
      registerShortcut(
        keyCombination: string,
        callback: (canvas: Canvas, event: KeyboardEvent) => void
      ): void
      shortcuts: { [key: string]: (canvas: Canvas, event: KeyboardEvent) => void }
    }
  }
}
