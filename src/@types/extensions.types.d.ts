import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    interface IUtil {
      installedExtensions: { [key: string]: boolean }
    }
  }
}
