import { fabric } from 'fabric'
import { IEvent } from 'fabric/fabric-impl'
import { extendMethod, extension } from './utils'

export default extension('object.export-events', (fabric) => {
  /**
   * ist of available events.
   */
  fabric.events = {}

  /**
   * Register a new event.
   *
   * @param name
   * @param callback
   */
  fabric.util.registerEvent = function (name, callback) {
    fabric.events[name] = callback
  }

  /**
   * Extend object.
   */
  fabric.util.object.extend(fabric.Object.prototype, {
    /**
     * List of stored events.
     */
    events: [],

    /**
     * Extend the initialize function to register events on initialization.
     *
     * @return {fabric.Object}
     */
    initialize: extendMethod(fabric.Object, 'initialize', function (this: fabric.Object) {
      this.on('added', this.__setEventsProxy.bind(this))
    }),

    /**
     * Set the events array as a proxy  to automatically register
     * and unregister events on array  changes.
     */
    __setEventsProxy(this: fabric.Object) {
      const callbacks: ((...args: any) => void)[] = []
      const events: fabric.CustomEvent[] = [...this.events]

      this.events = new Proxy(events, {
        set: this.__eventsProxySetHandler.bind(this, callbacks),
        deleteProperty: this.__eventsProxyDeleteHandler.bind(this, callbacks),
      })

      this.events.splice(0, events.length, ...events)
    },

    /**
     * Set handler for events proxy.
     *
     * @param callbacks
     * @param events
     * @param index
     * @param event
     * @param receiver
     */
    __eventsProxySetHandler(
      this: fabric.Object,
      callbacks: any[],
      events: fabric.CustomEvent[],
      index: number,
      event: fabric.CustomEvent,
      receiver: any
    ) {
      const value = Reflect.set(events, index, event, receiver)

      if (value && !this.canvas?.selection && !isNaN(index)) {
        this.__registerEvent(callbacks, index, event)

        if (events.length > 0) {
          this.hoverCursor = 'pointer'
        }
      }

      return value
    },

    /**
     * Regiter a new event.
     *
     * @param callbacks
     * @param index
     * @param event
     */
    __registerEvent(
      this: fabric.Object,
      callbacks: any[],
      index: number,
      event: fabric.CustomEvent
    ) {
      if (event.name && fabric.events[event.name]) {
        callbacks[index] = fabric.events[event.name].bind(this, this, event)
        this.on(event.trigger, callbacks[index])
        this.canvas?.fire('object:modified', { target: this })
      } else {
        throw new Error('This event does not exist.')
      }
    },

    /**
     * Delete handler for events proxy.
     *
     * @param callbacks
     * @param events
     * @param index
     */
    __eventsProxyDeleteHandler(
      this: fabric.Object,
      callbacks: any[],
      events: fabric.CustomEvent[],
      index: number
    ) {
      const event = events[index]
      const value = Reflect.deleteProperty(events, index)

      if (value && !this.canvas?.selection && !isNaN(index)) {
        this.__unregisterEvent(callbacks, event, index)

        if (events.length === 1) {
          this.hoverCursor = ''
        }
      }

      return value
    },

    /**
     * Unregiter an event.
     *
     * @param callbacks
     * @param index
     * @param event
     */
    __unregisterEvent(
      this: fabric.Object,
      callbacks: any[],
      event: fabric.CustomEvent,
      index: number
    ) {
      this.off(event.trigger, callbacks[index])
      this.canvas?.fire('object:modified', { target: this })
    },

    /**
     * Extend the toObject function to include the events propeprty.
     *
     * @return {any}
     */
    toObject: extendMethod(fabric.Object, 'toObject', function (object: any) {
      object.events = this.events
      return object
    }),
  })
})

declare module 'fabric' {
  namespace fabric {
    let events: {
      [key: string]: <T extends Object = Object>(object: T, event: CustomEvent, e: IEvent) => void
    }
    interface Object {
      __eventListeners?: { [key: string]: ((event: IEvent) => void)[] }
      events: CustomEvent[]
      __setEventsProxy(): void
      __eventsProxySetHandler(
        callbacks: any[],
        events: CustomEvent[],
        index: number,
        event: CustomEvent,
        receiver: any
      ): boolean
      __registerEvent(callbacks: any[], index: number, event: CustomEvent): void
      __eventsProxyDeleteHandler(callbacks: any[], events: CustomEvent[], index: number): boolean
      __unregisterEvent(callbacks: any[], event: CustomEvent, index: number): void
    }
    interface CustomEvent {
      name?: string
      trigger: 'mousedown' | 'mouseup' | 'mouseover' | 'dblclick' | 'tripleclick' | string
      data?: any
    }
    interface IUtil {
      registerEvent(
        name: string,
        callback: <T extends Object = Object>(object: T, event: CustomEvent, e: IEvent) => void
      ): void
    }
  }
}
