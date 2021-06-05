import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaNumber<T> extends ControlMeta {

    constructor(public suffix?: string) {
        super(ControlMetaType.Number);
    }

}
