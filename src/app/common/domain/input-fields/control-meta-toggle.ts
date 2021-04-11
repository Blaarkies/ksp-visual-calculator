import { ControlMeta } from './control-meta';
import { ControlMetaType } from './control-meta-type';

export class ControlMetaToggle<T> extends ControlMeta {

    constructor() {
        super(ControlMetaType.Toggle);
    }

}
