export {}; // this file needs to be a module

Boolean.prototype.toString = function (this: Boolean, variety?: 'yes' | 'good' | '✅'): string {
  switch (variety) {
    case 'yes':
      return this ? 'yes' : 'no';
    case 'good':
      return this ? 'good' : 'bad';
    case '✅':
      return this ? '✅' : '❎';
    default:
      return this ? 'true' : 'false';
  }
};

Boolean.prototype.let = function (this: Boolean, callback: (it) => any): any {
  return callback(this);
};

Boolean.prototype.also = function (this: Boolean, callback: (it) => void): Boolean {
  callback(this);
  return this;
};
