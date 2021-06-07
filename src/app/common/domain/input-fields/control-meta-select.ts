import { ControlMeta } from './control-meta';
import { LabeledOption } from './labeled-option';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaSelect<T> extends ControlMeta {

  constructor(public list: LabeledOption<T>[],
              public mapIcons?: Map<T, string>,
              public hint?: string) {
    super(ControlMetaType.Select, hint);
  }

}

