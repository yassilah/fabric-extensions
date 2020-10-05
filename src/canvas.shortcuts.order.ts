import { fabric } from 'fabric'
import { canvasShortcuts } from '.'

export function install(instance: typeof fabric) {
  canvasShortcuts(instance)

  instance.util.object.extend(instance.Canvas.prototype, {
    /**
     * List of shortcuts.
     */
    shortcuts: {
      ...instance.Canvas.prototype.shortcuts,
      ['ctrl+arrowup+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.bringToFront()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['ctrl+arrowdown+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.sendBackwards()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['arrowup+ctrl'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.bringForward()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['arrowdown+ctrl'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.sendToBack()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
