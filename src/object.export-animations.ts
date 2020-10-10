import { fabric } from 'fabric'
import { extendMethod, extension } from './utils'
import pick from 'lodash.pick'

export default extension('object.export-animations', (fabric) => {
  /**
   * ist of available animations.
   */
  fabric.animations = {}

  /**
   * Register a new animation.
   *
   * @param name
   * @param callback
   */
  fabric.util.registerAnimation = function (name, callback) {
    fabric.animations[name] = callback
  }

  /**
   * Extend object.
   */
  fabric.util.object.extend(fabric.Object.prototype, {
    /**
     * List of stored animations.
     */
    animations: [],

    /**
     * Whether the object is animated.
     */
    __isAnimated: false,

    /**
     * Extend the initialize function to register animations on initialization.
     *
     * @return {fabric.Object}
     */
    initialize: extendMethod(fabric.Object, 'initialize', function () {
      this.on('added', this.__setAnimationsProxy.bind(this))
    }),

    /**
     * Extend the initialize function to register animations on initialization.
     *
     * @return {fabric.Object}
     */
    render: (function (render: fabric.Object['render']) {
      return function (this: fabric.Object, ctx: CanvasRenderingContext2D) {
        if (this.__isAnimated) return this
        return render.call(this, ctx)
      }
    })(fabric.Object.prototype.render),

    /**
     * Set the animations array as a proxy  to automatically register
     * and unregister animations on array  changes.
     */
    __setAnimationsProxy(this: fabric.Object) {
      const callbacks: ((...args: any) => void)[] = []
      const animations: fabric.CustomAnimation<fabric.Object>[] = [...this.animations]

      this.animations = new Proxy(animations, {
        set: this.__animationsProxySetHandler.bind(this, callbacks),
        deleteProperty: this.__animationsProxyDeleteHandler.bind(this, callbacks),
      })

      this.animations.splice(0, animations.length, ...animations)
    },

    /**
     * Set handler for animations proxy.
     *
     * @param callbacks
     * @param animations
     * @param index
     * @param animation
     * @param receiver
     */
    __animationsProxySetHandler<T extends fabric.Object>(
      this: fabric.Object,
      callbacks: any[],
      animations: fabric.CustomAnimation<T>[],
      index: number,
      animation: fabric.CustomAnimation<T>,
      receiver: any
    ) {
      const value = Reflect.set(animations, index, animation, receiver)

      if (value && !this.canvas?.selection && !isNaN(index)) {
        this.__registerAnimation(callbacks, animation, index)
      }

      return value
    },

    /**
     * Regiter the animation.
     *
     * @param callbacks
     * @param animations
     * @param index
     */
    __registerAnimation(
      this: fabric.Object,
      callbacks: any[],
      animation: fabric.CustomAnimation<fabric.Object>,
      index: number
    ) {
      const options = fabric.animations[animation.name!]
        ? fabric.animations[animation.name!](this, animation)
        : animation

      this.canvas?.fire('object:modified', { target: this })

      callbacks[index] = this.__animate.call(this, options)

      if (animation.trigger || !this.canvas) {
        this.on(animation.trigger || 'added', callbacks[index])
      } else {
        callbacks[index]()
      }
    },

    /**
     * Delete handler for animations proxy.
     *
     * @param callbacks
     * @param animations
     * @param index
     */
    __animationsProxyDeleteHandler<T extends fabric.Object>(
      this: fabric.Object,
      callbacks: any[],
      animations: fabric.CustomAnimation<T>[],
      index: number
    ) {
      const animation = animations[index]
      const value = Reflect.deleteProperty(animations, index)

      if (value && !this.canvas?.selection && !isNaN(index)) {
        this.__unregisterAnimation(callbacks, animation, index)
      }

      return value
    },

    /**
     * Unregiter the animation.
     *
     * @param callbacks
     * @param animations
     * @param index
     */
    __unregisterAnimation(
      this: fabric.Object,
      callbacks: any[],
      animation: fabric.CustomAnimation<fabric.Object>,
      index: number
    ) {
      callbacks[index].abort = true
      this.off(animation.trigger, callbacks[index])
      this.canvas?.fire('object:modified', { target: this })
    },

    /**
     * Animate with a custom animation.
     *
     * @param animation
     */
    __animate<T extends fabric.Object>(this: fabric.Object, animation: fabric.CustomAnimation<T>) {
      const { from, to, duration = 1000, delay = 0, times, reverse } = animation

      const animate = (to: Partial<T>, ctx: fabric.AnimationCtx<T>) => {
        ctx.object.animate(fabric.util.object.clone(to), {
          abort: () => ctx.object.canvas?.selection || ctx.abort,
          duration: duration,
          easing: animation.easing
            ? fabric.util.ease[animation.easing]
            : (((t, b, c, d) => b + (t / d) * c) as fabric.IUtilAminEaseFunction),
          onChange: () => ctx.object.canvas?.requestRenderAll(),
          onComplete: () => {
            ctx.iteration++
            if (typeof times !== 'undefined') {
              if (times === 0 || ctx.iteration < times) {
                if (reverse) {
                  return animate(ctx.iteration % 2 === 0 ? ctx.to : ctx.from, ctx)
                } else {
                  ctx.object.set(ctx.from)
                  return animate(ctx.to, ctx)
                }
              }
            }

            if (animation.preserve) {
              this.set(to).setCoords()
            }

            this.__isAnimated = false
            this.canvas?.remove(ctx.object)?.requestRenderAll()
          },
        })
      }

      const ctx: any = () => {
        ctx.iteration = 0
        ctx.abort = false
        ctx.to = fabric.util.object.clone(to || {})
        ctx.from = fabric.util.object.clone(from || {})
        this.clone((object: fabric.Object) => {
          ctx.object = object
          ctx.object.animations = []
          ctx.object.visible = false
          ctx.object.excludeFromExport = true
          ctx.object.set(ctx.from)

          if (animation.originX) {
            ctx.object.originX = animation.originX
          }

          if (animation.originY) {
            ctx.object.originY = animation.originY
          }

          ctx.object.setPositionByOrigin(
            new fabric.Point(ctx.object.left, ctx.object.top),
            this.originX,
            this.originY
          )

          this.canvas?.add(ctx.object)

          setTimeout(() => {
            this.__isAnimated = true
            ctx.object.visible = true
            animate(ctx.to, ctx)
          }, delay)
        })
      }

      return ctx as fabric.AnimationCtx<T>
    },

    /**
     * Extend the toObject function to include the animations propeprty.
     *
     * @return {any}
     */
    toObject: extendMethod(fabric.Object, 'toObject', function (object: any) {
      object.animations = this.animations
      return object
    }),
  })
})

declare module 'fabric' {
  namespace fabric {
    let animations: {
      [key: string]: <T extends Object = Object>(
        object: T,
        animation: CustomAnimation<T>
      ) => CustomAnimation<T>
    }
    interface Object {
      __isAnimated: boolean
      animations: CustomAnimation<this>[]
      __beforeAnimation?: Partial<Object>
      __setAnimationsProxy(): void
      __animationsProxySetHandler(
        callbacks: any[],
        animations: CustomAnimation<this>[],
        index: number,
        animation: CustomAnimation<this>,
        receiver: any
      ): boolean
      __animationsProxyDeleteHandler(
        callbacks: any[],
        animations: CustomAnimation<this>[],
        index: number
      ): boolean
      __registerAnimation(callbacks: any[], animation: CustomAnimation<this>, index: number): void
      __unregisterAnimation(callbacks: any[], animation: CustomAnimation<this>, index: number): void
      __animate(animation: CustomAnimation<this>): void
    }
    interface CustomAnimation<T extends Object> {
      name?: string
      trigger?: 'mousedown' | 'mouseup' | 'mouseover' | 'dblclick' | 'tripleclick' | string
      data?: any
      from?: Partial<T>
      to?: Partial<T>
      delay?: number
      duration?: number
      times?: number
      reverse?: boolean
      preserve?: boolean
      easing?: keyof IUtil['ease']
      originX?: Object['originX']
      originY?: Object['originY']
    }
    interface IAnimationOptions {
      abort?(): boolean
    }
    interface AnimationCtx<T extends Object = Object> {
      (): void
      iteration: number
      abort: boolean
      from: Partial<T>
      to: Partial<T>
      object: T
    }
    interface IUtil {
      registerAnimation(
        name: string,
        callback: <T extends Object>(object: T, animation: CustomAnimation<T>) => CustomAnimation<T>
      ): void
    }
  }
}
