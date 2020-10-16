# Fabric Extensions

This package contains a list of different plugins/extensions to use with [fabric.js](https://github.com/fabricjs/fabric.js). 🎉️

## Installation

Simply install the package by running:

```javascript
yarn add @yassidev/fabric-extensions
```

Then simply include it into your application.

```javascript
import { fabric } from 'fabric'
import { install } from '@yassidev/fabric-extensions'

install(fabric)
```

You may also simply need:

```javascript
import 'fabric'
import '@yassidev/fabric-extensions'
```

You may also only install the extensions you want:

```javascript
import { fabric } from 'fabric'
import { textVerticalAlign, canvasShortcuts, canvasDrop } from '@yassidev/fabric-extensions'

textVerticalAlign(fabric)
canvasShortcuts(fabric)
canvasDrop(fabric)
```

## Extensions

This is the list of current extensions.

##### **NEW** Image controls

This extension will allow you to crop your images. Simply double click on your object to enter the "editing mode". Unselect or double click on your object to exit the "editing mode".

```javascript
import { fabric } from 'fabric'
import { imageControls } from '@yassidev/fabric-extensions'

imageControls(fabric)

const image = new fabric.Image(img, {
  /**
   * Length of the corner sides in editing mode.
   */
  cornerLengthEditing: 5,

  /**
   * Color of the corner stroke in editing mode.
   */
  cornerStrokeColorEditing: 'black',

  /**
   * Size of the corner stroke in editing mode.
   */
  cornerSizeEditing: 2,
})
```

##### **NEW** Polyline controls

This extension will allow you to edit the points of your polygons/polylines/arrows. Simply double click on your object to enter the "editing mode". You may then move your points by dragging them, remove a point by right clicking it or adding a new point by double clicking on a segment. Unselect or double click on your object to exit the "editing mode".

```javascript
import { fabric } from 'fabric'
import { polylineControls } from '@yassidev/fabric-extensions'

polylineControls(fabric)

const polyline = new fabric.Polyline(
  [
    { x: 0, y: 10 },
    { x: 10, y: 50 },
  ],
  {
    /**
     * Whether borders should be visible in editing mode.
     */
    hasBordersEditing: false,

    /**
     * The type of corner style in editing mode.
     */
    cornerStyleEditing: 'circle',

    /**
     * The corner color in editing mode.
     */
    cornerColorEditing: 'rgba(0,0,255,0.5)',

    /**
     * Tolerance distance from line to add a point.
     */
    toleranceFromLine: 10,
  }
)
```

##### Canvas Cover Background

This extension will simply automatically scale the canvas background/overlay image to cover it while keeping its aspect ratio. This will also saintore the backgroundImage/overlayImage property of the canvas.toJSON() as a string rather than an object.

```javascript
import { fabric } from 'fabric'
import { canvasCoverBackground } from '@yassidev/fabric-extensions'

canvasCoverBackground(fabric)

fabric.backgroundImage = 'https://source.unsplash.com/random'
```

##### Canvas Drop

This extension will allow you to drop elements on the canvas directly ! By default, the canvas can already insert images or text but you can extend your canvas to allow for other DataTransferItem types to be included.

```javascript
import { fabric } from 'fabric'
import { canvasDrop } from '@yassidev/fabric-extensions'

canvasDrop(fabric)

fabric.util.registerDataTransferType('image', (data: DataTransferItem, canvas: fabric.Canvas) => {
  // do whatever you want with images.
})

fabric.util.registerDataTransferType(
  'image/jpeg',
  (data: DataTransferItem, canvas: fabric.Canvas) => {
    // do whatever you want with JPEG images specifically.
  }
)
```

#### Canvas Guidelines

This extension will add centering and aligning guidelines to your canvas when placing objects.

```javascript
import { fabric } from 'fabric'
import { canvasGuidelines } from '@yassidev/fabric-extensions'

canvasGuidelines(fabric)
```

#### Canvas Shortcuts

This extension will allow you to register keyboard shortcuts to interact with you canvas. You may choose the shortcuts you want to include or register new ones using the below helper method.

```javascript
import { fabric } from 'fabric'
import { canvasShortcutsCopy, canvasShortcutsGroup } from '@yassidev/fabric-extensions'

canvasShortcutsCopy(fabric)
canvasShortcutsGroup(fabric)

fabric.util.registerShortcut('ctrl+alt+m', (canvas: Canvas, event: KeyboardEvent) => {
  // do something
})
```

These are the currently available shortcuts:

- [x] copy/paste: using the native copy/paste ClipboardEvent
- [x] delete: Delete or Backspace key to remove an object
- [x] group: Ctrl+G to group/ungroup the selection
- [x] move: ArrowLeft/Right/Up/Down to move your selection (+/- 1)
- [x] move more: ArrowLeft/Right/Up/Down + Shift to move your selection (+/- 10)
- [x] rotate: ArrowLeft/Right + Ctrl to rotate your selection (+/- 1deg)
- [x] rotate more: ArrowLeft/Right + Ctrl + Shift to rotate your selection (+/- 10deg)
- [x] order: ArrowUp/Down + Ctrl to bringForward / sendBackwards your selection.
- [x] order more: ArrowUp/Down + Ctrl + Shift to bringToFront / sendToBack your selection.
- [x] select all: Ctrl + A to select all objects.

#### Image Import

This extension will allow you to very easily create new fabric.Image instances from a URL or a File. The extension only adds three helper methosd on the fabric.Image constructor.

```javascript
import { fabric } from 'fabric'
import { imageImport } from '@yassidev/fabric-extensions'

imageImport(fabric)

fabric.Image.from(string|File, ...options) => Promise<fabric.Image>
fabric.Image.fromSrc(string, ...options) => Promise<fabric.Image>
fabric.Image.fromFile(File, ...options) => Promise<fabric.Image>
```

#### Object Export Animations

This extension will allow you to export animations in your JSON. The concept is simple: you can register animations on your fabric instance and include them in the new "animations" array property of your fabric.Object instances.

```javascript
import { fabric } from 'fabric'
import { objectExportAnimations } from '@yassidev/fabric-extensions'

objectExportAnimations(fabric)

fabric.util.registerAnimation('rotate', (object: fabric.Object, animation: fabric.CustomAnimation) => {
	return {
		duration: 1000,
		delay: 0,
		times: 0, // 0 = Infinite, default: 1
		reverse: false, // Reverse after each iteration
		easing: 'easeInBack', // default: linear
		originX: 'center', // defaut: left
		originY: 'center', // defaut: top
		to: { angle: 360 },
		data: null // set any data you want
		...animation // merge with customized animation
	}
})

const object = new fabric.Rect({
	animations: [
		{
			name: 'rotate',
			trigger: 'mousedown',
			duration: 2000 // customize the default animation
		},
		{
			trigger: null,  // no trigger = on added
			duration: 1000,
			from: { opacity: 0 },
			to: { opacity: 1},
			delay: 1000
		}
	]
})
```

#### Object Export Events

This extension will allow you to export events in your JSON. The concept is simple: you can register events on your fabric instance and include them in the new "events" array property of your fabric.Object instances.

```javascript
import { fabric } from 'fabric'
import { objectExportAnimations } from '@yassidev/fabric-extensions'

objectExportAnimations(fabric)

fabric.util.regiterEvent(
  'link',
  (object: fabric.Object, event: fabric.CustomEvent, e: fabric.IEvent) => {
    window.open(event.data.url)
  }
)

const object = new fabric.Rect({
  events: [
    {
      name: 'link',
      data: { url: 'https://github.com' },
    },
  ],
})
```

#### Text Vertical Align

This extension will allow you to set the vertical alignment of your fabric.Text/fabric.Textbox instances. The value of the new "verticalAlign" property can be set to "top" (default), "middle" or "bottom". This extension will also prevent the distorsion of your text while scaling.

```javascript
import { fabric } from 'fabric'
import { textVerticalAlign } from '@yassidev/fabric-extensions'

textVerticalAlign(fabric)

const object = new fabric.Textbox('Some text', {
  verticalAlign: 'middle',
  textAlign: 'center',
})
```

#### Icons

This extension will allow you to add SVG path icons into your canvases. The extensions creates a new class: fabric.Icon.

```javascript
import { fabric } from 'fabric'
import { icons } from '@yassidev/fabric-extensions'
import * as mdi from '@mdi/js'
import { kebabCase } from 'lodash'

icons(fabric)

fabric.util.registerIconLibrary('mdi', () => {
  return Object.entries(mdi).reduce((all, [key, value]) => {
    const normalized = kebabCase(key.replace(/^mdi/, ''))
    all[normalized] = value
    return all
  }, {})
})

const object = new fabric.Icon({
  iconName: 'emoticon-happy-outline',
  iconLibrary: 'mdi', // unnecessary here as there is only one library
  width: 100,
  height: 100,
})
```

#### Map

This extension will allow you to add dynamic GeoJson content as a group of paths into your canvas. The extensions creates a new class: fabric.Map.

```javascript
fabric.util.registerGeoJson('world', async () => {
  const fetched = await fetch(
    'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
  )
  return await fetched.json()
})

const map = new fabric.Map({
  features: ['France'], // select the features you want to display or leave an empty array to display all
  byKey: 'properties.name', // set the key by which the features are filtered
  geojson: 'world', // unnecessary here as there is only one registered geojson
  width: 500,
  height: 500,
})

/**
 * Create features-specific events!
 */

map.on('mouseover:France', ({ target }) => {
  target.set({ fill: 'blue' })
  instance.requestRenderAll()
})

map.on('mouseout:France', ({ target }) => {
  target.set({ fill: 'black' })
  instance.requestRenderAll()
})
```

##### License

MIT
