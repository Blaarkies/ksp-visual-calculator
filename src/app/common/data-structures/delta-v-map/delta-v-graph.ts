import { DestinationConditions } from './destination-conditions';
import { GraphDataStructure, NodeGraph } from './graph-data-structure';
import { MissionNode } from '../../../components/maneuver-sequence-panel/maneuver-sequence-panel.component';

type DeltaVStep = (string | number)[];

export class DeltaVGraph {

  private readonly graph: GraphDataStructure = NodeGraph();
  private readonly planetMatchMap: Map<string, DestinationConditions> = this.makePlanetMatchMap();

  constructor() {
    this.getDeltaVHops().forEach(([nodeA, nodeB, weight]: [string, string, number]) =>
      this.graph.addBiEdge(nodeA, nodeB, weight));


    // let pathA = this.graph.shortestPath(kerbin.surface, duna.surface);
    // console.log('kerbin -> duna', pathA);
    //
    // let pathAWeights = pathA.windowed(2)
    //   .map(([a, b]) => ({a, b, w: this.graph.getEdgeWeight(a, b)}));
    // console.log('a', pathAWeights);
  }

  private getDeltaVHops(): DeltaVStep[] {
    let moho = new DestinationConditions('moho');
    let eve = new DestinationConditions('eve');
    let kerbin = new DestinationConditions('kerbin');
    let mun = new DestinationConditions('mun');
    let minmus = new DestinationConditions('minmus');
    let duna = new DestinationConditions('duna');

    let mohoOut = [
      // self
      [moho.surface, moho.lowOrbit,
        870],
      [moho.lowOrbit, moho.ellipticalOrbit,
        69],
    ];

    let eveOut = [
      // self
      [eve.surface, eve.lowOrbit,
        8000],
      [eve.lowOrbit, eve.ellipticalOrbit,
        1330],
    ];

    let kerbinOut = [
      // self
      [kerbin.surface, kerbin.lowOrbit,
        3400],
      [kerbin.lowOrbit, kerbin.geostationaryOrbit,
        1115],
      [kerbin.lowOrbit, kerbin.ellipticalOrbit,
        950],

      // mun
      [kerbin.lowOrbit, kerbin.planeWith(mun),
        0],
      [kerbin.lowOrbit, kerbin.interceptWith(mun),
        860],
      [kerbin.interceptWith(mun), mun.ellipticalOrbit,
        69],

      // minmus
      [kerbin.lowOrbit, kerbin.planeWith(minmus),
        340],
      [kerbin.lowOrbit, kerbin.interceptWith(minmus),
        930],
      [kerbin.interceptWith(minmus), minmus.ellipticalOrbit,
        69],

      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, moho, 2520, 760, 0),
      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, eve, 460, 90, 0),
      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, duna, 10, 130, 0),
    ];

    let munOut = [
      [mun.surface, mun.lowOrbit,
        580],
      [mun.lowOrbit, mun.ellipticalOrbit,
        69],
    ];

    let minmusOut = [
      [minmus.surface, minmus.lowOrbit,
        180],
      [minmus.lowOrbit, minmus.ellipticalOrbit,
        69],
    ];

    let dunaOut = [
      [duna.surface, duna.lowOrbit,
        1450],
      [duna.lowOrbit, duna.ellipticalOrbit,
        360],
    ];

    let fullList = [
      ...mohoOut,
      ...eveOut,
      ...kerbinOut,
      ...munOut,
      ...minmusOut,
      ...dunaOut,
    ];

    return fullList;
  }

  private makePlanetMatchMap(): Map<string, DestinationConditions> {
    return new Map<string, DestinationConditions>([
      ['kerbol', new DestinationConditions('kerbin')],
    ]);
  }

  private makeStepsFromEscapeToOtherElliptical(from: DestinationConditions,
                                               to: DestinationConditions,
                                               plane: number,
                                               intercept: number,
                                               capture: number): DeltaVStep[] {
    return [
      [from.ellipticalOrbit, from.planeWith(to), plane],
      [from.planeWith(to), from.interceptWith(to), intercept],
      [from.interceptWith(to), to.ellipticalOrbit, capture],
    ];
  }

  getDeltaVRequirement(a: MissionNode, b: MissionNode, options: {} = {}): number {
    let maxDvPath = this.graph.shortestPath(this.stringifyNode(a), this.stringifyNode(b));

    return maxDvPath.weight;
  }

  private stringifyNode(node: MissionNode) {
    return `${node.name.toLowerCase()}:${node.condition}`;
  }
}
