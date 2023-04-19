export class Group<T> {

  constructor(public item: T,
              public count: number = 1) {
  }

  toJson(idKey: keyof T): string {
    let jsonObject = {
      id: this.item[idKey],
      count: this.count,
    };
    return JSON.stringify(jsonObject);
  }

}
