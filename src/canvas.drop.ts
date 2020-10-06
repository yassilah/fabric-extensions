import canvasExternalElements from './canvas.external-elements'
import canvasShortcuts from './canvas.shortcuts'
import { extendMethod, extension } from './utils'

export default extension('canvas.drop', (fabric) => {
  canvasShortcuts(fabric)
  canvasExternalElements(fabric)

  /**
   * Extend canvas.
   */
  fabric.util.object.extend(fabric.Canvas.prototype, {
    /**
     * Register the shortcuts.
     */
    __registerShortcuts: extendMethod(fabric.Canvas, '__registerShortcuts', function () {
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
    __unregisterShortcuts: extendMethod(fabric.Canvas, '__unregisterShortcuts', function () {
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
})

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      __registerShortcutsDropCallback(event: DragEvent): void
    }
  }
}
