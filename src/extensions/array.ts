export {}; // this file needs to be a module

Array.prototype.shuffle = function (this: Array<any>): Array<any> {
  return this
    .map(item => ({sort: Math.random(), value: item}))
    .sort((a, b) => a.sort - b.sort)
    .map(pair => pair.value);
};

Array.prototype.sortByRelevance = function (this: Array<any>, callback: (item: any) => number, minimumRelevance = 1): Array<any> {
  return this
    .map(item => ({sort: callback(item), value: item}))
    .filter(({sort}) => sort >= minimumRelevance)
    .sort((a, b) => b.sort - a.sort)
    .map(pair => pair.value);
};

Array.prototype.count = function (this: Array<any>, callback: (item: any) => boolean): number {
  return this.filter(callback).length;
};

Array.prototype.first = function (this: Array<any>): any {
  return this[0];
};

Array.prototype.last = function (this: Array<any>): any {
  return this[this.length - 1];
};

Array.prototype.sum = function (this: Array<number>, selector?: (item: any) => number): number {
  return selector
    ? this.reduce((total, c) => total + selector(c), 0)
    : this.reduce((total, c) => total + c, 0);
};

Array.prototype.max = function (this: Array<any>, selector?: (item: any) => number): any {
  return selector
    ? this.reduce((result, c) => {
      let selected = selector(c);
      if (selected > result.value) {
        result.value = selected;
        result.item = c;
      }
      return result;
    }, {value: Number.MIN_VALUE, item: undefined})
      .item
    : Math.max(...this);
};

Array.prototype.min = function (this: Array<any>, selector?: (item: any) => number): any {
  return selector
    ? this.reduce((result, c) => {
      let selected = selector(c);
      if (selected < result.value) {
        result.value = selected;
        result.item = c;
      }
      return result;
    }, {value: Number.MAX_VALUE, item: undefined})
      .item
    : Math.min(...this);
};

Array.prototype.add = function (this: Array<any>, fresh: any): Array<any> {
  this.push(fresh);
  return this;
};

Array.prototype.replace = function (this: Array<any>, stale: any, fresh: any, addIfAbsent = false): Array<any> {
  let index = this.indexOf(stale);
  (addIfAbsent && index === -1)
    ? this.push(fresh)
    : this[index] = fresh;

  return this;
};

Array.prototype.remove = function (this: Array<any>, stale: any): Array<any> {
  let index = this.indexOf(stale);
  if (index === -1) {
    throw new Error(`Stale element not found in array, cannot remove it`);
  }

  this.splice(index, 1);
  return this;
};

Array.prototype.distinct
  = function (this: Array<any>, indexCallback?: (parentItem: any, list: any[]) => number): Array<any> {
  return indexCallback
    ? this.filter((parentItem, index, list) => indexCallback(parentItem, list) !== index)
    : this.filter((item, index, list) => list.indexOf(item) === index);
};

Array.prototype.joinSelf = function (this: Array<any>): Array<Array<any>> {
  return this.map((item, i, list) =>
    list.map(innerItem => [item, innerItem]))
    .flat();
};

Array.prototype.except = function (this: Array<any>,
                                   other: Array<any>,
                                   selector?: (item: any) => any): Array<any> {
  let mappedOther = selector
    ? other.map(item => selector(item))
    : other;
  const toRemove = new Set(mappedOther);
  return this.filter(item => !toRemove.has(selector ? selector(item) : item));
};

/**
 * Returns a list of snapshots of the window of the given size sliding along this collection with the given step, where
 * each snapshot is a list. Several last lists may have fewer elements than the given size. Both size and step must be
 * positive and can be greater than the number of elements in this collection.
 * @param size - the number of elements to take in each window
 * @param step - the number of elements to move the window forward by on an each step, by default 1
 * @param partialWindows - controls whether or not to keep partial windows in the end if any, by default false which
 *   means partial windows won't be preserved
 */
Array.prototype.windowed = function (this: Array<any>,
                                     size: number,
                                     step: number = 1,
                                     partialWindows: boolean = false): Array<Array<any>> {
  let result = [];
  this.some((el, i) => {
    if (i % step !== 0) {
      return false;
    }
    if (i + size > this.length) {
      return true;
    }
    result.push(this.slice(i, i + size));
  });
  return result;
};

Array.prototype.filterSplit = function (this: Array<any>,
                                        indexer: (item: any) => number): Array<Array<any>> {
  let resultLists = [];
  for (let item of this) {
    let destinationKey = indexer(item);
    resultLists[destinationKey]
      ? resultLists[destinationKey].push(item)
      : resultLists[destinationKey] = [item];
  }

  return resultLists;
};

Array.prototype.random = function (this: Array<any>): any {
  let randomIndex = Math.round(Math.random() * (this.length - 1));
  return this[randomIndex];
};

/**
 * Checks whether elements are equal in both arrays
 * @param other
 * @param predicate
 */
Array.prototype.equal = function (this: Array<unknown>,
                                  other: Array<unknown>,
                                  predicate?: (a: unknown, b: unknown) => boolean): boolean {
  if (this.length !== other.length) {
    return false;
  }

  return this.every((e, i) => predicate
    ? predicate(e, other[i])
    : e === other[i]);
};
