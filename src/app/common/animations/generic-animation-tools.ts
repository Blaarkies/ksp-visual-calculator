import { animate, animation, state, style, transition, trigger, useAnimation } from '@angular/animations';

let genericTransitionDimension = (prop: string) => animation([
  style({[prop]: '{{ last }}'}),
  animate('{{ timing }}',
    style({[prop]: '{{ next }}'}))
]);

export let genericOpenClose = (direction: 'horizontal' | 'vertical',
                               triggerName: string,
                               minDimension: number,
                               duration?: number) => {
  let propName = direction === 'horizontal' ? 'width' : 'height';
  let propTransition = genericTransitionDimension(propName);
  let minValue = minDimension === undefined
    ? 0
    : minDimension + 'px';

  let time = duration === undefined ? .3 : duration;
  let timingIn = `${time}s ease-in`;
  let timingOut = `${(time * .67)}s ease-out`;

  return trigger(triggerName, [
    transition(':enter', [
      useAnimation(propTransition, {
        params: {
          last: 0,
          next: '*',
          timing: timingIn,
        }
      }),
    ]),

    transition(':leave', [
      useAnimation(propTransition, {
        params: {
          last: '*',
          next: 0,
          timing: timingOut,
        }
      }),
    ]),

    state('void', style({[propName]: 0, opacity: 0})),
    state('false', style({[propName]: minValue})),
    state('true', style({[propName]: '*'})),

    transition('false => true', [
      useAnimation(propTransition, {
        params: {
          last: minValue,
          next: '*',
          timing: timingIn,
        }
      }),
    ]),

    transition('true => false', [
      useAnimation(propTransition, {
        params: {
          last: '*',
          next: minValue,
          timing: timingOut,
        }
      }),
    ]),
  ])
};
