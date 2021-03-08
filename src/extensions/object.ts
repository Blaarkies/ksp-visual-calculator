export {}; // this file needs to be a module

Object.prototype.let = function (this: Object, callback: (it) => any): any {
  return callback(this);
};

Object.prototype.also = function (this: Object, callback: (it) => any): any {
  callback(this);
  return this;
};
