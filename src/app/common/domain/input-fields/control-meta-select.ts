import { ControlMeta } from './control-meta';
import { LabeledOption } from './labeled-option';
import { ControlMetaType } from './control-meta-type';
import { SpaceObject } from '../space-objects/space-object';

export class ControlMetaSelect<T> extends ControlMeta {

  constructor(public list: LabeledOption<T>[],
              public mapIcons?: Map<T, string>) {
    super(ControlMetaType.Select);
  }

}

