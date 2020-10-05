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
      ['alt+arrowright'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('angle', object.angle! + 1)
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['alt+arrowleft'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('angle', object.angle! - 1)
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['alt+arrowright+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('angle', object.angle! + 10)
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['alt+arrowleft+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('angle', object.angle! - 10)
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
