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
      ['ctrl+a'](this: fabric.Canvas) {
        const selection = new instance.ActiveSelection(this.getObjects(), {
          canvas: this,
        })
        this.setActiveObject(selection).requestRenderAll()
      },
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
