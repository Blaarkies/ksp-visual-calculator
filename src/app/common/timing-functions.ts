/** Yoinked from https://github.com/gdsmith/jquery.easing/blob/master/jquery.easing.js */

export function easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

export function easeInOutCubic(t: number): number {
    return t < 0.5 ?
        4 * t * t * t :
        1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

export function easeOutExpo(t: number): number {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
