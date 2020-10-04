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
      function _getScaleFromBackgroundSize(
        size: Image['size'],
        source: { width: number; height: number },
        destination: { width: number; height: number }
      ): number
      function _onReaderLoad(
        this: FileReader,
        resolve: Function,
        options: IImageOptions,
        result: ProgressEvent<FileReader>
      ): void
      function _onImageLoad(this: HTMLImageElement, resolve: Function, options: IImageOptions): void
    }
    interface IImageOptions {
      size?: 'cover' | 'fit'
    }
  }
}

export function install(instance: typeof fabric) {
  instance.util.object.extend(instance.Image, {
    /**
     * Create an image from either a File or a source url.
     *
     * @param source
     * @param options
     */
    from(source: File | string, options: fabric.IImageOptions = {}) {
      if (source instanceof File) {
        return instance.Image.fromFile(source, options)
      }

      return instance.Image.fromSrc(source, options)
    },

    /**
     * Create an image from a file.
     *
     * @param file
     * @param options
     */
    fromFile(file: File, options: fabric.IImageOptions = {}) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = instance.Image._onReaderLoad.bind(reader, resolve, options)
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
    fromSrc(src: string, options: fabric.IImageOptions = {}) {
      return new Promise((resolve, reject) => {
        const img = new window.Image()
        img.onload = instance.Image._onImageLoad.bind(img, resolve, options)
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
    async _onReaderLoad(
      this: FileReader,
      resolve: Function,
      options: fabric.IImageOptions = {},
      result: ProgressEvent<FileReader>
    ) {
      if (typeof result.target?.result === 'string') {
        const image = await instance.Image.fromSrc(result.target.result, options)
        resolve(image)
      }
    },

    /**
     * On imageload callback.
     *
     * @param resolve
     * @param options
     */
    _onImageLoad(this: HTMLImageElement, resolve: Function, options: fabric.IImageOptions = {}) {
      const { width = 0, left = 0, top = 0, height = 0, size = 'cover' } = options
      const scale = instance.Image._getScaleFromBackgroundSize(size, this, { width, height })
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
     * Get the scale depending on the background size chosen.
     *
     * @param size
     * @param source
     * @param destination
     */
    _getScaleFromBackgroundSize(
      size: fabric.Image['size'],
      source: { width: number; height: number },
      destination: { width: number; height: number }
    ) {
      return size === 'cover'
        ? fabric.util.findScaleToCover(source, destination)
        : fabric.util.findScaleToFit(source, destination)
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
