import canvasShortcuts from './canvas.shortcuts'
import { extension } from './utils'

export default extension('canvas.shortcuts.select-all', (fabric) => {
  canvasShortcuts(fabric)

  fabric.util.registerShortcut('ctrl+a', function (canvas: fabric.Canvas) {
    const selection = new fabric.ActiveSelection(canvas.getObjects(), { canvas })
    canvas.setActiveObject(selection).requestRenderAll()
  })
})
