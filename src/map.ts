import {
  ExtendedFeature,
  ExtendedFeatureCollection,
  geoCentroid,
  geoMercator,
  GeoPath,
  geoPath,
} from 'd3-geo'
import { fabric } from 'fabric'
import get from 'lodash.get'
import pick from 'lodash.pick'
import { extendMethod, extension } from './utils'

export default extension('map', (fabric) => {
  /**
   * List of available geojson sources.
   */
  fabric.geoJson = {}

  /**
   * Default geojson to use.
   */
  fabric.defaultGeoJson = ''

  /**
   * Regostera geojson source.
   *
   * @param name
   * @param library
   */
  fabric.util.registerGeoJson = async function (name, library) {
    if (library instanceof Promise) {
      fabric.geoJson[name] = await library
    } else if (typeof library === 'function') {
      fabric.geoJson[name] = await library()
    } else {
      fabric.geoJson[name] = library
    }

    if (!fabric.defaultGeoJson) {
      fabric.defaultGeoJson = name
    }
  }

  /**
   * Create the Map class.
   */
  fabric.Map = fabric.util.createClass(fabric.Group, {
    /**
     * Type of shape.
     */
    type: 'map',

    /**
     * Name of the geojson.
     */
    geoJson: '',

    /**
     * The list of features to include from the geojson.
     */
    features: [],

    /**
     * Key used to filter the features.
     */
    byKey: 'properties.name',

    /**
     * Mode.
     */
    mode: null,

    /**
     * Styles to apply for each feature.
     */
    styles: {},

    /**
     * Events to trigger on each  feature.
     */
    _featuresEvents: ['mouseout', 'mousedown', 'mouseover', 'mousedblclick', 'mousetripleclick'],

    /**
     * Keys to consider for common styling.
     */
    _commonStyleKeys: [
      'fill',
      'fillRule',
      'stroke',
      'strokeWidth',
      'strokDashArray',
      'strokeLineCap',
      'strokeDashOffset',
      'strokeLineJoin',
    ],

    /**
     * Check subtargets.
     */
    subTargetCheck: true,

    /**
     * Remove the cached visible features on change.
     */
    _set: extendMethod(fabric.Group, '_set', function (result: any, key: string, value: any) {
      const self = this as fabric.Map

      if (['byKey', 'features', 'geoJson'].includes(key)) {
        self._visibleFeatures = undefined
        self.updateMap()
      } else if (self._commonStyleKeys.includes(key)) {
        self.__setStyles()
      } else if (['mode', 'width', 'height'].includes(key)) {
        self.__setClipPath().updateMap()
      }

      return result
    }),

    /**
     * Update map paths.
     */
    updateMap(this: fabric.Map) {
      this.remove(...this.getObjects())
      this.add(...this.__getPaths())
      return this
    },

    /**
     * Set the Map.
     */
    setGeoJson(this: fabric.Map, geoJson?: string) {
      if (geoJson) this.geoJson = geoJson
      this._visibleFeatures = undefined
      this.updateMap()
    },

    /**
     * Initialize.
     */
    initialize(options: fabric.IMapOptions) {
      this.callSuper('initialize', [], options)
      this.width = options.width || 0
      this.height = options.height || 0
      this.scaleX = options.scaleX || 1
      this.scaleY = options.scaleY || 1
      this.add(...this.__getPaths())
      return this.__setStyles()
    },

    /**
     * Set the map paths.
     */
    __getPaths(this: fabric.Map) {
      const json = this.__getGeoJson()
      const features = this.__getFeatures()
      const visible = this.__getVisibleFeatures()
      const param = { ...json, features: this.mode ? visible : features }
      const center = geoCentroid(param)
      const projection = geoMercator().translate(center).fitSize([this.width!, this.height!], param)
      const pathProjection = geoPath().projection(projection)
      const pathsToCreate = this.mode === 'focus' ? visible : features
      return pathsToCreate.map(this.__getPath.bind(this, pathProjection))
    },

    /**
     * Set a map path.
     */
    __getPath(this: fabric.Map, pathProjection: GeoPath, feature: ExtendedFeature) {
      const id = get(feature, this.byKey)
      const { x, y } = this.getCenterPoint()
      const path = new fabric.Path(pathProjection(feature) || '', {
        data: feature,
        perPixelTargetFind: true,
      })
      this._featuresEvents.forEach((event) => {
        path.on(event, (e) => {
          this.fire(`${event}:${id}`, e)
          this.fire(`${event}:*`, e)
        })
      })

      return path
        .set({
          left: path.left! + (this.left! - x) / this.scaleX!,
          top: path.top! + (this.top! - y) / this.scaleY!,
        })
        .setCoords()
    },

    /**
     * Get the visible features list.
     */
    __getVisibleFeatures(this: fabric.Map) {
      if (this._visibleFeatures) return this._visibleFeatures
      if (this.features.length === 0) return (this._visibleFeatures = this.__getFeatures())

      return (this._visibleFeatures = this.__getFeatures().filter((feature) => {
        return this.features.includes(get(feature, this.byKey))
      }))
    },

    /**
     * Get the features list.
     */
    __getFeatures(this: fabric.Map) {
      return this.__getGeoJson().features
    },

    /**
     * Get the geojson file.
     */
    __getGeoJson(this: fabric.Map) {
      try {
        return fabric.geoJson[this.geoJson || fabric.defaultGeoJson]
      } catch {
        throw new Error('Could not get the features collection.')
      }
    },

    /**
     * Set the clip path.
     */
    __setClipPath(this: fabric.Map) {
      this.clipPath =
        this.mode === 'zoom'
          ? new fabric.Rect({
              left: -this.width! / 2,
              top: -this.height! / 2,
              width: this.width,
              height: this.height,
            })
          : undefined

      return this
    },

    /**
     * Set the clip path.
     */
    __setStyles(this: fabric.Map) {
      const commonStyle = pick(this, ...this._commonStyleKeys)

      this.forEachObject((object) => {
        const style = this.styles[object.data.id] || {}
        object.set({ ...commonStyle, ...style })
      })

      return this
    },

    /**
     * To object.
     */
    toObject(propertiesToInclude: string[] = []) {
      return this.callSuper(
        'toObject',
        propertiesToInclude.concat('geoJson', 'styles', 'mode', 'byKey', 'features')
      )
    },
  })

  /**
   * From object.
   *
   * @param object
   * @param callback
   */
  fabric.Map.fromObject = function (object: fabric.IMapOptions, callback?: Function) {
    const Map = new fabric.Map(object)
    if (callback) callback(Map)
    return Map
  }
})

declare module 'fabric' {
  namespace fabric {
    let geoJson: {
      [key: string]: ExtendedFeatureCollection
    }
    let defaultGeoJson: keyof typeof iconLibraries
    class Map extends Group {
      geoJson: string
      styles: { [key: string]: IObjectOptions }
      mode: 'focus' | 'zoom' | null
      byKey: string
      features: string[]
      _visibleFeatures: ExtendedFeature[] | undefined
      _featuresEvents: string[]
      _commonStyleKeys: string[]
      constructor(options: IMapOptions)
      updateMap(): Map
      __getGeoJson(): ExtendedFeatureCollection
      __getFeatures(): ExtendedFeature[]
      __getVisibleFeatures(): ExtendedFeature[]
      __getPaths(): Path[]
      __getPath(projectionPath: GeoPath): Path
      __setClipPath(): Map
      __setStyles(): Map
      static fromObject(options: IMapOptions, callback?: Function): Map
    }
    interface IMapOptions extends IObjectOptions {
      geoJson?: string
      styles?: { [key: string]: IObjectOptions }
      byKey?: string
      features?: string[]
      mode?: 'focus' | 'zoom' | null
    }
    interface IUtil {
      registerGeoJson(
        name: string,
        library:
          | (() => ExtendedFeatureCollection)
          | ExtendedFeatureCollection
          | (() => Promise<ExtendedFeatureCollection>)
          | Promise<ExtendedFeatureCollection>
      ): void
    }
  }
}
