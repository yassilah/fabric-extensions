declare type PropsName<T> = Exclude<
  {
    [K in keyof T]: T[K] extends Function ? never : K
  }[keyof T],
  undefined
>

declare type OnlyProps<T> = Pick<T, PropsName<T>>

declare type MethodsName<T> = Exclude<
  {
    [K in keyof T]: T[K] extends Function ? K : never
  }[keyof T],
  undefined
>

declare type OnlyMethods<T> = Pick<T, MethodsName<T>>
