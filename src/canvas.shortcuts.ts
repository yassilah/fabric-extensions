import { extendMethod, extension, normalizeEventKey, normalizeShortcutKey } from './utils'

export default extension('canvas.shortcuts', (fabric) => {
  /**
   * List of available shortcuts.
   */
  fabric.util.shortcuts = {}

  /**
   * Register shortcuts.
   * @param keyCombination R
   * @param callback
   */
  fabric.util.registerShortcut = function (
    keyCombination: string,
    callback: (canvas: fabric.Canvas, event: KeyboardEvent) => void
  ) {
    fabric.util.shortcuts[normalizeShortcutKey(keyCombination)] = callback
  }

  /**
   * Extend canvas.
   */
  fabric.util.object.extend(fabric.Canvas.prototype, {
    /**
     * @private
     */
    initialize: extendMethod(fabric.Canvas, 'initialize', function () {
      this.__registerShortcuts()
    }),

    /**
     * @private
     */
    dispose: extendMethod(fabric.Canvas, 'dispose', function () {
      this.__unregisterShortcuts()
    }),

    /**
     * Register the shortcuts.
     */
    __registerShortcuts(this: fabric.Canvas) {
      if (document) {
        document.addEventListener(
          'keydown',
          (this.__registerShortcutsCallback = this.__registerShortcutsCallback.bind(this))
        )
      }
    },

    /**
     * Unregister the shortcuts.
     */
    __unregisterShortcuts(this: fabric.Canvas) {
      if (document) {
        document.removeEventListener('keydown', this.__registerShortcutsCallback)
      }
    },

    /**
     * Register shortcuts callback.
     */
    __registerShortcutsCallback(this: fabric.Canvas, event: KeyboardEvent) {
      if (document.activeElement === this.getElement()) {
        const keys = normalizeEventKey(event)
        for (const shortcut in fabric.util.shortcuts) {
          if (shortcut === keys) {
            event.preventDefault()
            fabric.util.shortcuts[shortcut](this, event)
            break
          }
        }
      }
    },
  })
})

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
