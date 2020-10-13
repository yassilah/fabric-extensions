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
     * The corner color in editing mode.
     */
    cornerColorEditing: 'rgba(0,0,255,0.5)',

    /**
     * Tolerance distance from line to add a point.
     */
    toleranceFromLine: 10,

    /**
     * Initialize.
     */
    initialize: extendMethod(fabric.Polyline, 'initialize', function () {
      this.registerEditingEvents()
    }),

    /**
     * Register the editing events.
     */
    registerEditingEvents(this: fabric.Polyline) {
      this.on('mousedblclick', (event) => {
        if (!this._editingMode) {
          return this.enterEditingMode()
        } else if (event.absolutePointer && this._editingMode) {
          const point = this.toLocalPoint(event.absolutePointer, 'center', 'center').add(
            this.pathOffset
          )
          const index = this.__findCLosestPointIndex(point, this.toleranceFromLine)!
          if (index > -1) {
            return this.addPoint(point, index + 1)
          }
        }
        this.exitEditingMode()
      })
      this.on('mousedown', (event) => {
        this._editingMode && this.removePoint(event)
      })
      this.on('deselected', () => {
        this.exitEditingMode()
      })
    },

    /**
     * Enter the editing mode.
     */
    enterEditingMode(this: fabric.Polyline) {
      if (this.selectable && this.points && this.canvas) {
        this._editingMode = true

        this.__defaultControlOptions = {
          controls: this.controls,
          hasBorders: this.hasBorders,
          cornerStyle: this.cornerStyle,
          cornerColor: this.cornerColor,
        }

        this.__defaultFireClicks = {
          right: this.canvas.fireRightClick,
          middle: this.canvas.fireMiddleClick,
          contextMenu: this.canvas.stopContextMenu,
        }

        this.canvas.fireRightClick = true
        this.canvas.fireMiddleClick = true
        this.canvas.stopContextMenu = true

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
      if (this.selectable && this.canvas) {
        this._editingMode = false
        this.canvas.fireRightClick = this.__defaultFireClicks.right
        this.canvas.fireMiddleClick = this.__defaultFireClicks.middle
        this.canvas.stopContextMenu = this.__defaultFireClicks.contextMenu
        this.set(this.__defaultControlOptions)
        this.fire('exit:editing', { target: this })
        this.canvas?.requestRenderAll()
      }
    },

    /**
     * Remove point if in editing mode.
     *
     * @param event
     */
    removePoint(this: fabric.Polyline, event: fabric.IEvent) {
      if (this._editingMode) {
        const e = event.e as MouseEvent
        if ((e.button === 3 || e.button === 2) && this.points && this.points.length > 2) {
          const corner = event.target?.__corner
          if (corner) {
            const index = Number(corner)
            if (this.points?.[index]) {
              delete this.controls[corner]
              this.points.splice(index, 1)
              this.__editingPositionAfter(index)
              this.canvas?.requestRenderAll()
            }
          }
        }
      }
    },

    /**
     * Add point if in editing mode.
     *
     * @param event
     */
    addPoint(this: fabric.Polyline, point: fabric.Point, index: number) {
      if (this._editingMode && this.points) {
        this.points.splice(index, 0, point)
        this.controls = this.__editingControls()
        this.canvas?.requestRenderAll()
      }
    },

    /**
     * Find the closest point index compared to given point.
     *
     * @param point
     * @param tolerance
     */
    __findCLosestPointIndex(this: fabric.Polyline, point: fabric.Point, tolerance: number = 0) {
      if (this.points && this.canvas) {
        return this.points.slice(0, -1).findIndex((start, index) => {
          const end = this.points![index + 1]

          const a = () =>
            Math.abs(
              (point.y - end.y) * start.x -
                (point.x - end.x) * start.y +
                point.x * end.y -
                point.y * end.x
            ) / Math.sqrt(Math.pow(point.y - end.y, 2) + Math.pow(point.x - end.x, 2))

          const b = () =>
            (point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)

          const c = () =>
            (end.x - start.x) * (end.x - start.x) + (end.y - start.y) * (end.y - start.y)

          return !(a() > tolerance || b() < 0 || b() > c())
        })
      }
    },

    /**
     * Create the editing controls.
     */
    __editingControls(this: fabric.Polyline) {
      return this.points!.reduce((all, point, index) => {
        all[index] = this.__createEditingControl(point)
        return all
      }, {} as { [key: string]: any })
    },

    /**
     * Create a control point.
     *
     * @param point
     */
    __createEditingControl(this: fabric.Polyline, point: fabric.Point) {
      return new fabric.Control({
        positionHandler: this.__editingControlPositionHandler.bind(this, point),
        actionHandler: this.__editingActionHandler.bind(this, point),
        actionName: `edit_${this.type}`,
      })
    },

    /**
     * Create a control position handler for
     * the given point.
     *
     * @param point
     */
    __editingControlPositionHandler(this: fabric.Polyline, point: fabric.Point) {
      const x = point.x - this.pathOffset.x
      const y = point.y - this.pathOffset.y

      return fabric.util.transformPoint(
        new fabric.Point(x, y),
        fabric.util.multiplyTransformMatrices(
          this.canvas!.viewportTransform!,
          this.calcTransformMatrix()
        )
      )
    },

    /**
     * Create a action handler for
     * the given point index.
     *
     * @param index
     */
    __editingActionHandler(
      this: fabric.Polyline,
      point: fabric.Point,
      event: MouseEvent,
      transform: any,
      x: number,
      y: number
    ) {
      const index = this.points!.indexOf(point)
      const local = this.toLocalPoint(new fabric.Point(x, y), 'center', 'center')
      const size = this._getTransformedDimensions(0, 0)
      const base = this._getNonTransformedDimensions()
      point.x = (local.x * base.x) / size.x + this.pathOffset.x
      point.y = (local.y * base.y) / size.y + this.pathOffset.y
      this.__editingPositionAfter(index)
      return true
    },

    /**
     * Reset the positon after editing points.
     *
     * @param point
     */
    __editingPositionAfter(this: fabric.Polyline, index: number) {
      const points = this.points!
      const cornerIndex = index > 0 ? index - 1 : points.length - 1
      const cornerPoint = points[cornerIndex]
      const absolute = fabric.util.transformPoint(
        new fabric.Point(cornerPoint.x - this.pathOffset.x, cornerPoint.y - this.pathOffset.y),
        this.calcTransformMatrix()
      )
      this._setPositionDimensions({})
      const newBase = this._getNonTransformedDimensions()
      const newX = (cornerPoint.x - this.pathOffset.x) / newBase.x
      const newY = (cornerPoint.y - this.pathOffset.y) / newBase.y
      this.setPositionByOrigin(absolute, newX + 0.5, newY + 0.5)
      this.dirty = true
    },
  })
})

declare module 'fabric' {
  namespace fabric {
    interface Object {
      __corner: string | undefined
      controls: { [key: string]: Control }
    }
    interface IUtil {
      isTouchEvent(event: Event): boolean
      getPointer(event: Event, a?: any): Point
    }
    interface Polyline {
      _editingMode: boolean
      toleranceFromLine: number
      registerEditingEvents(): void
      enterEditingMode(): void
      exitEditingMode(): void
      addPoint(point: Point, index: number): void
      removePoint(event: IEvent): void
      hasBordersEditing: Object['hasBorders']
      cornerStyleEditing: Object['cornerStyle']
      cornerColorEditing: Object['cornerColor']
      __defaultFireClicks: {
        right: Canvas['fireRightClick']
        middle: Canvas['fireMiddleClick']
        contextMenu: Canvas['stopContextMenu']
      }
      __defaultControlOptions: {
        controls: Object['controls']
        hasBorders: Object['hasBorders']
        cornerStyle: Object['cornerStyle']
        cornerColor: Object['cornerColor']
      }
      _setPositionDimensions(options: any): void
      __createEditingControl(point: Point): Control
      __editingControls(): { [key: string]: Control }
      __editingControlPositionHandler(
        point: Point
      ): ReturnType<Exclude<IControlOptions['positionHandler'], undefined>>
      __editingActionHandler(
        point: Point,
        eventData: MouseEvent,
        transform: any,
        x: number,
        y: number
      ): ReturnType<Exclude<IControlOptions['actionHandler'], undefined>>
      __editingPositionAfter(index: number): void
      __findCLosestPointIndex(point: Point, tolerance?: number): number | undefined
      setPositionByOrigin(point: Point, originX: string | number, originY: string | number): void
      controls: { [key: string]: Control }
    }
    class Control {
      constructor(options: IControlOptions)
      visible: boolean
      actionName: string
      angle: number
      x: number
      y: number
      offsetX: number
      offsetY: number
      cursorStyle: string
      withConnection: boolean
      actionHandler: (event: MouseEvent, transformData: any, x: number, y: number) => Function
      mouseDownHandler: (event: MouseEvent, transformData: any, object: Object) => any
      mouseUpHandler: (event: MouseEvent, transformData: any, object: Object) => any
    }
    interface IControlOptions extends Partial<Control> {
      getActionHandler?: (event: MouseEvent, transformData: any) => Function
      getMouseDownHandler?: (
        event: MouseEvent,
        transformData: any,
        object: Object
      ) => Function | undefined
      getMouseUpHandler?: (
        event: MouseEvent,
        transformData: any,
        object: Object
      ) => Function | undefined
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
