import canvasShortcuts from './canvas.shortcuts'
import { extension } from './utils'

export default extension('canvas.shortcuts.delete', (fabric) => {
  canvasShortcuts(fabric)

  function remove(canvas: fabric.Canvas) {
    const selected = canvas.getActiveObjects()
    canvas.remove(...selected)
    canvas.discardActiveObject()
  }

  fabric.util.registerShortcut('delete', remove)
  fabric.util.registerShortcut('backspace', remove)
})
