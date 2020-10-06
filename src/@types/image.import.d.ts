import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    interface IUtil {
      findScaleToCover(
        source: { width: number; height: number },
        destionation: { width: number; height: number }
      ): number
      findScaleToFit(
        source: { width: number; height: number },
        destionation: { width: number; height: number }
      ): number
    }
    namespace Image {
      function from(fileOrSrc: File | string, options?: IImageOptions): Promise<Image>
      function fromFile(file: File, options?: IImageOptions): Promise<Image>
      function fromSrc(src: string, options?: IImageOptions): Promise<Image>
      function __getScaleFromBackgroundSize(
        size: Image['size'],
        source: { width: number; height: number },
        destination: { width: number; height: number }
      ): number
      function __onReaderLoad(
        this: FileReader,
        resolve: Function,
        options: IImageOptions,
        result: ProgressEvent<FileReader>
      ): void
      function __onImageLoad(
        this: HTMLImageElement,
        resolve: Function,
        options: IImageOptions
      ): void
    }
    interface IImageOptions {
      size?: 'cover' | 'fit'
    }
  }
}
