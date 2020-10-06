import { Console } from 'console'
import { fabric } from 'fabric'
import { CustomEvent } from 'fabric/fabric-impl'
import { extendMethod } from './utils'

declare module 'fabric' {
  namespace fabric {
    let events: { [key: string]: (this: Object, object: Object, event: CustomEvent) => void }
    interface Object {
      events: CustomEvent[]
      __setEventsProxy(): void
      __eventsProxySetHandler(
        callbacks: any[],
        events: CustomEvent[],
        index: number,
        event: CustomEvent,
        receiver: any
      ): boolean
      __eventsProxyDeleteHandler(callbacks: any[], events: CustomEvent[], index: number): boolean
    }
    interface CustomEvent {
      name?: string
      trigger: 'mousedown' | 'mouseup' | 'mouseover' | 'dblclick' | 'tripleclick' | string
      data?: any
    }
  }
}

export function install(instance: typeof fabric) {
  instance.events = {}

  instance.util.object.extend(instance.Object.prototype, {
    /**
     * List of stored events.
     */
    events: [],

    /**
     * Extend the initialize function to register events on initialization.
     *
     * @return {instance.Object}
     */
    initialize: extendMethod(instance.Object, 'initialize', function () {
      this.on('added', this.__setEventsProxy.bind(this))
    }),

    /**
     * Set the events array as a proxy  to automatically register
     * and unregister events on array  changes.
     */
    __setEventsProxy(this: fabric.Object) {
      const callbacks: ((...args: any) => void)[] = []
      const events: CustomEvent[] = [...this.events]

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
      callbacks: any[],
      events: CustomEvent[],
      index: number,
      event: CustomEvent,
      receiver: any
    ) {
      if (!isNaN(index)) {
        if (event.name && instance.events[event.name]) {
          callbacks[index] = instance.events[event.name].bind(this, this, event)
          this.on(event.trigger, callbacks[index])
          this.canvas?.fire('object:modified', { target: this })
        } else {
          throw new Error('This event does not exist.')
        }
      }

      return Reflect.set(events, index, event, receiver)
    },

    /**
     * Delete handler for events proxy.
     *
     * @param callbacks
     * @param events
     * @param index
     */
    __eventsProxyDeleteHandler(callbacks: any[], events: CustomEvent[], index: number) {
      if (!isNaN(index)) {
        this.off(events[index].trigger, callbacks[index])
        this.canvas?.fire('object:modified', { target: this })
      }

      return Reflect.deleteProperty(events, index)
    },

    /**
     * Extend the toObject function to include the events propeprty.
     *
     * @return {any}
     */
    toObject: extendMethod(instance.Object, 'toObject', function (object: any) {
      object.events = this.events
      return object
    }),
  })
}

if (window.fabric) {
  install(window.fabric)
}
