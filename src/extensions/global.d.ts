export {}; // this file needs to be a module
declare global {

  interface String {
    let<O>(this: String, callback: (it: String) => O): O;

    also(this: String, callback: (it: String) => void): String;
  }

  interface Number {
    let<O>(this: number, callback: (it: number) => O): O;

    also(this: number, callback: (it: number) => void): number;

    pow(this: number, exponent: number): number;

    sqrt(this: number): number;

    odd(this: number): boolean;

    bitwiseIncludes(this: number, value: number): boolean;

    coerceAtLeast(this: number, threshold: number): number;

    coerceAtMost(this: number, threshold: number): number;

    coerceIn(this: number, lower: number, upper: number): number;
  }

  interface Array<T> {
    shuffle(this: Array<T>): Array<T>;

    sortByRelevance(this: Array<T>, callback: (item) => number): Array<T>;

    count(this: Array<T>, callback: (item) => boolean): number;

    first(this: Array<T>): T;

    sum(this: Array<number>): number;

    replace(this: Array<T>, stale: T, fresh: T): Array<T>;

    flatMap(this: Array<T>, selectorCallback?: (item: T) => T): Array<any>;

    distinct(this: Array<T>, indexCallback?: (parentItem: T, list: Array<T>) => number): Array<T>;

    joinSelf(this: Array<T>): Array<Array<T>>;
  }

  // interface Object {
  //   let<T, O>(this: T, callback: (it: T) => O): O;
  //
  //   also<T>(this: T, callback: (it: T) => void): T;
  // }

  interface Boolean {
    toString(this: Boolean, variety?: 'yes' | 'good' | '✅'): string;

    let<O>(this: Boolean, callback: (it: Boolean) => O): O;

    also(this: Boolean, callback: (it: Boolean) => void): Boolean;
  }

}
