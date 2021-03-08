export {}; // this file needs to be a module

Number.prototype.let = function (this: number, callback: (it) => any): any {
  return callback(this);
};

Number.prototype.also = function (this: number, callback: (it) => void): number {
  callback(this);
  return this;
};

Number.prototype.pow = function (this: number, exponent: number = 2): number {
  return Math.pow(Number(this), exponent);
};

Number.prototype.sqrt = function (this: number): number {
  return Math.sqrt(Number(this));
};

Number.prototype.odd = function (this: number): boolean {
  return this % 2 !== 0;
};

Number.prototype.bitwiseIncludes = function (this: number, value: number): boolean {
  return (this & value) === value;
};

Number.prototype.coerceAtLeast = function (this: number, threshold: number = 0): number {
  return this < threshold ? threshold : this;
};

Number.prototype.coerceAtMost = function (this: number, threshold: number = 0): number {
  return this > threshold ? threshold : this;
};

Number.prototype.coerceIn = function (this: number, lower: number = 0, upper: number = 1): number {
  if (lower > upper) {
    throw `lower "${lower}" must be less than or equal to upper "${upper}"`;
  }
  let lowLimitedValue = this.coerceAtLeast(lower);
  return lowLimitedValue.coerceAtMost(upper);
};
