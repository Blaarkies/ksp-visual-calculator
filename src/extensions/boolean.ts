import {
  extensionAlso,
  extensionLet,
} from './callback-extensions';

export {}; // this file needs to be a module

Boolean.prototype.let = extensionLet<boolean>;
Boolean.prototype.also = extensionAlso<boolean>;

Boolean.prototype.toString = function (this: Boolean, variety?: 'yes' | 'good' | '✅' | 'on'): string {
  switch (variety) {
    case 'yes':
      return this ? 'yes' : 'no';
    case 'good':
      return this ? 'good' : 'bad';
    case '✅':
      return this ? '✅' : '❎';
    case 'on':
      return this ? 'on' : 'off';
    default:
      return this ? 'true' : 'false';
  }
};
