export class ActionOption {

  constructor(public label: string,
              public icon: string,
              public action?: () => void,
              public route?: string) {
  }

}
