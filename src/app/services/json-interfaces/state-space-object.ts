import { StateDraggable } from './state-draggable';

export interface StateSpaceObject {
    draggableHandle: StateDraggable;
    size: number;
    type: string;
    trackingStation: string;
    hasDsn: boolean;
    sphereOfInfluence: number;
    equatorialRadius: number;
}
