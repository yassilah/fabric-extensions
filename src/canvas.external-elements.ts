import { extension } from './utils'
import imageImport from './image.import'

export default extension('canvas.external-elements', (fabric) => {
  imageImport(fabric)

  /**
   * THe list of registered data transfer types.
   */
  fabric.util.dataTransferTypes = {}

  /**
   * Register data transfer type.
   * @param type
   * @param callback
   */
  fabric.util.registerDataTransferType = function (type, callback) {
    fabric.util.dataTransferTypes[type] = callback
  }

  /**
   * Extend canvas.
   */
  fabric.util.object.extend(fabric.Canvas.prototype, {
    /**
     * Insert external elements (either clipboard or drop)
     *
     * @param data
     */
    __insertExternalElements(this: fabric.Canvas, data: DataTransfer) {
      Array.from(data.items).forEach(async (item) => {
        const mainType = item.type.split('/')[0]
        const { dataTransferTypes } = fabric.util
        const method = dataTransferTypes[item.type] || dataTransferTypes[mainType]

        if (method) {
          this.__insertExternalObjects((await method(item, this)) || [])
        }
      })
    },

    /**
     * Insert stored fabric/json elements.
     *
     * @return {void}
     */
    async __insertExternalObjects(json: any[]) {
      if (!Array.isArray(json)) {
        json = [json]
      }

      const promises = json.map((object) => {
        return new Promise((resolve: (object: fabric.Object) => void) => {
          return object instanceof fabric.Object
            ? resolve(object)
            : fabric.util.getKlass(object.type, 'fabric').fromObject(object, resolve)
        })
      })

      const objects = await Promise.all(promises)
      this.add(...objects)
      const selected = new fabric.ActiveSelection(objects, { canvas: this })
      this.setActiveObject(selected).requestRenderAll()

      return this
    },
  })

  /**
   * Register the fabric/json data type.
   */
  fabric.util.registerDataTransferType('fabric', (data: DataTransferItem) => {
    return new Promise((resolve, reject) => {
      data.getAsString((data) => {
        try {
          resolve(JSON.parse(data))
        } catch {
          reject('Could not parse the JSON fabric.')
        }
      })
    })
  })

  /**
   * Register the image data type.
   */
  fabric.util.registerDataTransferType('image', (data: DataTransferItem, canvas: fabric.Canvas) => {
    return new Promise(async (resolve, reject) => {
      try {
        const file = data.getAsFile()
        if (file) {
          const zoom = canvas.getZoom() || 1
          const width = canvas.getWidth() || 0
          const height = canvas.getHeight() || 0
          const image = await fabric.Image.fromFile(
            file,
            {
              size: 'fit',
              width: (width / zoom) * 0.5,
              height: (height / zoom) * 0.5,
              left: width / zoom / 2,
              top: height / zoom / 2,
            },
            canvas
          )

          resolve(image)
        }
      } catch {
        reject('Could not add the image.')
      }
    })
  })

  /**
   * Register the text/html data type.
   */
  fabric.util.registerDataTransferType('text/html', (data: DataTransferItem) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.getAsString((data: string) => {
          const temp = document.createElement('div')
          temp.innerHTML = data
          resolve({
            type: 'textbox',
            text: temp.innerText,
          })
        })
      } catch {
        reject('Could not add the text.')
      }
    })
  })

  /**
   * Register the text/plain data type.
   */
  fabric.util.registerDataTransferType('text/plain', (data: DataTransferItem) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.getAsString((data: string) => {
          resolve({
            type: 'textbox',
            text: data,
          })
        })
      } catch {
        reject('Could not add the text.')
      }
    })
  })

  /**
   * Register the text/plain data type.
   */
  fabric.util.registerDataTransferType('text/plain', (data: DataTransferItem) => {
    return new Promise(async (resolve, reject) => {
      try {
        data.getAsString((data: string) => {
          resolve({
            type: 'textbox',
            text: data,
          })
        })
      } catch {
        reject('Could not add the text.')
      }
    })
  })
})

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      __insertExternalElements(data: DataTransfer): void
      __insertExternalObjects(objects: any[]): this
    }
    interface IUtil {
      registerDataTransferType(type: string, callback: DataTransferToObject): void
      dataTransferTypes: {
        [key: string]: DataTransferToObject
      }
    }
  }
}

type DataTransferToObject = (
  data: DataTransferItem,
  canvas: fabric.Canvas
) => Promise<fabric.Object[] | fabric.Object | any | undefined>
