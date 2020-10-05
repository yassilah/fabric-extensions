import { fabric } from 'fabric'
import { install as textVerticalAlign } from './text.vertical-align'
import { install as imageImport } from './image.import'
import { install as canvasCoverBackground } from './canvas.cover-background'
import { install as objectExportEvents } from './object.export-events'
import { install as objectExportAnimations } from './object.export-animations'

export function install(instance: typeof fabric) {
  textVerticalAlign(instance)
  imageImport(instance)
  canvasCoverBackground(instance)
  objectExportEvents(instance)
  objectExportAnimations(instance)
}

if (window.fabric) {
  install(window.fabric)
}

export {
  textVerticalAlign,
  imageImport,
  canvasCoverBackground,
  objectExportEvents,
  objectExportAnimations,
}
