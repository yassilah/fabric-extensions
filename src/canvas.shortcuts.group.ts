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
      ['ctrl+g'](this: fabric.Canvas) {
        const object = this.getActiveObject()
        if (object instanceof instance.ActiveSelection) {
          object.toGroup()
        } else if (object instanceof instance.Group) {
          const objects = object.getObjects()
          object._restoreObjectsState()
          this.remove(object)
          this.add(...objects)
          this.setActiveObject(new instance.ActiveSelection(objects, { canvas: this }))
          this.requestRenderAll()
        }
      },
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
