export class SafeCalledFn<T extends (...args: any) => any> {

  failed = false;

  constructor(private fn: T, private isWhitelist: boolean) {
    if (!fn) {
      return null;
    }
  }

  static Create<T extends (...args: Parameters<T>) => boolean>
  (fn: T, isWhitelist: boolean): SafeCalledFn<T> {
    if (fn) {
      return new SafeCalledFn<T>(fn, isWhitelist);
    }
    return {call: () => isWhitelist} as SafeCalledFn<T>;
  }

  call(...args: Parameters<T>): boolean {
    if (!this.failed) {
      try {
        return this.fn(...args);
      } catch (error) {
        let context = this.isWhitelist ? 'whitelist' : 'blacklist';
        console.error(`CustomFn(${context}) failed. Successive calls to this function will be ignored to ensure nominal program execution.`);
        console.error(error);
        console.error(` Args: `, ...args);
        this.failed = true;
      }
    }

    return this.isWhitelist;
  }

}
