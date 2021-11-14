import { CheckpointNode } from './checkpoint-node';
import { CheckpointEdge } from './checkpoint-edge';
import { SpaceObject } from '../../domain/space-objects/space-object';
import { TravelCondition } from './travel-condition';

export class Checkpoint {

  constructor(public node: CheckpointNode,
              public edge?: CheckpointEdge) {
    this.edge = edge;
    this.node = node;
  }

  toJson(): {} {
    return {
      ...this.node.toJson(),
    };
  }

  static fromJson(json: any,
                  getBodyByLabel: (label: string) => SpaceObject,
                  getAvailableConditions: (label: string) => TravelCondition[]): Checkpoint {
    let node = CheckpointNode.fromJson(json, getBodyByLabel, getAvailableConditions);
    return new Checkpoint(node);
  }

}
