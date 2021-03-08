import { animate, style, transition, trigger } from '@angular/animations';

export class CustomAnimation {

  static animateFade = trigger('animateFade', [
    transition(':enter', [
      style({opacity: 0}),
      animate('.5s ease-out', style({opacity: 1}))]),
    transition(':leave', [
      style({opacity: 1}),
      animate('.5s ease-in', style({opacity: 0}))]),
  ]);

}
