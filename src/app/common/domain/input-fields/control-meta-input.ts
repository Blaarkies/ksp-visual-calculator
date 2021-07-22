import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

type ControlInputType = 'text' | 'color';

export class ControlMetaInput<T> extends ControlMeta {

  constructor(public inputType: ControlInputType = 'text', public hint?: string) {
    super(ControlMetaType.Input, hint);
  }

}
