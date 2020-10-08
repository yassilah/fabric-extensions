import { extendMethod, extension } from './utils'

export default extension('canvas.to-data-url-promise', (fabric) => {
  /**
   * Extend object.
   */
  fabric.util.object.extend(fabric.Object.prototype, {
    loadingPromise: null,
  })

  /**
   * Extend image.
   */
  fabric.util.object.extend(fabric.Image.prototype, {
    initialize: extendMethod(fabric.Image, 'initialize', function () {
      this.loadingPromise = new Promise((resolve) => {
        const element = this.getElement() as HTMLImageElement
        if (element && !element.complete) {
          element.addEventListener('load', resolve)
        } else {
          resolve()
        }
      })
    }),
  })

  /**
   * Extend StaticCanvas.
   */
  fabric.util.object.extend(fabric.StaticCanvas.prototype, {
    /**
     * Get the list of loading objects.
     */
    getLoadingPromises(this: fabric.StaticCanvas) {
      const promises: Promise<any>[] = []

      this._objects.forEach(function _(object) {
        if (object.loadingPromise) {
          promises.push(object.loadingPromise)
        }
        if (object instanceof fabric.Group) {
          object._objects.forEach(_)
        }
      })

      if (this.backgroundImage instanceof fabric.Image && this.backgroundImage?.loadingPromise) {
        promises.push(this.backgroundImage.loadingPromise)
      }

      if (this.overlayImage instanceof fabric.Image && this.overlayImage.loadingPromise) {
        promises.push(this.overlayImage.loadingPromise)
      }

      return promises
    },
    /**
     * Load all objects before return data url.
     */
    toDataURL: ((toDataURL: fabric.StaticCanvas['toDataURL']) => {
      return async function (this: fabric.StaticCanvas, options?: fabric.IDataURLOptions) {
        await Promise.all(this.getLoadingPromises())
        return toDataURL.call(this, options)
      }
    })(fabric.StaticCanvas.prototype.toDataURL),
  })
})

declare module 'fabric' {
  namespace fabric {
    interface Object {
      loadingPromise: null | Promise<any>
    }
    interface StaticCanvas {
      toDataURL(options?: IDataURLOptions): Promise<string>
      getLoadingPromises(): Promise<any>[]
    }
  }
}
