export interface CallbackExtensions<T> {
  /** Runs **callback** using the given value, and returns the new result */
  let<O>(this: T, callback: (it: T) => O): O;
  /** Runs **callback** using the given value, and returns the initial value */
  also(this: T, callback: (it: T) => void): T;
}

export function extensionLet<T>(this: T, callback: (it: any) => any): any {
  return callback(this);
}

export function extensionAlso<T>(this: T, callback: (it: any) => void): T {
  callback(this);
  return this;
}
