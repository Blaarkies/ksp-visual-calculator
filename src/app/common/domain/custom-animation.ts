import { animate, sequence, state, style, transition, trigger } from '@angular/animations';

export class CustomAnimation {

  static animateFade = trigger('animateFade', [
    transition(':enter', [
      style({opacity: 0}),
      animate('.5s ease-out', style({opacity: '*'}))]),
    transition(':leave', [
      style({opacity: '*'}),
      animate('.5s ease-in', style({opacity: 0}))]),
  ]);

  static animateHeight = trigger('animateHeight', [
    transition(':enter', [
      style({height: 0, overflow: 'hidden'}),
      animate('.3s ease-in', style({height: '*'})),
    ]),
    transition(':leave', [
      style({height: '*', overflow: 'hidden'}),
      animate('.2s ease-out', style({height: 0})),
    ]),
  ]);

  static animateScaleY = trigger('animateScaleY', [
    state('false', style({transform: 'scaleY(0)'})),
    state('true', style({transform: 'scaleY(1)'})),

    transition('false => true', [
      animate('.3s ease-in', style({transform: 'scaleY(1)'})),
    ]),
    transition('true => false', [
      animate('.3s ease-out', style({transform: 'scaleY(0)'})),
    ]),
  ]);

  static animateFlipHorizontal = trigger('animateFlipHorizontal', [
    state('false', style({transform: 'scale(1, 1)'})),
    state('true', style({transform: 'scale(-1, 1)'})),

    transition('false => true', [
      sequence([
        animate('.1s ease-in', style({transform: 'scale(1, 0)'})),
        style({transform: 'scale(-1, 0)'}),
        animate('.1s ease-in', style({transform: 'scale(-1, 1)'})),
      ]),
    ]),
    transition('true => false', [
      sequence([
        animate('.1s ease-in', style({transform: 'scale(-1, 0)'})),
        style({transform: 'scale(1, 0)'}),
        animate('.1s ease-in', style({transform: 'scale(1, 1)'})),
      ]),
    ]),
  ]);

}
