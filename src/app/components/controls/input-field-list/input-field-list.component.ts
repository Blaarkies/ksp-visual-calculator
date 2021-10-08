import { Component, Input } from '@angular/core';
import { InputField } from '../../../common/domain/input-fields/input-fields';
import { ControlMetaType } from '../../../common/domain/input-fields/control-meta-type';
import { CustomAnimation } from '../../../common/domain/custom-animation';
import { animate, group, sequence, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'cp-input-field-list',
  templateUrl: './input-field-list.component.html',
  styleUrls: ['./input-field-list.component.scss'],
  animations: [CustomAnimation.animateHeight],
})
export class InputFieldListComponent {

  @Input() inputFields: InputField[] = [];

  controlMetaTypes = ControlMetaType;

}
