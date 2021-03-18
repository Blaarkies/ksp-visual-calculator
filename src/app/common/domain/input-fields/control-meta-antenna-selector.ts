import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';
import { LabeledOption } from './labeled-option';

export class ControlMetaAntennaSelector<T> extends ControlMeta {

  constructor(public list: LabeledOption<T>[]) {
    super(ControlMetaType.AntennaSelector);
  }

}
