import { fabric } from 'fabric'
import { extension } from './utils'

export default extension('icon', (fabric) => {
  /**
   * List of available libraries.
   */
  fabric.iconLibraries = {}

  /**
   * Default librry to use.
   */
  fabric.defaultIconLibrary = ''

  /**
   * Regoster an icon library.
   *
   * @param name
   * @param library
   */
  fabric.util.registerIconLibrary = function (name, library) {
    if (typeof library === 'function') {
      fabric.iconLibraries[name] = library()
    } else {
      fabric.iconLibraries[name] = library
    }

    if (!fabric.defaultIconLibrary) {
      fabric.defaultIconLibrary = name
    }
  }

  /**
   * Create the icon class.
   */
  fabric.Icon = fabric.util.createClass(fabric.Path, {
    /**
     * Type of shape.
     */
    type: 'icon',

    /**
     * Name of the icon
     */
    iconName: '',

    /**
     * Library of the icon
     */
    iconLibrary: '',

    /**
     * Set the icon.
     */
    setIcon(this: fabric.Icon, iconName: string, iconLibrary?: string) {
      this.iconName = iconName
      if (iconLibrary) this.iconLibrary = iconLibrary
      const path = this.__findIconPath(this.iconName, this.iconLibrary)
      this.path = fabric.util.makePathSimpler(fabric.util.parsePath(path))
      fabric.Polyline.prototype._setPositionDimensions.call(this, this)
      this.set({ dirty: true })
    },

    /**
     * Initialize.
     */
    initialize(options: fabric.IIconOptions) {
      this.callSuper(
        'initialize',
        this.__findIconPath(options.iconName, options.iconLibrary),
        options
      )
      this.width = options.width || 0
      this.height = options.height || 0
      this.scaleX = options.scaleX || 1
      this.scaleY = options.scaleY || 1
      this.__setIconDimensions()
      return this
    },

    /**
     * Fint the icon path.
     */
    __findIconPath(iconName: string, iconLibrary?: string) {
      try {
        return fabric.iconLibraries[iconLibrary || fabric.defaultIconLibrary][iconName]
      } catch {
        throw new Error('We could not find this icon: ' + iconName + '.')
      }
    },

    /**
     * Set icon dimensions.
     */
    __setIconDimensions(this: fabric.Icon) {
      const { width: iconWidth, height: iconHeight } = this._calcDimensions()
      const scale = Math.min(this.width! / iconWidth, this.height! / iconHeight)
      return this.set({
        width: iconWidth,
        height: iconHeight,
        scaleX: scale * this.scaleX!,
        scaleY: scale * this.scaleY!,
      }).setCoords()
    },

    /**
     * To object.
     */
    toObject(propertiesToInclude: string[] = []) {
      return this.callSuper('toObject', propertiesToInclude.concat('iconName', 'iconLibrary'))
    },
  })
})

declare module 'fabric' {
  namespace fabric {
    let iconLibraries: {
      [key: string]: { [key: string]: string }
    }
    let defaultIconLibrary: keyof typeof iconLibraries
    interface Path {
      _calcDimensions(): { width: number; height: number }
    }
    class Icon extends Path {
      iconName: string
      iconLibrary: string
      __findIconPath(iconName: string, iconLibrary?: string): string
      setIcon(iconName: string, iconLibrary?: string): void
      __setIconDimensions(): this
    }
    interface IIconOptions extends IPathOptions {
      iconName?: string
      iconLibrary?: string
    }
    interface IUtil {
      makePathSimpler(path: any[]): any
      parsePath(path: string): any[]
      registerIconLibrary(
        name: string,
        library: (() => { [key: string]: string }) | { [key: string]: string }
      ): void
    }
    interface Polyline {
      _setPositionDimensions(path: Path): void
    }
  }
}
