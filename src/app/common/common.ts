import { firstValueFrom, take, timer } from 'rxjs';

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

}
