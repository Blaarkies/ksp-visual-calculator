import { Words } from './words';
import { Common } from './common';

export class Namer {

  static get savegame(): string {
    let baseWords = [
      () => Words.adjectives.random(),
      () => Words.nouns.random(),
      () => Words.kspNouns.random(),
    ];

    return `${this.starName} ${baseWords.random()().toTitleCase()}`;
  }

  static get starName(): string {
    let letters = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(-3);
    let numbers = Math.random().toString().slice(-3);
    let sub = String.fromCharCode(Common.randomInt(65, 70));

    return `${letters.toUpperCase()}-${numbers}` + (Math.random() > .7 ? `-${sub.toLowerCase()}` : '');
  }

}
