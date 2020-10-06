import { fabric } from 'fabric'

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
