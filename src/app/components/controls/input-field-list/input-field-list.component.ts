import {Component, Input} from '@angular/core';
import {InputField} from '../../../common/domain/input-fields/input-fields';
import {ControlMetaType} from '../../../common/domain/input-fields/control-meta-type';
import {BasicAnimations} from '../../../animations/basic-animations';
import {CommonModule} from "@angular/common";
import {InputFieldComponent} from "../input-field/input-field.component";
import {InputTextAreaComponent} from "../input-text-area/input-text-area.component";
import {InputNumberComponent} from "../input-number/input-number.component";
import {InputSelectComponent} from "../input-select/input-select.component";
import {InputToggleComponent} from "../input-toggle/input-toggle.component";
import {AntennaSelectorComponent} from "../../antenna-selector/antenna-selector.component";
import { ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'cp-input-field-list',
  standalone: true,
  imports: [
    CommonModule,
    InputFieldComponent,
    InputTextAreaComponent,
    InputNumberComponent,
    InputSelectComponent,
    InputToggleComponent,
    AntennaSelectorComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './input-field-list.component.html',
  styleUrls: ['./input-field-list.component.scss'],
  animations: [BasicAnimations.height],
})
export class InputFieldListComponent {

  @Input() inputFields: InputField[] = [];

  controlMetaTypes = ControlMetaType;

}
