import { extendMethod, extension } from './utils'
// @ts-ignore
import initCenteringGuidelines from 'fabric/lib/centering_guidelines'
// @ts-ignore
import initAligningGuidelines from 'fabric/lib/aligning_guidelines'

export default extension('canvas.guidelines', (fabric) => {
  fabric.util.object.extend(fabric.Canvas.prototype, {
    initialize: extendMethod(fabric.Canvas, 'initialize', function () {
      initAligningGuidelines(this)
      initCenteringGuidelines(this)
    }),
    setDimensions: extendMethod(fabric.Canvas, 'setDimensions', function () {
      this.fire('after:dimensions', {})
    }),
    setZoom: extendMethod(fabric.Canvas, 'setZoom', function () {
      this.fire('after:dimensions', {})
    }),
  })
})
