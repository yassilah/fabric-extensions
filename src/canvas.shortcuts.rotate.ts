import canvasShortcuts from './canvas.shortcuts'
import { extension } from './utils'

export default extension('canvas.shortcuts.rotate', (fabric) => {
  canvasShortcuts(fabric)

  function rotate(direction: 'left' | 'right', value: number) {
    const multiplier = direction === 'left' ? -1 : 1
    return function (canvas: fabric.Canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        const newValue = (object.angle || 0) + value * multiplier
        object.set('angle', newValue).setCoords()
        canvas.fire('object:modified', { target: object })
        canvas.requestRenderAll()
      }
    }
  }

  fabric.util.registerShortcut('shift+ctrl+arrowleft', rotate('left', 1))
  fabric.util.registerShortcut('alt+ctrl+shift+arrowleft', rotate('left', 10))
  fabric.util.registerShortcut('shift+ctrl+arrowright', rotate('right', 1))
  fabric.util.registerShortcut('alt+ctrl+shift+arrowright', rotate('right', 10))
})
