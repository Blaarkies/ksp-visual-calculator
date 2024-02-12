import {
  makeIntList,
  randomListIndex,
} from './common';

export class Uid {

  static get new(): string {
    return Uid.generateUID();
  }

  /** Generates the following 62 char string: AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789 */
  private static charString = makeIntList(26, 65)
    .map(i => String.fromCharCode(i))
    .map(c => c + c.toLowerCase())
    .concat(makeIntList(10).map(i => i.toString()))
    .join('');

  private static list: number[];

  private static generateUID(): string {
    this.list = makeIntList(20);
    return this.list.map(() => this.charString.at(
      randomListIndex(this.charString.length)))
      .join('');
  }

}
