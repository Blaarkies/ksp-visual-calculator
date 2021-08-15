export class Uid {

  static get new(): string {
    return Uid.generateUID();
  }

  private static generateUID(): string {
    return [1, 2, 3]
      // tslint:disable-next-line:no-bitwise
      .map(() => ((Math.random() * 9e8) | 0).toString(36))
      .join('')
      .slice(-17)
      .padEnd(17, (Math.round(Math.random() * 35)).toString(36));
  }

}
