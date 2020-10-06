import canvasShortcuts from './canvas.shortcuts'
import { extension } from './utils'

export default extension('canvas.shortcuts.move', (fabric) => {
  canvasShortcuts(fabric)

  function move(direction: 'left' | 'up' | 'right' | 'down', value: number) {
    const prop = ['left', 'right'].includes(direction) ? 'left' : ('top' as keyof fabric.Object)
    const multiplier = ['left', 'up'].includes(direction) ? -1 : 1

    return function (canvas: fabric.Canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        const newValue = object[prop] + value * multiplier
        object.set(prop, newValue).setCoords()
        canvas.fire('object:modified', { target: object })
        canvas.requestRenderAll()
      }
    }
  }

  fabric.util.registerShortcut('arrowleft', move('left', 1))
  fabric.util.registerShortcut('arrowleft+shift', move('left', 10))
  fabric.util.registerShortcut('arrowright', move('right', 1))
  fabric.util.registerShortcut('arrowright+shift', move('right', 10))
  fabric.util.registerShortcut('arrowup', move('up', 1))
  fabric.util.registerShortcut('arrowup+shift', move('up', 10))
  fabric.util.registerShortcut('arrowdown', move('down', 1))
  fabric.util.registerShortcut('arrowdown+shift', move('down', 10))
})
