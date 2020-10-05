import { fabric } from 'fabric'
import { canvasShortcuts, canvasExternalElements } from '.'
import { extendMethod } from './utils'

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      __registerShortcutsDropCallback(event: DragEvent): void
    }
  }
}

export function install(instance: typeof fabric) {
  canvasShortcuts(instance)
  canvasExternalElements(instance)

  instance.util.object.extend(instance.Canvas.prototype, {
    /**
     * Register the shortcuts.
     */
    __registerShortcuts: extendMethod(instance.Canvas, '__registerShortcuts', function () {
      if (document) {
        document.addEventListener(
          'drop',
          (this.__registerShortcutsDropCallback = this.__registerShortcutsDropCallback.bind(this))
        )
      }
    }),

    /**
     * Unregister the shortcuts.
     */
    __unregisterShortcuts: extendMethod(instance.Canvas, '__unregisterShortcuts', function () {
      if (document) {
        document.removeEventListener('drop', this.__registerShortcutsDropCallback)
      }
    }),

    /**
     * Register the copy callback.
     *
     * @param event
     */
    __registerShortcutsDropCallback(this: fabric.Canvas, event: DragEvent) {
      if (
        [this.getElement(), this.getSelectionElement()].includes(event.target as any) &&
        event.dataTransfer
      ) {
        event.preventDefault()
        this.__insertExternalElements(event.dataTransfer)
      }
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
