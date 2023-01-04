import { Component, Input } from '@angular/core';
import { InputField } from '../../../common/domain/input-fields/input-fields';
import { ControlMetaType } from '../../../common/domain/input-fields/control-meta-type';
import { BasicAnimations } from '../../../common/animations/basic-animations';

@Component({
  selector: 'cp-input-field-list',
  templateUrl: './input-field-list.component.html',
  styleUrls: ['./input-field-list.component.scss'],
  animations: [BasicAnimations.height],
})
export class InputFieldListComponent {

  @Input() inputFields: InputField[] = [];

  controlMetaTypes = ControlMetaType;

}
