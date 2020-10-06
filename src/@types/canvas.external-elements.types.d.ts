import { fabric } from 'fabric'

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
