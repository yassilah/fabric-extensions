import { fabric } from 'fabric'

import { default as textVerticalAlign } from './text.vertical-align'
import { default as imageImport } from './image.import'
import { default as canvasCoverBackground } from './canvas.cover-background'
import { default as objectExportEvents } from './object.export-events'
import { default as objectExportAnimations } from './object.export-animations'
import { default as canvasShortcutsDelete } from './canvas.shortcuts.delete'
import { default as canvasShortcutsSelectAll } from './canvas.shortcuts.select-all'
import { default as canvasShortcutsMove } from './canvas.shortcuts.move'
import { default as canvasShortcutsOrder } from './canvas.shortcuts.order'
import { default as canvasShortcutsRotate } from './canvas.shortcuts.rotate'
import { default as canvasShortcutsGroup } from './canvas.shortcuts.group'
import { default as canvasShortcutsCopy } from './canvas.shortcuts.copy'
import { default as canvasDrop } from './canvas.drop'
import { default as canvasGuidelines } from './canvas.guidelines'
import { default as canvasShortcuts } from './canvas.shortcuts'
import { default as canvasExternalElements } from './canvas.external-elements'
import { default as canvasToDataUrlPromise } from './canvas.to-data-url-promise'
import { default as icon } from './icon'
import { default as map } from './map'
import { default as arrow } from './arrow'

export function install(instance: typeof fabric) {
  textVerticalAlign(instance)
  imageImport(instance)
  canvasCoverBackground(instance)
  objectExportEvents(instance)
  objectExportAnimations(instance)
  canvasShortcuts(instance)
  canvasShortcutsDelete(instance)
  canvasShortcutsSelectAll(instance)
  canvasShortcutsMove(instance)
  canvasShortcutsOrder(instance)
  canvasShortcutsRotate(instance)
  canvasShortcutsGroup(instance)
  canvasExternalElements(instance)
  canvasShortcutsCopy(instance)
  canvasDrop(instance)
  canvasGuidelines(instance)
  canvasToDataUrlPromise(instance)
  icon(instance)
  map(instance)
  arrow(instance)
}

export {
  textVerticalAlign,
  imageImport,
  canvasCoverBackground,
  objectExportEvents,
  objectExportAnimations,
  canvasShortcuts,
  canvasShortcutsDelete,
  canvasShortcutsSelectAll,
  canvasShortcutsMove,
  canvasShortcutsOrder,
  canvasShortcutsRotate,
  canvasShortcutsGroup,
  canvasExternalElements,
  canvasShortcutsCopy,
  canvasDrop,
  canvasGuidelines,
  canvasToDataUrlPromise,
  icon,
  map,
  arrow,
}

if (window.fabric) {
  install(window.fabric)
}
