import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { CustomAnimation } from '../../common/domain/custom-animation';

@Component({
  selector: 'cp-content-pleat',
  templateUrl: './content-pleat.component.html',
  styleUrls: ['./content-pleat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CustomAnimation.animateFade],
})
export class ContentPleatComponent {

  showContentAfterInit: boolean;
  @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;

  open() {
    this.panel.toggle();
    // this.panel.open();
  }


  constructor() {
    setTimeout(() => this.showContentAfterInit = true, 500);
  }
}
