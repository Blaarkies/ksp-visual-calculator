import { animate, style, transition, trigger } from '@angular/animations';

export class CustomAnimation {

  static animateFade = trigger('animateFade', [
    transition(':enter', [
      style({opacity: 0}),
      animate('.5s ease-out', style({opacity: '*'}))]),
    transition(':leave', [
      style({opacity: '*'}),
      animate('.5s ease-in', style({opacity: 0}))]),
  ]);

  static animateScaleVertical = trigger('animateScaleVertical', [
    transition(':enter', [
      style({height: 0, overflow: 'hidden'}),
      animate('.3s ease-in', style({height: '*'})),
    ]),
    transition(':leave', [
      style({height: '*', overflow: 'hidden'}),
      animate('.2s ease-out', style({height: 0})),
    ]),
  ]);

}
