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
      arrowleft(this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('left', object.left! - 1).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      arrowright(this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('left', object.left! + 1).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      arrowup(this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('top', object.top! - 1).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      arrowdown(this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('top', object.top! + 1).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['arrowleft+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('left', object.left! - 10).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['arrowright+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('left', object.left! + 10).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['arrowup+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('top', object.top! - 10).setCoords()
          this.fire('object:modified', { target: null })
          this.requestRenderAll()
        }
      },
      ['arrowdown+shift'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object) {
          object.set('top', object.top! + 10).setCoords()
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
