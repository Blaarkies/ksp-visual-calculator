import {
  ConnectionPositionPair,
  HorizontalConnectionPos,
  OriginConnectionPosition,
  OverlayConnectionPosition,
  VerticalConnectionPos,
} from '@angular/cdk/overlay';
import {
  firstValueFrom,
  timer,
} from 'rxjs';

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

  static formatNumberShort(value: number): number {
    let isNegative = false;
    if (value < 0) {
      isNegative = true;
    }
    let fixed = isNegative
      ? value.toFixed(2).slice(1)
      : value.toFixed(2);
    let valueSplits = fixed.split('.');
    fixed = valueSplits[0].length > 1
      ? valueSplits[0]
      : fixed;
    return fixed.toNumber() * (isNegative ? -1 : 1);
  }

  /** Creates ConnectionPositionPair[] with positions matching the DirectionString */
  static createConnectionPair(origin: DirectionString, overlay = origin): ConnectionPositionPair[] {
    let origins = getPosition(origin);
    let overlays = getPosition(overlay);
    let originX = origins[0] as HorizontalConnectionPos;
    let originY = origins[1] as VerticalConnectionPos;
    let overlayX = overlays[0] as HorizontalConnectionPos;
    let overlayY = overlays[1] as VerticalConnectionPos;

    return [
      new ConnectionPositionPair(
        {originX, originY},
        {overlayX, overlayY},
      ),
    ];
  }
}

function getPosition(direction: DirectionString): OverlayPositions[] {
  switch (direction) {
    case '↖':
      return ['start', 'top'];
    case '↗':
      return ['end', 'top'];
    case '↙':
      return ['start', 'bottom'];
    case '↘':
      return ['end', 'bottom'];
    case '←':
      return ['start', 'center'];
    case '→':
      return ['end', 'center'];
    case '↑':
      return ['center', 'start'];
    case '↓':
      return ['center', 'bottom'];
    default:
      return getPosition('↖');
  }
}

/** Visual interface to easily setup directional properties */
type DirectionString = '↖' | '↙' | '↘' | '↗' | '←' | '→' | '↑' | '↓';
type OverlayPositions = OriginConnectionPosition['originX']
  | OriginConnectionPosition['originY']
  | OverlayConnectionPosition['overlayX']
  | OverlayConnectionPosition['overlayY']
