import { ProbeControlPoint } from './antenna';
import {
  AntennaSignal,
  CanCommunicate,
} from './antenna-signal';
import { NodeGraph } from '../../../common/domain/graph-data-structure';
import { Craft } from '../../../common/domain/space-objects/craft';
import { Planetoid } from '../../../common/domain/space-objects/planetoid';

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
      .filter(p => p.communication?.stringAntennae?.length);
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
        if (!isSignalOfCraft) {
          continue;
        }

        let otherNode = signal.nodes.find(n => n !== c);
        let isGuidanceControlled = this.hostNodeCanControl(signal, otherNode);

        if (isGuidanceControlled) {
          this.hasControlCraft.add(c);

          break;
        }
        let isOtherNodeInNetwork = graphNodes
          .some(id => id === otherNode.label);
        if (isOtherNodeInNetwork) {

          let hasConnectionToBase = controlStationsAndCores
            .some(cb => this.graph.shortestPath(otherNode.label, cb.label)?.length);
          if (hasConnectionToBase) {
            this.hasControlCraft.add(c);
            break;
          }
        }
      }
    });
  }

  private hostNodeCanControl(signal: AntennaSignal,
                             hostNode: CanCommunicate): boolean {
    let hasDsnCapability = hostNode instanceof Planetoid
      && hostNode.communication?.stringAntennae.length;

    let hostCanRelayConnectionToClient = hostNode.communication.bestRemoteGuidanceCapability()
      && signal.getHostToClientSignalStrength(hostNode); // signal is of this craft; the other node has to be the craft

    let hasControlConnection = hasDsnCapability || hostCanRelayConnectionToClient;
    return !!hasControlConnection;
  }
}
