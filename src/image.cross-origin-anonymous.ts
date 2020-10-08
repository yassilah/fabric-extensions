import { extendMethod, extension } from './utils'

export default extension('image.cross-origin-anonymous', (fabric) => {
  /**
   * Extend object.
   */
  fabric.util.object.extend(fabric.Image.prototype, {
    setElement: extendMethod(fabric.Image, 'setElement', function (this: fabric.Image) {
      this.getElement().setAttribute('crossOrigin', 'Anonymous')
    }),
  })
})
