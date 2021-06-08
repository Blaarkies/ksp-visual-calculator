import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { EXPANSION_PANEL_ANIMATION_TIMING, MatExpansionPanel } from '@angular/material/expansion';
import { CustomAnimation } from '../../common/domain/custom-animation';

@Component({
  selector: 'cp-content-pleat',
  templateUrl: './content-pleat.component.html',
  styleUrls: ['./content-pleat.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [CustomAnimation.animateFade],
  // providers: [{provide: EXPANSION_PANEL_ANIMATION_TIMING, useValue: '1s cubic-bezier(0.4,0.0,0.2,1)'}],
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
