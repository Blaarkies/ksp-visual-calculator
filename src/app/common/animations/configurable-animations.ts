import { animate, animation, state, style, transition, trigger, useAnimation } from '@angular/animations';

let transitionWidth = animation([
  style({width: '{{ lastWidth }}'}),
  animate('{{ timing }}',
    style({width: '{{ nextWidth }}'}))
]);

export class ConfigurableAnimations {

  /** Open/close elements horizontally */
  static openCloseX = (minWidthPx: number, duration?: number) => {
    let min = minWidthPx;
    let minPx = min + 'px';

    let time = duration === undefined ? .3 : duration;
    let timingIn = `${time}s ease-in`;
    let timingOut = `${time*.67}s ease-out`;

    return trigger('openCloseX', [
      transition(':enter', [
        useAnimation(transitionWidth, {
          params: {
            lastWidth: 0,
            nextWidth: '*',
            timing: timingIn,
          }
        }),
      ]),

      transition(':leave', [
        useAnimation(transitionWidth, {
          params: {
            lastWidth: '*',
            nextWidth: 0,
            timing: timingOut,
          }
        }),
      ]),

      state('void', style({width: 0})),
      state('false', style({width: minPx})),
      state('true', style({width: '*'})),

      transition('false => true', [
        useAnimation(transitionWidth, {
          params: {
            lastWidth: minPx,
            nextWidth: '*',
            timing: timingIn,
          }
        }),
      ]),

      transition('true => false', [
        useAnimation(transitionWidth, {
          params: {
            lastWidth: '*',
            nextWidth: minPx,
            timing: timingOut,
          }
        }),
      ]),
    ])
  };

}
