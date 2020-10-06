import { extension } from './utils'
import heic2any from 'heic2any'

export default extension('image.import', (fabric) => {
  fabric.util.object.extend(fabric.Image, {
    /**
     * Create an image from either a File or a source url.
     *
     * @param source
     * @param options
     */
    from(source: File | string, options: fabric.IImageOptions = {}, canvas?: fabric.Canvas) {
      if (source instanceof File) {
        return fabric.Image.fromFile(source, options, canvas)
      }

      return fabric.Image.fromSrc(source, options, canvas)
    },

    /**
     * Create an image from a file.
     *
     * @param file
     * @param options
     */
    fromFile(file: File, options: fabric.IImageOptions = {}, canvas?: fabric.Canvas) {
      return new Promise(async (resolve, reject) => {
        const loadingRect = fabric.Image.__createImageLoader(options, canvas)
        if (file.type === 'image/heic') {
          file = (await heic2any({ blob: file })) as File
        }
        const reader = new FileReader()
        reader.onload = fabric.Image.__onReaderLoad.bind(reader, resolve, options, loadingRect)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },

    /**
     * Create an image from a source url..
     *
     * @param source
     * @param options
     */
    fromSrc(src: string, options: fabric.IImageOptions = {}, canvas?: fabric.Canvas) {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        const loadingRect = fabric.Image.__createImageLoader(options, canvas)
        img.onload = fabric.Image.__onImageLoad.bind(img, resolve, options, loadingRect)
        img.onerror = reject
        img.src = src
      })
    },

    /**
     * On readerload callback.
     *
     * @param resolve
     * @param options
     * @param result
     */
    async __onReaderLoad(
      this: FileReader,
      resolve: Function,
      options: fabric.IImageOptions = {},
      loadingRect: fabric.Rect,
      result: ProgressEvent<FileReader>
    ) {
      if (typeof result.target?.result === 'string') {
        const image = await fabric.Image.fromSrc(result.target.result, options)
        if (loadingRect) loadingRect.canvas?.remove(loadingRect)
        resolve(image)
      }
    },

    /**
     * On imageload callback.
     *
     * @param resolve
     * @param options
     */
    __onImageLoad(
      this: HTMLImageElement,
      resolve: Function,
      options: fabric.IImageOptions = {},
      loadingRect?: fabric.Rect
    ) {
      if (loadingRect) loadingRect.canvas?.remove(loadingRect)

      const { width = 0, left = 0, top = 0, height = 0, size = 'cover' } = options
      const scale = fabric.Image.__getScaleFromBackgroundSize(size, this, { width, height })
      const shape = new fabric.Image(this, {
        left: left - (this.naturalWidth / 2) * scale,
        top: top - (this.naturalHeight / 2) * scale,
        width: this.naturalWidth,
        height: this.naturalHeight,
        scaleX: scale,
        scaleY: scale,
      })
      resolve(shape)
    },

    /**
     * Create a loader before the image is loaded.
     *
     * @param options
     * @param canvas
     */
    __createImageLoader(options: fabric.IImageOptions = {}, canvas?: fabric.Canvas) {
      if (canvas) {
        const loadingRect = new fabric.Rect({
          stroke: 'black',
          fill: 'transparent',
          strokeWidth: 1,
          strokeDashArray: [5, 10],
          excludeFromExport: true,
          originX: 'center',
          originY: 'center',
          ...options,
        })

        canvas.add(loadingRect)

        return loadingRect
      }
    },

    /**
     * Get the scale depending on the background size chosen.
     *
     * @param size
     * @param source
     * @param destination
     */
    __getScaleFromBackgroundSize(
      size: fabric.Image['size'],
      source: { width: number; height: number },
      destination: { width: number; height: number }
    ) {
      return size === 'cover'
        ? fabric.util.findScaleToCover(source, destination)
        : fabric.util.findScaleToFit(source, destination)
    },
  })
})

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
      function from(
        fileOrSrc: File | string,
        options?: IImageOptions,
        canvas?: Canvas
      ): Promise<Image>
      function fromFile(file: File, options?: IImageOptions, canvas?: Canvas): Promise<Image>
      function fromSrc(src: string, options?: IImageOptions, canvas?: Canvas): Promise<Image>
      function __getScaleFromBackgroundSize(
        size: Image['size'],
        source: { width: number; height: number },
        destination: { width: number; height: number }
      ): number
      function __onReaderLoad(
        this: FileReader,
        resolve: Function,
        options: IImageOptions,
        loadingRect: ReturnType<typeof Image['__createImageLoader']>,
        result: ProgressEvent<FileReader>
      ): void
      function __onImageLoad(
        this: HTMLImageElement,
        resolve: Function,
        options: IImageOptions,
        loadingRect: ReturnType<typeof Image['__createImageLoader']>
      ): void
      function __createImageLoader(options: IImageOptions, canvas?: Canvas): Rect | undefined
    }
    interface IImageOptions {
      size?: 'cover' | 'fit'
    }
  }
}
