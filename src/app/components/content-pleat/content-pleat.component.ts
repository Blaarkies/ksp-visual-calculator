import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { CustomAnimation } from '../../common/domain/custom-animation';

@Component({
  selector: 'cp-content-pleat',
  templateUrl: './content-pleat.component.html',
  styleUrls: ['./content-pleat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CustomAnimation.fade],
})
export class ContentPleatComponent {

  showContentAfterInit: boolean;

  @ViewChild(MatExpansionPanel) panel: MatExpansionPanel;

  constructor() {
    // Images flash once on init. This blocks content until moments after
    setTimeout(() => this.showContentAfterInit = true, 500);
  }

  open() {
    this.panel.open();
  }

}
