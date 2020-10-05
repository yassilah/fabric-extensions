import { fabric } from 'fabric'
import { install as textVerticalAlign } from './text.vertical-align'
import { install as imageImport } from './image.import'
import { install as canvasCoverBackground } from './canvas.cover-background'
import { install as objectExportEvents } from './object.export-events'
import { install as objectExportAnimations } from './object.export-animations'
import { install as canvasShortcutsDelete } from './canvas.shortcuts.delete'
import { install as canvasShortcutsSelectAll } from './canvas.shortcuts.select-all'
import { install as canvasShortcutsMove } from './canvas.shortcuts.move'
import { install as canvasShortcutsOrder } from './canvas.shortcuts.order'
import { install as canvasShortcutsRotate } from './canvas.shortcuts.rotate'
import { install as canvasShortcutsGroup } from './canvas.shortcuts.group'
import { install as canvasShortcutsCopy } from './canvas.shortcuts.copy'
import { install as canvasDrop } from './canvas.drop'

import { install as canvasShortcuts } from './canvas.shortcuts'
import { install as canvasExternalElements } from './canvas.external-elements'

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
}
