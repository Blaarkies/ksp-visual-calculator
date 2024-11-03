import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";

@Component({
  selector: 'cp-credits-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './credits-dialog.component.html',
  styleUrls: ['./credits-dialog.component.scss'],
})
export class CreditsDialogComponent {

  credits = [
    {
      creator: 'SQUAD',
      action: 'for making the game',
      link: 'https://store.steampowered.com/app/220200/Kerbal_Space_Program/',
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
      product: 'Delta-v Planner',
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
    {
      creator: 'Ined',
      action: 'for data on ISRU heat mechanics',
      link: 'https://forum.kerbalspaceprogram.com/index.php?/topic/165362-an-optimizing-guide-for-mining-bases/',
      product: 'Optimizing Guide for Mining Bases',
    },
  ];

}
