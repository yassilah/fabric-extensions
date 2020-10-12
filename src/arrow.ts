import { fabric } from 'fabric'
import { extendMethod, extension } from './utils'

export default extension('arrow', (fabric) => {
  /**
   * Create the icon class.
   */
  fabric.Arrow = fabric.util.createClass(fabric.Polyline, {
    /**
     * Type of shape.
     */
    type: 'arrow',

    /**
     * Size of the arrow
     */
    arrowSize: 20,

    /**
     * Whether the arrow should be drawn at the end
     * of the line.
     */
    endArrow: true,

    /**
     * Whether the arrow should be drawn at the beginning
     * of the line.
     *
     */
    startArrow: false,

    /**
     * Render the arrow.
     */
    _render: (function (_render: fabric.Arrow['_render']) {
      return function (this: fabric.Arrow, ctx: CanvasRenderingContext2D) {
        const fill = this.fill

        this.fill = ''
        _render.call(this, ctx)
        this.fill = fill

        if (this.points) {
          const { x, y } = this.pathOffset

          if (this.endArrow) {
            const { x: x2, y: y2 } = this.points[this.points.length - 1]
            const { x: x1, y: y1 } = this.points[this.points.length - 2] || [0, 0]
            const angle = Math.atan2(y2 - y1, x2 - x1)
            ctx.save()
            ctx.translate(x2 - x, y2 - y)
            ctx.beginPath()
            ctx.rotate(angle)
            ctx.moveTo(-this.arrowSize, 0)
            ctx.lineTo(-this.arrowSize, this.arrowSize)
            ctx.lineTo(0, 0)
            ctx.lineTo(-this.arrowSize, -this.arrowSize)
            ctx.lineTo(-this.arrowSize, 0)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
            ctx.restore()
          }

          if (this.startArrow) {
            const { x: x2, y: y2 } = this.points[0]
            const { x: x1, y: y1 } = this.points[1] || [0, 0]
            const angle = Math.atan2(y2 - y1, x2 - x1)
            ctx.save()
            ctx.translate(x2 - x, y2 - y)
            ctx.beginPath()
            ctx.rotate(angle)
            ctx.moveTo(-this.arrowSize, 0)
            ctx.lineTo(-this.arrowSize, this.arrowSize)
            ctx.lineTo(0, 0)
            ctx.lineTo(-this.arrowSize, -this.arrowSize)
            ctx.lineTo(-this.arrowSize, 0)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
            ctx.restore()
          }
        }
      }
    })(fabric.Polyline.prototype._render),

    /**
     * Add some padding to the dimensions to
     * include the arrow size.
     */
    _setPositionDimensions: extendMethod(fabric.Polyline, '_setPositionDimensions', function (
      this: any
    ) {
      this.width += this.arrowSize * 1.5
      this.height += this.arrowSize * 1.5
    }),

    /**
     * To object.
     */
    toObject(propertiesToInclude: string[] = []) {
      const object = this.callSuper(
        'toObject',
        propertiesToInclude.concat('arrowSize', 'startArrow', 'endArrow')
      )
      return object
    },
  })

  /**
   * From object.
   *
   * @param object
   * @param callback
   */
  fabric.Arrow.fromObject = function (object: fabric.IArrowOptions, callback?: Function) {
    const arrow = new fabric.Arrow(object.points || [], object)
    if (callback) callback(arrow)
    return arrow
  }
})

declare module 'fabric' {
  namespace fabric {
    class Arrow extends Polyline {
      arrowSize: number
      endArrow: boolean
      startArrow: boolean
    }
    interface IArrowOptions extends IPolylineOptions {
      arrowSize?: number
      endArrow?: boolean
      startArrow?: boolean
    }
  }
}
