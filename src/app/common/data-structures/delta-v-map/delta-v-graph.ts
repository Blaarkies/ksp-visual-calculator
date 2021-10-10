import { DestinationConditions } from './destination-conditions';
import { GraphDataStructure, NodeGraph } from './graph-data-structure';
import { MissionNode } from '../../../components/maneuver-sequence-panel/maneuver-sequence-panel.component';
import { TravelConditions } from './travel-conditions';
import { SpaceObject } from '../../domain/space-objects/space-object';

type DeltaVStep = (string | number)[];

class MissionNodeAbilities {
  allowConditions: TravelConditions[];
  // allowAerobraking: boolean;
  // allowGravityAssist: boolean;
}

class TripDetails {
  totalDv: number;
  pathDetails: any[];
}

/**
 * Separator between planet names and orbit conditions
 * @example
 * kerbin:surface
 * or
 * kerbin:interceptWith:duna
 */
const SEP = ':';

export class DeltaVGraph {

  private readonly vacuumGraph: GraphDataStructure = NodeGraph();

  private readonly planetMatchMap: Map<string, MissionNodeAbilities> = this.makePlanetMatchMap();
  private readonly aerobrakingNodesMap: Map<string, number>;

  constructor() {
    let specialTravelConditions = [TravelConditions.PlaneWith, TravelConditions.InterceptWith];

    this.getDeltaVHops()
      .forEach(([nodeA, nodeB, weight]: [string, string, number]) =>
        this.setupEdges(nodeA, nodeB, specialTravelConditions, weight));

    // this.aerobrakingNodesMap = new Map<string, number>([
    //   ['kerbin:ike'],
    // ]);
  }

  /**
   * Adds bidirectional edges to simple travel conditions (e.g. mun:surface to mun:lowOrbit),
   * but single edges for complex conditions.
   */
  private setupEdges(nodeA: string, nodeB: string, specialTravelConditions: string[], weight: number) {
    let [startNodeA, conditionA, endNodeA] = nodeA.split(SEP);
    let [startNodeB, conditionB, endNodeB] = nodeB.split(SEP);

    if (specialTravelConditions.includes(conditionA)
      || specialTravelConditions.includes(conditionB)) {
      this.vacuumGraph.addEdge(nodeA, nodeB, weight);
    } else {
      this.vacuumGraph.addBiEdge(nodeA, nodeB, weight);
    }
  }

  private getDeltaVHops(): DeltaVStep[] {
    let moho = new DestinationConditions('moho');
    let eve = new DestinationConditions('eve');
    let gilly = new DestinationConditions('gilly');
    let kerbin = new DestinationConditions('kerbin');
    let mun = new DestinationConditions('mun');
    let minmus = new DestinationConditions('minmus');
    let duna = new DestinationConditions('duna');
    let ike = new DestinationConditions('ike');

    let mohoOut = [
      ...this.makeStepsSelf(moho, 870, 69),
      ...this.makeStepsFromEscapeToOtherElliptical(moho, eve, 2090, 670, 69),
    ];

    let eveOut = [
      ...this.makeStepsSelf(eve, 8000, 1330),
    ];

    let gillyOut = [
      ...this.makeStepsSelf(gilly, 30, 69),
    ];

    let kerbinOut = [
      ...this.makeStepsSelf(kerbin, 3400, 950),
      [kerbin.lowOrbit, kerbin.geostationaryOrbit,
        1115],

      ...this.makeStepsFromParentToMoon(kerbin, mun, 0, 90, 860),
      ...this.makeStepsFromParentToMoon(kerbin, minmus, 340, 340, 930),

      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, moho, 2520, 760, 69),
      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, eve, 460, 90, 69),
      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, duna, 10, 130, 250),
    ];

    let munOut = [
      ...this.makeStepsSelf(mun, 580, 69),
      [kerbin.planeWith(mun), mun.ellipticalOrbit,
        69],
    ];

    let minmusOut = [
      ...this.makeStepsSelf(minmus, 180, 69),
      [kerbin.planeWith(minmus), minmus.ellipticalOrbit,
        69],
      ...this.makeStepsFromEscapeToOtherElliptical(minmus, mun, 340, 70, 69),
    ];

    let dunaOut = [
      ...this.makeStepsSelf(duna, 1450, 360),
    ];

    let ikeOut = [
      ...this.makeStepsSelf(ike, 390, 69),
    ];

    let fullList = [
      ...mohoOut,
      ...eveOut,
      ...gillyOut,
      ...kerbinOut,
      ...munOut,
      ...minmusOut,
      ...dunaOut,
      ...ikeOut,
    ];

    return fullList;
  }

  private makePlanetMatchMap(): Map<string, MissionNodeAbilities> {
    let typicalConditions = [
      TravelConditions.Surface,
      TravelConditions.LowOrbit,
      TravelConditions.EllipticalOrbit,
    ];

    return new Map<string, MissionNodeAbilities>([
      ['kerbol', {
        allowConditions: [
          TravelConditions.LowOrbit,
          TravelConditions.EllipticalOrbit,
        ],
      }],
      ['moho', {allowConditions: [...typicalConditions]}],
      ['eve', {allowConditions: [...typicalConditions]}],
      ['gilly', {allowConditions: [...typicalConditions]}],
      ['kerbin', {
        allowConditions: [
          TravelConditions.Surface,
          TravelConditions.LowOrbit,
          TravelConditions.GeostationaryOrbit,
          TravelConditions.EllipticalOrbit,
        ]
      }],
      ['mun', {allowConditions: [...typicalConditions]}],
      ['minmus', {allowConditions: [...typicalConditions]}],
      ['duna', {allowConditions: [...typicalConditions]}],
      ['ike', {allowConditions: [...typicalConditions]}],
    ]);
  }

  private makeStepsFromEscapeToOtherElliptical(from: DestinationConditions,
                                               to: DestinationConditions,
                                               plane: number,
                                               transfer: number,
                                               capture: number): DeltaVStep[] {
    return [
      [from.ellipticalOrbit, from.interceptWith(to), transfer],
      [from.interceptWith(to), from.planeWith(to), plane],
      [from.planeWith(to), to.ellipticalOrbit, capture],

      [to.ellipticalOrbit, to.interceptWith(from), capture],
      [to.interceptWith(from), to.planeWith(from), plane],
      [to.planeWith(from), from.ellipticalOrbit, transfer],
    ];
  }

  getTripDetails(a: MissionNode, b: MissionNode, options: {} = {}): TripDetails {
    let path = this.vacuumGraph.shortestPath(this.stringifyNode(a), this.stringifyNode(b));

    let pathDetails = path.map(nodeId => {
      let [name, condition, combinationNode] = nodeId.split(SEP);
      return {nodeId, name, condition, combinationNode};
    })
      .windowed(2)
      .map(([a, b]) => ({
        startNode: a.name,
        startCondition: a.condition,
        combinationNode: a.combinationNode ?? b.combinationNode,
        endNode: b.name,
        endCondition: b.condition,
        value: this.vacuumGraph.shortestPath(a.nodeId, b.nodeId).weight,
      }));

    return {
      totalDv: path.weight,
      pathDetails,
    };
  }

  private stringifyNode(node: MissionNode) {
    return `${node.name.toLowerCase()}${SEP}${node.condition}`;
  }

  getAvailableConditionsFor(bodyName: string): TravelConditions[] {
    return this.planetMatchMap.get(bodyName.toLowerCase()).allowConditions;
  }

  private makeStepsFromParentToMoon(parent: DestinationConditions,
                                    moon: DestinationConditions,
                                    dvToPlane: number,
                                    dvFromElliptical: number,
                                    dvFromLow: number): DeltaVStep[] {
    return [
      [parent.lowOrbit, parent.interceptWith(moon),
        dvFromLow],
      [parent.ellipticalOrbit, parent.interceptWith(moon),
        dvFromElliptical],
      [parent.interceptWith(moon), parent.planeWith(moon),
        dvToPlane],
    ];
  }

  private makeStepsSelf(body: DestinationConditions,
                        dvLanding: number,
                        dvToElliptical: number): DeltaVStep[] {
    return [
      [body.surface, body.lowOrbit,
        dvLanding],
      [body.lowOrbit, body.ellipticalOrbit,
        dvToElliptical],
    ];
  }
}
