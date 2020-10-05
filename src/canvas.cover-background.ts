import { fabric } from 'fabric'
import { extendMethod } from './utils'
import { imageImport } from '.'

declare module 'fabric' {
  namespace fabric {}
}

export function install(instance: typeof fabric) {
  imageImport(instance)

  instance.util.object.extend(instance.StaticCanvas.prototype, {
    /**
     * @private
     */
    toJSON: extendMethod(instance.StaticCanvas, 'toJSON', function (object: any) {
      if (object.backgroundImage && object.backgroundImage.getSrc) {
        object.backgroundImage = object.backgroundImage.getSrc()
      } else {
        object.backgroundImage = null
      }

      if (object.overlayImage && object.overlayImage.getSrc) {
        object.overlayImage = object.overlayImage.getSrc()
      } else {
        object.overlayImage = null
      }

      return object
    }),

    /**
     * @private
     * @param {String} property Property to set (backgroundImage, overlayImage, backgroundColor, overlayColor)
     * @param {(Object|String)} value Value to set
     * @param {Object} loaded Set loaded property to true if property is set
     * @param {Object} callback Callback function to invoke after property is set
     */
    __setBgOverlay: async function (
      this: fabric.StaticCanvas,
      property: string,
      value: any,
      loaded: any,
      callback: Function
    ) {
      if (!value) {
        loaded[property] = true
        callback && callback()
        return
      }

      if (property === 'backgroundImage' || property === 'overlayImage') {
        const zoom = this.getZoom() || 1
        const width = this.getWidth() || 0
        const height = this.getHeight() || 0

        this[property] = await instance.Image.from(value, {
          size: 'cover',
          width: width / zoom,
          height: height / zoom,
          left: width / zoom / 2,
          top: height / zoom / 2,
        })

        loaded[property] = true
        callback && callback()
      } else {
        const methodName = ('set' + instance.util.string.capitalize(property, true)) as MethodsName<
          fabric.StaticCanvas
        >

        ;(this[methodName] as any).call(this, value, function () {
          loaded[property] = true
          callback && callback()
        })
      }
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
