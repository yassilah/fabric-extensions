import { extension } from './utils'

export default extension('image.import', (fabric) => {
  fabric.util.object.extend(fabric.Image, {
    /**
     * Create an image from either a File or a source url.
     *
     * @param source
     * @param options
     */
    from(source: File | string, options: fabric.IImageOptions = {}) {
      if (source instanceof File) {
        return fabric.Image.fromFile(source, options)
      }

      return fabric.Image.fromSrc(source, options)
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
        reader.onload = fabric.Image.__onReaderLoad.bind(reader, resolve, options)
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
        img.onload = fabric.Image.__onImageLoad.bind(img, resolve, options)
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
      result: ProgressEvent<FileReader>
    ) {
      if (typeof result.target?.result === 'string') {
        const image = await fabric.Image.fromSrc(result.target.result, options)
        resolve(image)
      }
    },

    /**
     * On imageload callback.
     *
     * @param resolve
     * @param options
     */
    __onImageLoad(this: HTMLImageElement, resolve: Function, options: fabric.IImageOptions = {}) {
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
