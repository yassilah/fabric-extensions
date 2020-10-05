import { fabric } from 'fabric'
import { CustomAnimation, IUtilAminEaseFunction } from 'fabric/fabric-impl'
import pick from 'lodash.pick'
import { extendMethod } from './utils'

declare module 'fabric' {
  namespace fabric {
    let animations: {
      [key: string]: <T extends Object = Object>(
        this: T,
        object: T,
        animation: CustomAnimation<T>
      ) => CustomAnimation<any>
    }
    interface Object {
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
      __storeOriginal(animation: CustomAnimation<this>): this
      __restoreOriginal(object: Object): this
    }
    interface IObjectOptions {
      animations?: CustomAnimation<any>[]
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
    }
  }
}

export function install(instance: typeof fabric) {
  instance.animations = {}

  instance.util.object.extend(instance.Object.prototype, {
    /**
     * List of stored animations.
     */
    animations: [],

    /**
     * Extend the initialize function to register animations on initialization.
     *
     * @return {fabric.Object}
     */
    initialize: extendMethod(instance.Object, 'initialize', function () {
      this.on('added', this.__setAnimationsProxy.bind(this))
    }),

    /**
     * Set the animations array as a proxy  to automatically register
     * and unregister animations on array  changes.
     */
    __setAnimationsProxy(this: fabric.Object) {
      const callbacks: ((...args: any) => void)[] = []
      const animations: CustomAnimation<fabric.Object>[] = [...this.animations]

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
      callbacks: any[],
      animations: CustomAnimation<T>[],
      index: number,
      animation: CustomAnimation<T>,
      receiver: any
    ) {
      if (!isNaN(index)) {
        const options = instance.animations[animation.name!]
          ? instance.animations[animation.name!](this, animation)
          : animation

        this.canvas?.fire('object:modified', { target: this })

        callbacks[index] = this.__animate.call(this, options)

        if (animation.trigger || !this.canvas) {
          this.on(animation.trigger || 'added', callbacks[index])
        } else {
          callbacks[index]()
        }
      }

      return Reflect.set(animations, index, animation, receiver)
    },

    /**
     * Delete handler for animations proxy.
     *
     * @param callbacks
     * @param animations
     * @param index
     */
    __animationsProxyDeleteHandler<T extends fabric.Object>(
      callbacks: any[],
      animations: CustomAnimation<T>[],
      index: number
    ) {
      if (!isNaN(index)) {
        callbacks[index].abort = true
        if (callbacks[index].from) {
          this.set(callbacks[index].from).canvas?.requestRenderAll()
        }

        this.off(animations[index].trigger, callbacks[index])
        this.canvas?.fire('object:modified', { target: this })
      }

      return Reflect.deleteProperty(animations, index)
    },

    /**
     * Animate with a custom animation.
     *
     * @param animation
     */
    __animate<T extends fabric.Object>(this: fabric.Object, animation: fabric.CustomAnimation<T>) {
      const { from, to, duration = 1000, delay = 0, times, reverse } = animation
      const object = this

      const animate = (to: Partial<T>, ctx: fabric.AnimationCtx<T>) => {
        this.animate(fabric.util.object.clone(to), {
          abort: () => this.canvas?.selection || ctx.abort,
          duration: duration,
          easing: animation.easing
            ? fabric.util.ease[animation.easing]
            : (((t, b, c, d) => b + (t / d) * c) as fabric.IUtilAminEaseFunction),
          onChange: this.canvas?.requestRenderAll.bind(this.canvas),
          onComplete: () => {
            ctx.iteration++
            if (typeof times !== 'undefined') {
              if (times === 0 || ctx.iteration < times) {
                if (reverse) {
                  animate(ctx.iteration % 2 === 0 ? ctx.to : ctx.from, ctx)
                } else {
                  object.set(ctx.from)
                  animate(ctx.to, ctx)
                }
              }
            }
          },
        })
      }

      const ctx: any = () => {
        ctx.iteration = 0
        ctx.abort = false
        ctx.to = fabric.util.object.clone(to || {})
        ctx.from = fabric.util.object.clone(from || pick(this, ...Object.keys(to || {})))
        object.__storeOriginal(animation)

        setTimeout(() => {
          object.set(ctx.from)
          animate(ctx.to, ctx)
        }, delay)
      }

      return ctx as fabric.AnimationCtx<T>
    },

    /**
     *  Store the original original originX and origin Y
     * of the current object to enable it just for the animation
     * and restore on JSON export.
     *
     * @param animation
     */
    __storeOriginal<T extends fabric.Object>(this: T, animation: fabric.CustomAnimation<T>) {
      this.__beforeAnimation = this.__beforeAnimation || pick(this, 'originX', 'originY', 'angle')

      if (animation.originX || animation.originY) {
        const { x, y } = this.translateToGivenOrigin(
          new fabric.Point(this.left!, this.top!),
          this.__beforeAnimation.originX!,
          this.__beforeAnimation.originY!,
          animation.originX || this.originX!,
          animation.originY || this.originY!
        )
        this.left = x
        this.top = y
        this.originX = animation.originX || this.originX!
        this.originY = animation.originY || this.originY!
      }

      return this
    },

    /**
     * Retore the original original originX and origin Y.
     *
     * @param object
     */
    __restoreOriginal<T extends fabric.Object>(this: T, object: T) {
      if (this.__beforeAnimation?.angle) {
        this.angle = object.angle = this.__beforeAnimation?.angle
      }

      if (this.__beforeAnimation?.originX || this.__beforeAnimation?.originY) {
        const { x, y } = this.translateToGivenOrigin(
          new fabric.Point(object.left!, object.top!),
          object.originX!,
          object.originY!,
          this.__beforeAnimation.originX || object.originX!,
          this.__beforeAnimation.originY || object.originY!
        )
        object.left = x
        object.top = y
        object.originX = this.__beforeAnimation.originX || object.originX
        object.originY = this.__beforeAnimation.originY || object.originY
      }

      return this
    },

    /**
     * Extend the toObject function to include the animations propeprty.
     *
     * @return {any}
     */
    toObject: extendMethod(instance.Object, 'toObject', function (object: any) {
      object.animations = this.animations
      this.__restoreOriginal(object)

      return object
    }),
  })
}

if (window.fabric) {
  install(window.fabric)
}
