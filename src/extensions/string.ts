export {}; // this file needs to be a module

String.prototype.let = function (this: String, callback: (it) => any): any {
  return callback(this);
};

String.prototype.also = function (this: String, callback: (it) => void): String {
  callback(this);
  return this;
};
