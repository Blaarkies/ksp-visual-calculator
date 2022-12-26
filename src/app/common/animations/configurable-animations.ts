import { genericOpenClose } from './generic-animation-tools';

export class ConfigurableAnimations {

  /** Open/close elements vertically */
  static openCloseY = (minHeightPx?: number, duration?: number) => {
    return genericOpenClose('vertical', 'openCloseY', minHeightPx, duration);
  };

  /** Open/close elements horizontally */
  static openCloseX = (minWidthPx: number, duration?: number) => {
    return genericOpenClose('horizontal', 'openCloseX', minWidthPx, duration);
  };

}
