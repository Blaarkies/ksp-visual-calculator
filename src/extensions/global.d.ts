export {}; // this file needs to be a module
declare global {

  interface String {
    toTitleCase(this: string): string;

    like(this: string, search: string): boolean;

    fuzzyMatch(this: string, search: string): boolean;

    relevanceScore(this: string, search: string): number;

    toNumber(this: string): number;

    toBoolean(this: string): boolean;

    let<O>(this: String, callback: (it: String) => O): O;

    also(this: String, callback: (it: String) => void): String;
  }

  interface Number {
    let<O>(this: number, callback: (it: number) => O): O;

    also(this: number, callback: (it: number) => void): number;

    isNaN(this: number): boolean;

    pow(this: number, exponent: number): number;

    toInt(this: number): number;

    round(this: number, decimals?: number): number;

    sqrt(this: number): number;

    odd(this: number): boolean;

    transform(this: number, type: 'log' | 'eo-parab' | 'ei-parab'): number;

    sign(this: number): number;

    between(this: number, lower: number, upper: number, exclusive?: boolean): boolean;

    lerp(this: number, other: number, ratio?: number): number;

    bitwiseIncludes(this: number, value: number): boolean;

    coerceAtLeast(this: number, threshold: number): number;

    coerceAtMost(this: number, threshold: number): number;

    coerceIn(this: number, lower: number, upper: number): number;

    toSi(this: number, decimals?: number): string;
  }

  interface Array<T> {
    shuffle(this: Array<T>): Array<T>;

    sortByRelevance(this: Array<T>, callback: (item) => number, minimumRelevance?: number): Array<T>;

    count(this: Array<T>, callback: (item) => boolean): number;

    first(this: Array<T>): T;

    last(this: Array<T>): T;

    random(this: Array<T>): T;

    sum(this: Array<number>): number;

    add(this: Array<T>, fresh: T): Array<T>;

    replace(this: Array<T>, stale: T, fresh: T, addIfAbsent?: boolean): Array<T>;

    /** Removes stale item from array, in-place */
    remove(this: Array<T>, stale: T): Array<T>;

    flatMap(this: Array<T>, selectorCallback?: (item: T) => T): Array<any>;

    distinct(this: Array<T>, indexCallback?: (parentItem: T, list: Array<T>) => number): Array<T>;

    joinSelf(this: Array<T>): Array<Array<T>>;

    except(this: Array<T>, other: Array<any>, selector?: (item: any) => any): Array<T>;

    windowed(this: Array<T>, size: number, step?: number, partialWindows?: boolean): Array<Array<T>>;

    splitFilter(this: Array<T>, callback: (item: T) => number): Array<Array<T>>;
  }

  interface Boolean {
    toString(this: Boolean, variety?: 'yes' | 'good' | '✅' | 'on'): string;

    let<O>(this: Boolean, callback: (it: Boolean) => O): O;

    also(this: Boolean, callback: (it: Boolean) => void): Boolean;
  }

}
