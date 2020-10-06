import { fabric } from 'fabric'

declare module 'fabric' {
  namespace fabric {
    let events: {
      [key: string]: <T extends fabric.Object = fabric.Object>(
        object: T,
        event: fabric.CustomEvent,
        e: fabric.IEvent
      ) => void
    }
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
    interface IUtil {
      registerEvent(
        name: string,
        callback: <T extends fabric.Object = fabric.Object>(
          object: T,
          event: fabric.CustomEvent,
          e: fabric.IEvent
        ) => void
      ): void
    }
  }
}
