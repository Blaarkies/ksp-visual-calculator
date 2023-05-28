import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { genericOpenClose } from './generic-animation-tools';

export class BasicAnimations {

  static expandX = genericOpenClose('horizontal', 'expandX', 0);
  static expandY = genericOpenClose('vertical', 'expandY', 0);

  static fade = trigger('fade', [
    state('void, false', style({opacity: 0})),
    state('null, true', style({opacity: '*'})),
    transition(':enter, * => true, :leave, * => false', [animate('.5s ease-out')]),
  ]);

  static height = trigger('height', [
    state('void, false', style({height: 0, overflow: 'hidden'})),
    transition(':enter, * => true', [
      style({height: 0, overflow: 'hidden'}),
      animate('.3s ease-in', style({height: '*', overflow: 'hidden'}))]),
    transition(':leave, * => false', [
      style({height: '*', overflow: 'hidden'}),
      animate('.2s ease-out', style({height: 0, overflow: 'hidden'}))]),
  ]);

  static width = trigger('width', [
    state('void, false', style({width: 0, overflow: 'hidden'})),
    transition(':enter, * => true', [
      style({width: 0, overflow: 'hidden'}),
      animate('.3s ease-in', style({width: '*', overflow: 'hidden'}))]),
    transition(':leave, * => false', [
      style({width: '*', overflow: 'hidden'}),
      animate('.2s ease-out', style({width: 0, overflow: 'hidden'}))]),
  ]);

  static widthHeight = trigger('widthHeight', [
    state('void', style({width: 0, height: 0, overflow: 'hidden'})),
    transition(':enter, * => true', [
      style({width: 0, height: 0, overflow: 'hidden'}),
      animate('.3s ease-in', style({width: '*', height: '*', overflow: 'hidden'}))]),
    transition(':leave, * => false', [
      style({width: '*', height: '*', overflow: 'hidden'}),
      animate('.2s ease-out', style({width: 0, height: 0, overflow: 'hidden'}))]),
  ]);

  static scaleY = trigger('scaleY', [
    state('void, false', style({transform: 'scaleY(0)'})),
    state('null, true', style({transform: 'scaleY(1)'})),
    transition(':enter, * => true', [animate('.3s ease-in')]),
    transition(':leave, * => false', [animate('.3s ease-out')]),
  ]);

  static flipHorizontal = trigger('flipHorizontal', [
    state('void, false', style({transform: 'scale(1, 1)'})),
    state('true', style({transform: 'scale(-1, 1)'})),
    transition('* => true', [
      sequence([
        animate('.1s ease-in', style({transform: 'scale(1, 0)'})),
        style({transform: 'scale(-1, 0)'}),
        animate('.1s ease-in', style({transform: 'scale(-1, 1)'})),
      ]),
    ]),
    transition('* => false', [
      sequence([
        animate('.1s ease-in', style({transform: 'scale(-1, 0)'})),
        style({transform: 'scale(1, 0)'}),
        animate('.1s ease-in', style({transform: 'scale(1, 1)'})),
      ]),
    ]),
  ]);

  static flipVertical = trigger('flipVertical', [
    state('void, false', style({transform: 'scale(1, 1)'})),
    state('true', style({transform: 'scale(1, -1)'})),

    transition('* => true', [
      sequence([
        animate('.1s ease-in', style({transform: 'scale(0, 1)'})),
        style({transform: 'scale(0, -1)'}),
        animate('.1s ease-in', style({transform: 'scale(1, -1)'})),
      ]),
    ]),
    transition('* => false', [
      sequence([
        animate('.1s ease-in', style({transform: 'scale(0, -1)'})),
        style({transform: 'scale(0, 1)'}),
        animate('.1s ease-in', style({transform: 'scale(1, 1)'})),
      ]),
    ]),
  ]);

}
