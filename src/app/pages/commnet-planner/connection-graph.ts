import { ProbeControlPoint } from '../../common/domain/antenna';
import {
  AntennaSignal,
  CanCommunicate,
} from '../../common/domain/antenna-signal';
import { NodeGraph } from '../../common/domain/graph-data-structure';
import { Craft } from '../../common/domain/space-objects/craft';
import { Planetoid } from '../../common/domain/space-objects/planetoid';

export class ConnectionGraph {

  hasControlCraft = new Set();

  private graph = NodeGraph();

  constructor(signals: AntennaSignal[],
              craft: Craft[],
              planets: Planetoid[]) {
    signals
      .filter(s => s.strengthRelay)
      .forEach(s => {
        let [a, b] = s.nodes;
        this.graph.addBiEdge(a.label, b.label, 1 - s.strengthRelay);
      });

    let graphNodes = this.graph.nodes();

    let trackingStations: CanCommunicate[] = planets
      .filter(p => p.communication?.antennae?.length);
    let multiHopGuidanceCores = craft
      .filter(c => c.communication.bestRemoteGuidanceCapability()
        === ProbeControlPoint.MultiHop);
    let controlStationsAndCores = trackingStations.concat(multiHopGuidanceCores)
      .filter(b => graphNodes.some(id => id === b.label));

    craft.forEach(c => {
      if (c.communication.bestRemoteGuidanceCapability()) {
        this.hasControlCraft.add(c);
        return;
      }

      for (let signal of signals) {
        let isSignalOfCraft = signal.nodes.some(n => n === c);
        if (isSignalOfCraft) {

          let otherNode = signal.nodes.find(n => n !== c);

          let hasDsnCapability = otherNode instanceof Planetoid
            && otherNode.communication?.antennae?.length;
          let hasControlConnection = hasDsnCapability
            || otherNode.communication.bestRemoteGuidanceCapability();
          if (hasControlConnection) {
            this.hasControlCraft.add(c);
            break;
          }

          let isOtherNodeInNetwork = graphNodes
            .some(id => id === otherNode.label);
          if (isOtherNodeInNetwork) {

            let hasConnectionToBase = controlStationsAndCores
              .some(cb => {
                try {
                  return this.graph.shortestPath(
                    otherNode.label, cb.label);
                } catch (e) {
                  console.log(`No path from [${otherNode.label}] to [${cb.label}]`);
                  return false;
                }
              });
            if (hasConnectionToBase) {
              this.hasControlCraft.add(c);
              break;
            }
          }
        }
      }
    });
  }

}
