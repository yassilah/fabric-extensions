import { fabric } from 'fabric'
import { extendMethod } from './utils'
// @ts-ignore
import initCenteringGuidelines from 'fabric/lib/centering_guidelines'
// @ts-ignore
import initAligningGuidelines from 'fabric/lib/aligning_guidelines'

export function install(instance: typeof fabric) {
  instance.util.object.extend(instance.Canvas.prototype, {
    initialize: extendMethod(instance.Canvas, 'initialize', function () {
      initAligningGuidelines(this)
      initCenteringGuidelines(this)
    }),
    setDimensions: extendMethod(instance.Canvas, 'setDimensions', function () {
      this.fire('after:dimensions', {})
    }),
    setZoom: extendMethod(instance.Canvas, 'setZoom', function () {
      this.fire('after:dimensions', {})
    }),
  })
}

if (window.fabric) {
  install(window.fabric)
}
