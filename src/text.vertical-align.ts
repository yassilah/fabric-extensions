import { fabric } from 'fabric'
import { extendMethod } from './utils'

declare module 'fabric' {
  namespace fabric {
    interface Text {
      verticalAlign: 'top' | 'middle' | 'bottom'
      _getTotalLineHeights(): number
      _getTopOffset(): number
    }
    interface IText {
      _getSelectionStartOffsetY(): number
      missingNewlineOffset(index: number): number
    }
  }
}

export function install(instance: typeof fabric) {
  instance.util.object.extend(instance.Text.prototype, {
    /**
     * Properties which when set cause object to change dimensions
     *
     * @type {array}
     * @private
     */
    _dimensionAffectingProps: instance.Text.prototype._dimensionAffectingProps.concat(
      'verticalAlign'
    ),
    /**
     *
     * List of properties to consider when checking if
     * state of an object is changed ({@link instance.Object#hasStateChanged})
     * as well as for history (undo/redo) purposes
     *
     * @type {array}
     */
    stateProperties: instance.Text.prototype.stateProperties!.concat('verticalAlign'),

    /**
     * List of properties to consider when checking if cache needs refresh.
     *
     * @type {array}
     */
    cacheProperties: instance.Text.prototype.cacheProperties!.concat('verticalAlign'),

    /**
     * Vertical alignment of the text.
     *
     * @type {string}
     */
    verticalAlign: 'top',

    /**
     * Calculate text box height
     *
     * @return {number}
     */
    calcTextHeight(this: fabric.Text) {
      let height = 0
      const { length } = this._textLines
      for (let i = 0; i < length; i++) {
        const lineHeight = this.getHeightOfLine(i)
        height += i === length - 1 ? lineHeight / this.lineHeight! : lineHeight
      }

      return Math.max(height, this.height!)
    },

    /**
     * Get the total line height.
     *
     * @return {number}
     */
    _getTotalLineHeights(this: fabric.Text) {
      return this._textLines.reduce((total: number, line: any, index: number) => {
        return total + this.getHeightOfLine(index)
      }, 0)
    },

    /**
     * Extend the initialize function to prevent scaling.
     *
     * @return {fabric.Text}
     */
    initialize: extendMethod(instance.Text, 'initialize', function () {
      this.on('scaling', () => {
        this.set({
          width: this.width! * this.scaleX!,
          height: this.height! * this.scaleY!,
          scaleY: 1,
          scaleX: 1,
        })
      })
    }),

    /**
     * Extend the toObject function to include the verticalAlign propeprty.
     *
     * @return {any}
     */
    toObject: extendMethod(instance.Text, 'toObject', function (object: any) {
      object.verticalAlign = this.verticalAlign
      return object
    }),

    /**
     * Get the top offset.
     *
     * @private
     * @return {Number} Top offset
     */
    _getTopOffset(this: fabric.Text) {
      if (!this.height) return 0

      switch (this.verticalAlign) {
        case 'middle':
          return -this._getTotalLineHeights() / 2
        case 'bottom':
          return this.height / 2 - this._getTotalLineHeights()
        default:
          return -this.height / 2
      }
    },

    /**
     * Get the SVG offsets left/top.
     *
     * @private
     */
    _getSVGLeftTopOffsets(this: fabric.Text) {
      return {
        textLeft: this.width === undefined ? 0 : -this.width / 2,
        textTop: this._getTopOffset(),
        lineTop: this.getHeightOfLine(0),
      }
    },
  })

  instance.util.object.extend(instance.IText.prototype, {
    /**
     * Get the selection stzrt offset Y.
     *
     * @return {number}
     */
    _getSelectionStartOffsetY(this: fabric.IText) {
      if (!this.height) return 0

      switch (this.verticalAlign) {
        case 'middle':
          return this.height / 2 - this._getTotalLineHeights() / 2
        case 'bottom':
          return this.height - this._getTotalLineHeights()
        default:
          return 0
      }
    },

    /**
     * Returns index of a character corresponding to where an object was clicked
     *
     * @param {Event} e Event object
     * @return {Number} Index of a character
     */
    getSelectionStartFromPointer(this: fabric.IText, e: MouseEvent) {
      const mouseOffset = this.getLocalPointer(e)
      const { scaleX = 1, scaleY = 1 } = this
      const { length } = this._textLines
      let prevWidth = 0
      let width = 0
      let height = 0
      let charIndex = 0
      let lineIndex = 0
      let lineLeftOffset
      let line
      let jlen

      let startY = this._getSelectionStartOffsetY()
      for (let i = 0; i < length; i++) {
        if (startY + height <= mouseOffset.y) {
          height += this.getHeightOfLine(i) * scaleY
          lineIndex = i
          if (i > 0) {
            charIndex += this._textLines[i - 1].length + this.missingNewlineOffset(i - 1)
          }
        } else {
          break
        }
      }

      lineLeftOffset = this._getLineLeftOffset(lineIndex)

      width = lineLeftOffset * scaleX

      line = this._textLines[lineIndex]
      jlen = line.length

      for (let j = 0; j < jlen; j++) {
        prevWidth = width
        const { kernedWidth = 0 } = this.__charBounds?.[lineIndex][j] || {}
        width += kernedWidth * scaleX
        if (width <= mouseOffset.x) {
          charIndex++
        } else {
          break
        }
      }

      return this._getNewSelectionStartFromOffset(mouseOffset, prevWidth, width, charIndex, jlen)
    },
  })
}

if (window.fabric) {
  install(window.fabric)
}
