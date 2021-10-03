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

Array.prototype.sum = function (this: Array<number>): number {
  return this.reduce((total, c) => total + c, 0);
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

Array.prototype.flatMap = function (this: Array<any>, selectorCallback: (item: any) => any
  = item => item): Array<any> {
  return this.reduce((sum, c) => [...sum, ...selectorCallback(c)], []);
};

Array.prototype.distinct
  = function (this: Array<any>, indexCallback?: (parentItem: any, list: any[]) => number): Array<any> {
  return indexCallback
    ? this.filter((parentItem, index, list) => indexCallback(parentItem, list) !== index)
    : this.filter((item, index, list) => list.indexOf(item) !== index);
};

Array.prototype.joinSelf = function (this: Array<any>): Array<Array<any>> {
  return this.map((item, i, list) =>
    list.map(innerItem => [item, innerItem]))
    .flatMap();
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

