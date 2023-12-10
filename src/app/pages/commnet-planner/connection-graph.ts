import { ProbeControlPoint } from '../../common/domain/antenna';
import { AntennaSignal } from '../../common/domain/antenna-signal';
import { Craft } from '../../common/domain/space-objects/craft';
import { SpaceObject } from '../../common/domain/space-objects/space-object';
import { NodeGraph } from '../dv-planner/domain/graph-data-structure';

export class ConnectionGraph {

  hasControlCraft = new Set();

  private graph = NodeGraph();

  constructor(signals: AntennaSignal[],
              craft: Craft[],
              planets: SpaceObject[]) {
    signals
      .filter(s => s.strengthRelay)
      .forEach(s => {
        let [a, b] = s.nodes;
        this.graph.addBiEdge(a.label, b.label, 1 - s.strengthRelay);
      });

    let graphNodes = this.graph.nodes();

    let trackingStations = planets
      .filter(p => p.communication?.isDsn);
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

          let hasControlConnection = otherNode.communication.isDsn
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
