// tslint:disable:ban-types
export interface StateDraggable {
  label: string;
  orbit?: {
    parameters: {
      xy?: number[];
      r?: number;
      parent?: any;
    };
    color: string;
    type: string;
  };
  addOrbit: Function;
  parameterData: {};
  updateConstrainLocation: Function;
  setChildren: Function;
  children: string[];
  location: number[];
}
