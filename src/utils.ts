import { fabric } from 'fabric'

export function extendMethod<
  T extends typeof fabric.StaticCanvas | typeof fabric.Object | typeof fabric.Text,
  M extends MethodsName<T['prototype']>
>(shape: T, methodName: M, callback: (this: InstanceType<T>, ...args: any) => any) {
  const prototype = shape.prototype as T['prototype']
  const original = prototype[methodName] as Function
  return function (this: InstanceType<T>) {
    const result = original.apply(this, arguments)
    callback.call(this, result)
    return result
  }
}
