export class Common {

  /* tslint:disable:no-string-literal */
  static isNgDisabled = (element: HTMLElement) => [
    element.attributes['ng-reflect-is-disabled'],
    element.attributes['ng-reflect-disabled'],
    element.attributes['disabled'],
  ].find(v => v !== undefined)
    ?.value?.toBoolean();

}