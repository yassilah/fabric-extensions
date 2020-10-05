import { fabric } from 'fabric'
import { extendMethod } from './utils'

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      initialize(): this
      shortcuts: { [key: string]: (this: Canvas, event: KeyboardEvent) => void }
      __registerShortcuts(): void
      __unregisterShortcuts(): void
      __registerShortcutsCallback(event: KeyboardEvent): void
    }
  }
}

export function install(instance: typeof fabric) {
  if (!instance.Canvas.prototype.shortcuts) {
    instance.util.object.extend(instance.Canvas.prototype, {
      /**
       * List of shortcuts.
       */
      shortcuts: {},

      /**
       * @private
       */
      initialize: extendMethod(instance.Canvas, 'initialize', function () {
        this.__registerShortcuts()
      }),

      /**
       * @private
       */
      dispose: extendMethod(instance.Canvas, 'dispose', function () {
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
          const _keys = [
            event.ctrlKey || event.metaKey ? 'ctrl' : '',
            event.shiftKey ? 'shift' : '',
            event.altKey ? 'alt' : '',
            event.key,
          ]
            .filter((a) => a)
            .map((a) => a.toLowerCase())

          for (const shortcut in this.shortcuts) {
            const keys = shortcut
              .split('+')
              .filter((a) => a)
              .map((a) => a.toLowerCase())

            if (keys.length === _keys.length && keys.every((k) => _keys.includes(k))) {
              event.preventDefault()
              this.shortcuts[shortcut].call(this, event)
              break
            }
          }
        }
      },
    })
  }
}

if (window.fabric) {
  install(window.fabric)
}
