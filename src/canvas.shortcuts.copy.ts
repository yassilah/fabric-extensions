import canvasExternalElements from './canvas.external-elements'
import canvasShortcuts from './canvas.shortcuts'
import { extendMethod, extension } from './utils'

export default extension('canvas.shortcuts.copy', (fabric) => {
  canvasShortcuts(fabric)
  canvasExternalElements(fabric)

  /**
   * The properties to exclude when copying.
   */
  fabric.excludeFromCopy = []

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
          'copy',
          (this.__registerShortcutsCopyCallback = this.__registerShortcutsCopyCallback.bind(this))
        )
        document.addEventListener(
          'paste',
          (this.__registerShortcutsPasteCallback = this.__registerShortcutsPasteCallback.bind(this))
        )
      }
    }),

    /**
     * Unregister the shortcuts.
     */
    __unregisterShortcuts: extendMethod(fabric.Canvas, '__unregisterShortcuts', function () {
      if (document) {
        document.removeEventListener('copy', this.__registerShortcutsCopyCallback)
        document.removeEventListener('paste', this.__registerShortcutsPasteCallback)
      }
    }),

    /**
     * Register the copy callback.
     *
     * @param event
     */
    __registerShortcutsCopyCallback(this: fabric.Canvas, event: ClipboardEvent) {
      if (document.activeElement === this.getElement() && event.clipboardData) {
        event.preventDefault()
        event.clipboardData.setData('fabric/json', JSON.stringify(this.__createCopy()))
      }
    },

    /**
     * Register the copy callback.
     *
     * @param event
     */
    __registerShortcutsPasteCallback(this: fabric.Canvas, event: ClipboardEvent) {
      if (document.activeElement === this.getElement() && event.clipboardData) {
        event.preventDefault()
        this.__insertExternalElements(event.clipboardData)
      }
    },

    /**
     * Create a copy of the selected elements.
     *
     * @return {object}
     */
    __createCopy(this: fabric.Canvas) {
      return this.getActiveObjects().map((object) => {
        const json = object.toJSON()

        if (object.group) {
          const { x, y } = fabric.util.transformPoint(
            new fabric.Point(json.left, json.top),
            object.group.calcTransformMatrix()
          )
          json.left = x
          json.top = y
        }

        fabric.excludeFromCopy.forEach((key) => {
          delete json[key]
        })

        return json
      })
    },
  })
})
