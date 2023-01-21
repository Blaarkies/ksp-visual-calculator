export function windowed<T>(list: Array<T>,
                            size: number = 2,
                            step: number = 1,
                            partialWindows: boolean = false): Array<Array<T>> {
  let result = [];
  list.some((el, i) => {
    if (i % step !== 0) {
      return false;
    }
    if (i + size > list.length) {
      return true;
    }
    result.push(list.slice(i, i + size));
  });
  return result;
}

export function withoutTranslationPart(text: string): string {
  return text.split('=').at(-1).trim();
}


export function makeIntRange(start: number, end?: number): number[] {
  if (start > end) {
    return [];
  }
  let length = end === undefined
    ? start
    : end - start + 1;
  return Array.from({length}, (_, i) => i + start);
}
