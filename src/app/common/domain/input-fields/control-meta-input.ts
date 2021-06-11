import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaInput<T> extends ControlMeta {

    constructor(public inputType: 'text' | 'color' = 'text', public hint?: string) {
        super(ControlMetaType.Input, hint);
    }

}
