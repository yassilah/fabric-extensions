import { IEvent, IPolylineOptions } from 'fabric/fabric-impl'
import { extendMethod, extension } from './utils'

export default extension('polyline.controls', (fabric) => {
  fabric.util.object.extend(fabric.Polyline.prototype, {
    /**
     * Is in editing mode.
     */
    _editingMode: false,

    /**
     * Whether borders should be visible in editing mode.
     */
    hasBordersEditing: false,

    /**
     * The type of corner style in editing mode.
     */
    cornerStyleEditing: 'circle',

    /**
     * The type of corner style in editing mode.
     */
    cornerColorEditing: 'rgba(0,0,255,0.5)',

    /**
     * Initialize.
     */
    initialize: extendMethod(fabric.Polyline, 'initialize', function () {
      this.on('mousedblclick', () => {
        this.toggleEditingMode()
      })
      this.on('deselected', () => {
        this.exitEditingMode()
      })
      this.on('moving', this.__onMoving())
      this.on('scaling', this.__onScaling())
    }),

    /**
     * Toggle the editing mode.
     */
    toggleEditingMode(this: fabric.Polyline) {
      if (!this._editingMode) {
        this.enterEditingMode()
      } else {
        this.exitEditingMode()
      }
    },

    /**
     * Enter the editing mode.
     */
    enterEditingMode(this: fabric.Polyline) {
      if (this.selectable && this.points) {
        this._editingMode = true

        this.__defaultControlOptions = {
          controls: this.controls,
          hasBorders: this.hasBorders,
          cornerStyle: this.cornerStyle,
          cornerColor: this.cornerColor,
        }

        this.set({
          controls: this.__editingControls(),
          hasBorders: this.hasBordersEditing,
          cornerStyle: this.cornerStyleEditing,
          cornerColor: this.cornerColorEditing,
        })

        this.fire('enter:editing', { target: this })
        this.canvas?.requestRenderAll()
      }
    },

    /**
     * Exit the editing mode.
     */
    exitEditingMode(this: fabric.Polyline) {
      if (this.selectable) {
        this._editingMode = false
        this.set(this.__defaultControlOptions)
        this._setPositionDimensions({})
        this.setCoords()
        this.fire('exit:editing', { target: this })
        this.canvas?.requestRenderAll()
      }
    },

    /**
     * Update the coords after moving the shape.
     */
    __onMoving(this: fabric.Polyline) {
      let prevLeft = this.left!
      let prevTop = this.top!
      return () => {
        const diffX = prevLeft - this.left!
        const diffY = prevTop - this.top!
        prevLeft = this.left!
        prevTop = this.top!
        this.points?.forEach((point) => {
          point.x -= diffX
          point.y -= diffY
        })
        this._setPositionDimensions({})
        this.setCoords()
      }
    },

    /**
     * Update the coords after scaling the shape.
     */
    __onScaling(this: fabric.Polyline) {
      return () => {
        // TO DO
      }
    },

    /**
     * Create the editing controls.
     */
    __editingControls(this: fabric.Polyline) {
      return this.points!.reduce((all, point, index, array) => {
        all[`point_${index}`] = new fabric.Control({
          positionHandler: this.__editingControlPositionHandler(index),
          actionHandler: this.__editingActionHandler(index),
          actionName: `edit_${this.type}`,
        })
        return all
      }, {} as { [key: string]: any })
    },

    /**
     * Create a control position handler for
     * the given point index.
     *
     * @param index
     */
    __editingControlPositionHandler(this: fabric.Polyline, index: number) {
      return () => {
        const x = this.points![index].x - this.pathOffset.x
        const y = this.points![index].y - this.pathOffset.y
        return fabric.util.transformPoint(
          new fabric.Point(x, y),
          fabric.util.multiplyTransformMatrices(
            this.canvas!.viewportTransform!,
            this.calcTransformMatrix()
          )
        )
      }
    },

    /**
     * Create a action handler for
     * the given point index.
     *
     * @param index
     */
    __editingActionHandler(this: fabric.Polyline, index: number) {
      return (event: Event, transform: any, x: number, y: number) => {
        const local = this.toLocalPoint(new fabric.Point(x, y), 'center', 'center')
        this.points![index] = new fabric.Point(
          local.x + this.pathOffset.x,
          local.y + this.pathOffset.y
        )
        this._setPositionDimensions({})
        this.setCoords()
        this.dirty = true

        return true
      }
    },
  })
})

declare module 'fabric' {
  namespace fabric {
    interface Object {
      controls: { [key: string]: Control }
    }
    interface Polyline {
      _editingMode: boolean
      toggleEditingMode(): void
      enterEditingMode(): void
      exitEditingMode(): void
      hasBordersEditing: Object['hasBorders']
      cornerStyleEditing: Object['cornerStyle']
      cornerColorEditing: Object['cornerColor']
      __defaultControlOptions: {
        controls: Object['controls']
        hasBorders: Object['hasBorders']
        cornerStyle: Object['cornerStyle']
        cornerColor: Object['cornerColor']
      }
      __onScaling(): (e: IEvent) => void
      __onMoving(): (e: IEvent) => void
      _setPositionDimensions(options: any): void
      __editingControls(): { [key: string]: Control }
      __editingControlPositionHandler(index: number): IControlOptions['positionHandler']
      __editingActionHandler(index: number): IControlOptions['actionHandler']
      setPositionByOrigin(point: Point, originX: string | number, originY: string | number): void
      controls: { [key: string]: Control }
    }
    class Control {
      constructor(options: IControlOptions)
    }
    interface IControlOptions {
      visible?: boolean
      actionName?: string
      angle?: number
      x?: number
      y?: number
      offsetX?: number
      offsetY?: number
      cursorStyle?: string
      withConnection?: boolean
      actionHandler?: (event: MouseEvent, transformData: any, x: number, y: number) => Function
      mouseDownHandler?: (event: MouseEvent, transformData: any, object: Object) => Function
      mouseUpHandler?: (event: MouseEvent, transformData: any, object: Object) => Function
      getActionHandler?: (event: MouseEvent, transformData: any) => Function
      getMouseDownHandler?: (event: MouseEvent, transformData: any, object: Object) => Function
      getMouseUpHandler?: (event: MouseEvent, transformData: any, object: Object) => Function
      cursorStyleHandler?: (event: MouseEvent, transformData: any, object: Object) => string
      getActionName?: (event: MouseEvent, transformData: any, object: Object) => string
      getVisibility?: (event: MouseEvent, transformData: any, object: Object) => boolean
      setVisibility?: (visibility: boolean) => void
      positionHandler?: (dimenions: any, matrix: any, object: Object, control: Control) => Point
      render?: (
        ctx: CanvasRenderingContext2D,
        left: number,
        top: number,
        style: IObjectOptions,
        object: Object
      ) => void
    }
  }
}
