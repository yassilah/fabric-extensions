import { fabric } from 'fabric'
import objectExportEvents from './../src/object.export-events'

describe('object export events', () => {
  it('should install: object.export-events', () => {
    expect(fabric.util.installedExtensions?.['object.export-events']).toBeUndefined()
    expect(fabric.util.registerEvent).toBeUndefined()
    expect(fabric.events).toBeUndefined()
    expect(fabric.Rect.prototype.events).toBeUndefined()
    objectExportEvents(fabric)
    expect(fabric.util.installedExtensions['object.export-events']).toBe(true)
    expect(fabric.util.registerEvent).toBeDefined()
    expect(fabric.events).toStrictEqual({})
    expect(fabric.Rect.prototype.events).toStrictEqual([])
  })

  it('should register an event', () => {
    const name = 'test-1'
    const callback = () => alert('test')
    expect(fabric.events).toStrictEqual({})
    fabric.util.registerEvent(name, callback)
    expect(fabric.events).toStrictEqual({ [name]: callback })
  })

  it('should create an events proxy', () => {
    jest.spyOn(fabric.Rect.prototype, '__setEventsProxy')
    const canvas = new fabric.Canvas(document.createElement('canvas'))
    const object = new fabric.Rect()
    expect(object.__setEventsProxy).not.toHaveBeenCalledTimes(1)
    expect(object.events).toStrictEqual([])
    canvas.add(object)
    expect(object.__setEventsProxy).toHaveBeenCalledTimes(1)
    expect(object.events).toStrictEqual([])
  })

  it('should not trigger proxy handler when selection: true', () => {
    const canvas = new fabric.Canvas(document.createElement('canvas'), { selection: true })
    const object = new fabric.Rect()
    jest.spyOn(object, '__registerEvent')
    jest.spyOn(object, '__unregisterEvent')
    canvas.add(object)
    const event = { name: 'test-1', trigger: 'mousedown' }
    object.events.push(event)

    expect(object.__registerEvent).not.toHaveBeenCalled()
    expect(object.events).toStrictEqual([event])
    expect(object.hoverCursor).toBeFalsy()

    object.events.splice(object.events.indexOf(event), 1)

    expect(object.__unregisterEvent).not.toHaveBeenCalled()
    expect(object.events).toStrictEqual([])
    expect(object.hoverCursor).toBeFalsy()
  })

  it('should trigger proxy handler when selection: false', () => {
    fabric.events = { 'test-1': () => alert('test-1') }
    const canvas = new fabric.Canvas(document.createElement('canvas'), { selection: false })
    const object = new fabric.Rect()
    jest.spyOn(object, '__registerEvent')
    jest.spyOn(object, '__unregisterEvent')
    canvas.add(object)
    const event = { name: 'test-1', trigger: 'mousedown' }
    object.events.push(event)

    expect(object.__registerEvent).toHaveBeenCalledTimes(1)
    expect(object.events).toStrictEqual([event])
    expect(object.hoverCursor).toBe('pointer')
    expect(object.__eventListeners).toHaveProperty(event.trigger)

    object.events.splice(object.events.indexOf(event), 1)

    expect(object.__unregisterEvent).toHaveBeenCalledTimes(1)
    expect(object.events).toStrictEqual([])
    expect(object.hoverCursor).toBeFalsy()
    expect(object.__eventListeners).toHaveProperty(event.trigger, [false])
  })

  it('should throw error when event does not exist', () => {
    fabric.events = {}
    const canvas = new fabric.Canvas(document.createElement('canvas'), { selection: false })
    const object = new fabric.Rect()
    canvas.add(object)
    const event = { name: 'test-1', trigger: 'mousedown' }
    expect(() => object.events.push(event)).toThrowError()
  })

  it('should add the events to the JSON', () => {
    fabric.events = { 'test-1': () => alert('test-1') }
    const canvas = new fabric.Canvas(document.createElement('canvas'), {
      selection: false,
      includeDefaultValues: false,
    })
    const object = new fabric.Rect()
    canvas.add(object)
    const event = { name: 'test-1', trigger: 'mousedown' }
    object.events.push(event)
    expect(object.toJSON()).toHaveProperty('events', [event])
  })
})
