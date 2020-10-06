import { fabric } from 'fabric'
import camelCase from 'lodash.camelcase'
import { imageImport } from '.'

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      __insertExternalElements(data: DataTransfer): void
      __insertExternalObjects(objects: any[]): this
    }
  }
}

export function install(instance: typeof fabric) {
  imageImport(instance)

  if (!instance.Canvas.prototype.__insertExternalElements) {
    instance.util.object.extend(instance.Canvas.prototype, {
      /**
       * Insert external elements (either clipboard or drop)
       *
       * @param data
       */
      __insertExternalElements(this: fabric.Canvas, data: DataTransfer) {
        Array.from(data.items).forEach((item) => {
          const mainType = item.type.split('/')[0]
          const methodName = camelCase(`insert-external-${item.type}`) as MethodsName<fabric.Canvas>
          const shortMethodName = camelCase(`insert-external-${mainType}`) as MethodsName<
            fabric.Canvas
          >

          if (methodName in this) {
            ;(this[methodName] as any).call(this, item)
          } else if (shortMethodName in this) {
            ;(this[shortMethodName] as any).call(this, item)
          }
        })
      },

      /**
       * Insert stored fabric/json elements.
       *
       * @return {void}
       */
      async __insertExternalObjects(json: any[]) {
        const promises = json.map((object) => {
          return new Promise((resolve: (object: fabric.Object) => void) => {
            return instance.util.getKlass(object.type, 'fabric').fromObject(object, resolve)
          })
        })

        const objects = await Promise.all(promises)
        this.add(...objects)
        const selected = new instance.ActiveSelection(objects, { canvas: this })
        this.setActiveObject(selected).requestRenderAll()

        return this
      },

      /**
       * Insert stored fabric/json elements.
       *
       * @return {void}
       */
      insertExternalFabric(this: fabric.Canvas, data: DataTransferItem) {
        data.getAsString((data) => {
          this.__insertExternalObjects(JSON.parse(data))
        })
      },

      /**
       * Insert stored text/plain elements.
       *
       * @return {void}
       */
      insertExternalTextPlain(this: fabric.Canvas, data: DataTransferItem) {
        data.getAsString((data: string) => {
          this.__insertExternalObjects([
            {
              type: 'textbox',
              text: data,
            },
          ])
        })
      },

      /**
       * Insert stored text/html elements.
       *
       * @return {void}
       */
      insertExternalTextHTML(this: fabric.Canvas, data: DataTransferItem) {
        data.getAsString((data: string) => {
          const temp = document.createElement('div')
          temp.innerHTML = data
          this.__insertExternalObjects([
            {
              type: 'textbox',
              text: temp.innerText,
            },
          ])
        })
      },

      /**
       * Insert stored image elements.
       *
       * @return {void}
       */
      async insertExternalImage(this: fabric.Canvas, data: DataTransferItem) {
        const file = data.getAsFile()
        if (file) {
          const zoom = this.getZoom() || 1
          const width = this.getWidth() || 0
          const height = this.getHeight() || 0
          const image = await instance.Image.fromFile(file, {
            size: 'fit',
            width: (width / zoom) * 0.5,
            height: (height / zoom) * 0.5,
            left: width / zoom / 2,
            top: height / zoom / 2,
          })

          this.add(image)
          const selected = new instance.ActiveSelection([image], { canvas: this })
          this.setActiveObject(selected).requestRenderAll()
        }
      },
    })
  }
}

if (window.fabric) {
  install(window.fabric)
}
