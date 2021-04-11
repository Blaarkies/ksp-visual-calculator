import { Component, Input, OnInit } from '@angular/core';
import { InputField } from '../../common/domain/input-fields/input-fields';
import { ControlMetaType } from '../../common/domain/input-fields/control-meta-type';

@Component({
  selector: 'cp-input-field-list',
  templateUrl: './input-field-list.component.html',
  styleUrls: ['./input-field-list.component.scss'],
})
export class InputFieldListComponent implements OnInit {

  @Input() inputFields: InputField[] = [];

  controlMetaTypes = ControlMetaType;

  constructor() {
  }

  ngOnInit(): void {
  }

}
