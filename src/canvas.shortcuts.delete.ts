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
      delete(this: fabric.Canvas) {
        const selected = this.getActiveObjects()
        this.remove(...selected)
        this.discardActiveObject()
      },
      backspace(this: fabric.Canvas) {
        const selected = this.getActiveObjects()
        this.remove(...selected)
        this.discardActiveObject()
      },
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
