import { Component } from '@angular/core';

@Component({
  selector: 'cp-credits-dialog',
  templateUrl: './credits-dialog.component.html',
  styleUrls: ['./credits-dialog.component.scss'],
})
export class CreditsDialogComponent {

  credits = [
    {
      creator: 'SQUAD',
      action: 'for making the game',
      link: 'https://www.kerbalspaceprogram.com/',
      product: 'Kerbal Space Program',
    },
    {
      creator: 'KSP Wiki Contributors',
      action: 'for info and image assets at',
      link: 'https://wiki.kerbalspaceprogram.com/',
      product: 'Kerbal Space Program Wiki',
    },
    {
      creator: '13375.de',
      action: 'for image assets at',
      link: 'https://13375.de/KSPDeltaVMap/',
      product: 'Delta-V Planner',
    },
    {
      creator: 'ibeiiebz',
      action: 'for',
      link: 'https://line.17qq.com/articles/ibeiiebz.html',
      product: 'Space Tile Background',
    },
    {
      creator: 'Alex Moon',
      action: 'for interplanetary dv cost transfer calculations with',
      link: 'https://alexmoon.github.io/ksp/',
      product: 'Launch Window Planner',
    },
  ];

}
