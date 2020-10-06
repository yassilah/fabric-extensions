import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    let animations: {
      [key: string]: <T extends Object = Object>(
        object: T,
        animation: CustomAnimation<T>
      ) => CustomAnimation<T>
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
    interface IUtil {
      registerAnimation(
        name: string,
        callback: <T extends fabric.Object>(
          object: T,
          animation: fabric.CustomAnimation<T>
        ) => CustomAnimation<T>
      ): void
    }
  }
}
