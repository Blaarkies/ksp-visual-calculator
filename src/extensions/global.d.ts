import { CallbackExtensions } from './callback-extensions';

export {}; // this file needs to be a module

declare global {

  interface String extends CallbackExtensions<string> {
    /** Returns a true when the string is contained inside `list`. */
    includesSome(this: string, list: string[]): boolean;

    /** Returns a title case version. */
    toTitleCase(this: string): string;

    /** Returns true if `search` matches, disregards letter casing or trimmed whitespace. */
    like(this: string, search: string): boolean;

    /** Returns true if `search` is contained. */
    fuzzyMatch(this: string, search: string): boolean;

    /** Returns a score number describing how well `search` matched. */
    relevanceScore(this: string, search: string): number;

    /** Return the string in number format */
    toNumber(this: string): number;

    /** Return the string in boolean format */
    toBoolean(this: string): boolean;
  }

  interface Number extends CallbackExtensions<number> {
    /** Returns true if the value is `NaN` when converted to a number. */
    isNaN(this: number): boolean;

    /** Returns the result of the value raised by `power`. */
    pow(this: number, power: number): number;

    /** Returns the result of the value rounded to the nearest integer. */
    toInt(this: number): number;

    /** Returns the result of the value rounded to the nearest `decimals` count. */
    round(this: number, decimals?: number): number;

    /** Returns the square root of the value. */
    sqrt(this: number): number;

    /** Returns true if the value is odd. */
    odd(this: number): boolean;

    /** Returns the transformed result of the value, according to a chosen mapping function. */
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

    /**
     * Returns true when all pairs of elements from both arrays are equal.
     * Use the predicate to define the required equality.
     * @param other array to compare
     * @param predicate callback to define equality
     */
    equal(this: Array<T>, other: Array<T>, predicate?: (a: T, b: T) => boolean): boolean;

    sum(this: Array<number | any>, selector?: (item: any) => number): number;

    min(this: Array<T>, selector?: (item: T) => number): T;

    max(this: Array<T>, selector?: (item: T) => number): T;

    add(this: Array<T>, fresh: T): Array<T>;

    replace(this: Array<T>, stale: T, fresh: T, addIfAbsent?: boolean): Array<T>;

    /**
     * Removes the stale element from this array in place and returns the modified array.
     * @param stale The element to be removed.
     * @returns This array.
     */
    remove(this: Array<T>, stale: T): Array<T>;

    flatMap<U = T>(this: Array<T>, selectorCallback?: (item: T) => U): U;

    distinct(this: Array<T>, indexCallback?: (parentItem: T, list: Array<T>) => number): Array<T>;

    /**
     * Returns an array joined with itself, where each element is paired with every
     * element in the array. Each pair is a 2 element array.
     * @example
     * `[1,2].joinSelf()` will return `[[1,1], [1,2], [2,1], [2,2]]`
     */
    joinSelf(this: Array<T>): Array<Array<T>>;

    /**
     * Returns an array will with all elements except those found in `other` array.
     * @param other list of items to be excluded
     * @param selector callback used to determine element exclusion using properties
     */
    except(this: Array<T>, other: Array<T>, selector?: (item: T) => unknown): Array<T>;

    windowed(this: Array<T>, size: number, step?: number, partialWindows?: boolean): Array<Array<T>>;

    /**
     * Returns a list split into separate lists indexed by the value of the `indexer` callback.
     * @param indexer
     */
    splitFilter(this: Array<T>, indexer: (item: T) => number): Array<Array<T>>;
  }

  interface Boolean extends CallbackExtensions<boolean> {
    toString(this: Boolean, variety?: 'yes' | 'good' | '✅' | 'on'): string;
  }

}
