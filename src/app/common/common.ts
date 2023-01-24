import { firstValueFrom, timer } from 'rxjs';

export class Common {

  /* tslint:disable:no-string-literal */
  static isNgDisabled(element: HTMLElement): boolean {
    return [
      element.attributes['ng-reflect-is-disabled'],
      element.attributes['ng-reflect-disabled'],
      element.attributes['disabled'],
    ].find(v => v !== undefined)
      ?.value?.toBoolean();
  }

  static getElementByInnerText<T = HTMLElement>(domEntry: HTMLElement,
                                                cssSelector: string,
                                                innerText: string): T {
    return Array.from(domEntry.querySelectorAll(cssSelector))
      .find((e: HTMLElement) => e.innerText.includes(innerText)) as unknown as T;
  }

  static waitPromise(duration = 100): Promise<void> {
    return firstValueFrom(timer(duration)) as any;
  }

  static randomNumber(min = 0, max = 10): number {
    let difference = Math.abs(max) - Math.abs(min);
    return Math.random() * difference + min;
  }

  static randomInt(min = 0, max = 10): number {
    return this.randomNumber(min, max).toInt();
  }

  static listNumbers(count = 3): number[] {
    return [...Array(count).keys()];
  }

  static makeIntRange(start: number, end?: number): number[] {
    if (start > end) {
      return [];
    }
    return end === undefined
      ? Array.from({length: start}, (_, i) => i + 1)
      : Array.from({length: end - start + 1}, (_, i) => i + start);
  }

  static randomIntList(count = 3, min = 0, max = 10): number[] {
    return this.listNumbers(count).map(() => this.randomNumber(min, max).toInt());
  }


}
