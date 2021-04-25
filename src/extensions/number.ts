export {}; // this file needs to be a module

Number.prototype.let = function (this: number, callback: (it) => any): any {
  return callback(this);
};

Number.prototype.also = function (this: number, callback: (it) => void): number {
  callback(this);
  return this;
};

Number.prototype.isNaN = function (this: number): boolean {
  return isNaN(this);
};

Number.prototype.pow = function (this: number, exponent: number = 2): number {
  return Math.pow(this, exponent);
};

Number.prototype.toInt = function (this: number): number {
  return Math.round(this);
};

Number.prototype.sqrt = function (this: number): number {
  return Math.sqrt(this);
};

Number.prototype.between = function (this: number,
                                     lower: number,
                                     upper: number,
                                     exclusive: boolean = false): boolean {
  return exclusive
    ? (this > lower && this < upper)
    : !(this < lower || this > upper);
};

Number.prototype.lerp = function (this: number, other: number, ratio: number = .5): number {
  if (!ratio.between(0, 1)) {
    console.error(`ratio "${ratio}" must be between 0 and 1`);
  }
  return this * ratio + other * (1 - ratio);
};

Number.prototype.odd = function (this: number): boolean {
  return this % 2 !== 0;
};

Number.prototype.transform = function (this: number, type: 'log' | 'eo-parab' | 'ei-parab'): number {
  if (!this.between(0, 1)) {
    console.error(`Cannot transform "${this}", it must be between 0 and 1`);
  }

  switch (type) {
    case 'log':
      // todo: this is not exact
      return Math.log(1 + this) * 1.44269504;

    case 'eo-parab':
      return this * (2 - this);

    case 'ei-parab':
      return (1 - this) * (1 + this);

    default:
      console.error(`Type "${type}" is not a valid transformation function`);
  }
};

Number.prototype.sign = function (this: number): number {
  return Math.sign(this);
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
    console.error(`lower "${lower}" must be less than or equal to upper "${upper}"`);
  }
  let lowLimitedValue = this.coerceAtLeast(lower);
  return lowLimitedValue.coerceAtMost(upper);
};
