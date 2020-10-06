import canvasShortcuts from './canvas.shortcuts'
import { extension } from './utils'

export default extension('canvas.shortcuts.order', (fabric) => {
  canvasShortcuts(fabric)

  function order(method: 'bringForward' | 'bringToFront' | 'sendToBack' | 'sendBackwards') {
    return function (canvas: fabric.Canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        object[method]()
        canvas.fire('object:modified', { target: object })
        canvas.requestRenderAll()
      }
    }
  }

  fabric.util.registerShortcut('arrowdown+ctrl', order('sendBackwards'))
  fabric.util.registerShortcut('arrowdown+shift+ctrl', order('sendToBack'))
  fabric.util.registerShortcut('arrowup+ctrl', order('bringForward'))
  fabric.util.registerShortcut('arrowup+shift+ctrl', order('bringToFront'))
})
