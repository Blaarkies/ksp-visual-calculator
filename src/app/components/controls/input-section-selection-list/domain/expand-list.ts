import { Option } from './option';

export class ExpandList {

  countAvailable: number;

  constructor(
    public label: string,
    public options: Option[],
    public expanded: boolean,
    public icon: string) {
    this.countAvailable = options.length;
  }

  toggle() {
    this.expanded = !this.expanded;
  }
}
