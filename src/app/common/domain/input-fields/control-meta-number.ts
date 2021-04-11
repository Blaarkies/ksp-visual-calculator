import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaNumber<T> extends ControlMeta {

    constructor() {
        super(ControlMetaType.Number);
    }

}
