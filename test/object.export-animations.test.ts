import { fabric } from 'fabric'
import objectExportAnimations from './../src/object.export-animations'

describe('object export animations', () => {
  it('should install: object.export-animations', () => {
    expect(fabric.util.installedExtensions?.['object.export-animations']).toBeUndefined()
    expect(fabric.util.registerAnimation).toBeUndefined()
    expect(fabric.animations).toBeUndefined()
    expect(fabric.Rect.prototype.animations).toBeUndefined()
    objectExportAnimations(fabric)
    expect(fabric.util.installedExtensions['object.export-animations']).toBe(true)
    expect(fabric.util.registerAnimation).toBeDefined()
    expect(fabric.animations).toStrictEqual({})
    expect(fabric.Rect.prototype.animations).toStrictEqual([])
  })

  it('should register an animation', () => {
    const name = 'test-1'
    const callback = () => ({})
    expect(fabric.animations).toStrictEqual({})
    fabric.util.registerAnimation(name, callback)
    expect(fabric.animations).toStrictEqual({ [name]: callback })
  })

  it('should create an animations proxy', () => {
    jest.spyOn(fabric.Rect.prototype, '__setAnimationsProxy')
    const canvas = new fabric.Canvas(document.createElement('canvas'))
    const object = new fabric.Rect()
    expect(object.__setAnimationsProxy).not.toHaveBeenCalledTimes(1)
    expect(object.animations).toStrictEqual([])
    canvas.add(object)
    expect(object.__setAnimationsProxy).toHaveBeenCalledTimes(1)
    expect(object.animations).toStrictEqual([])
  })

  it('should not trigger proxy handler when selection: true', () => {
    const canvas = new fabric.Canvas(document.createElement('canvas'), { selection: true })
    const object = new fabric.Rect()
    jest.spyOn(object, '__registerAnimation')
    jest.spyOn(object, '__unregisterAnimation')
    canvas.add(object)
    const animation = { name: 'test-1', trigger: 'mousedown' }
    object.animations.push(animation)

    expect(object.__registerAnimation).not.toHaveBeenCalled()
    expect(object.animations).toStrictEqual([animation])

    object.animations.splice(object.animations.indexOf(animation), 1)

    expect(object.__unregisterAnimation).not.toHaveBeenCalled()
    expect(object.animations).toStrictEqual([])
  })

  it('should trigger proxy handler when selection: false', () => {
    fabric.animations = { 'test-1': () => ({}) }
    const canvas = new fabric.Canvas(document.createElement('canvas'), { selection: false })
    const object = new fabric.Rect()
    jest.spyOn(object, '__registerAnimation')
    jest.spyOn(object, '__unregisterAnimation')
    canvas.add(object)
    const animation = { name: 'test-1', trigger: 'mousedown' }
    object.animations.push(animation)

    expect(object.__registerAnimation).toHaveBeenCalledTimes(1)
    expect(object.animations).toStrictEqual([animation])

    object.animations.splice(object.animations.indexOf(animation), 1)

    expect(object.__unregisterAnimation).toHaveBeenCalledTimes(1)
    expect(object.animations).toStrictEqual([])
  })

  it('should add the animations to the JSON', () => {
    fabric.animations = { 'test-1': () => ({}) }
    const canvas = new fabric.Canvas(document.createElement('canvas'), {
      selection: false,
      includeDefaultValues: false,
    })
    const object = new fabric.Rect()
    canvas.add(object)
    const animation = { name: 'test-1', trigger: 'mousedown' }
    object.animations.push(animation)
    expect(object.toJSON()).toHaveProperty('animations', [animation])
  })
})
