import canvasShortcuts from './canvas.shortcuts'
import { extension } from './utils'

export default extension('canvas.shortcuts.group', (fabric) => {
  canvasShortcuts(fabric)

  function group(canvas: fabric.Canvas) {
    const object = canvas.getActiveObject()
    if (object instanceof fabric.ActiveSelection) {
      object.toGroup()
    } else if (object instanceof fabric.Group) {
      const objects = object.getObjects()
      object._restoreObjectsState()
      canvas.remove(object)
      canvas.add(...objects)
      canvas.setActiveObject(new fabric.ActiveSelection(objects, { canvas: canvas }))
      canvas.requestRenderAll()
    }
  }

  fabric.util.registerShortcut('ctrl+g', group)
})
