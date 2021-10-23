import { DestinationConditions } from './destination-conditions';
import { GraphDataStructure, NodeGraph } from './graph-data-structure';
import { TravelCondition } from './travel-condition';
import { CheckpointNode } from './checkpoint-node';

type DeltaVStep = (string | number)[];

class MissionNodeAbilities {
  allowConditions: TravelCondition[];
  allowAerobraking: boolean;
  // allowGravityAssist: boolean;
}

class TripDetails {
  totalDv: number;
  pathDetails: any[];
}

/**
 * Separator between planet names and orbit conditions
 * @example
 * kerbin:surface or kerbin:interceptWith:duna
 */
const SEP = ':';

export class DeltaVGraph {

  private readonly vacuumGraph: GraphDataStructure = NodeGraph();

  private readonly nodeAbilitiesMap: Map<string, MissionNodeAbilities> = this.makeNodeAbilitiesMap();

  constructor() {
    let specialTravelConditions = [TravelCondition.PlaneWith, TravelCondition.InterceptWith];

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
    let [, conditionA, ] = nodeA.split(SEP);
    let [, conditionB, ] = nodeB.split(SEP);

    if (specialTravelConditions.includes(conditionA)
      || specialTravelConditions.includes(conditionB)) {
      this.vacuumGraph.addEdge(nodeA, nodeB, weight);
    } else {
      this.vacuumGraph.addBiEdge(nodeA, nodeB, weight);
    }
  }

  private getDeltaVHops(): DeltaVStep[] {
    let moho = new DestinationConditions(Place.Moho);
    let eve = new DestinationConditions(Place.Eve);
    let gilly = new DestinationConditions(Place.Gilly);
    let kerbin = new DestinationConditions(Place.Kerbin);
    let mun = new DestinationConditions(Place.Mun);
    let minmus = new DestinationConditions(Place.Minmus);
    let duna = new DestinationConditions(Place.Duna);
    let ike = new DestinationConditions(Place.Ike);

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
      [kerbin.lowOrbit, kerbin.geostationaryOrbit, 1115],

      ...this.makeStepsFromParentToMoon(kerbin, mun, 0, 90, 860),
      ...this.makeStepsFromParentToMoon(kerbin, minmus, 340, 340, 930),

      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, moho, 2520, 760, 69),
      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, eve, 460, 90, 69),
      ...this.makeStepsFromEscapeToOtherElliptical(kerbin, duna, 10, 130, 250),
    ];

    let munOut = [
      ...this.makeStepsSelf(mun, 580, 69),
      ...this.makeStepsCaptureAtMoon(kerbin, mun, 69),
    ];

    let minmusOut = [
      ...this.makeStepsSelf(minmus, 180, 69),
      ...this.makeStepsCaptureAtMoon(kerbin, minmus, 69),
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

  private makeNodeAbilitiesMap(): Map<string, MissionNodeAbilities> {
    let typicalConditions = [
      TravelCondition.Surface,
      TravelCondition.LowOrbit,
      TravelCondition.EllipticalOrbit,
    ];

    return new Map<string, MissionNodeAbilities>([
      [Place.Kerbol, {
        allowConditions: [
          TravelCondition.LowOrbit,
          TravelCondition.EllipticalOrbit,
        ],
        allowAerobraking: true,
      }],
      [Place.Moho, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Eve, {allowConditions: [...typicalConditions], allowAerobraking: true}],
      [Place.Gilly, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Kerbin, {
        allowConditions: [
          TravelCondition.Surface,
          TravelCondition.LowOrbit,
          TravelCondition.GeostationaryOrbit,
          TravelCondition.EllipticalOrbit,
        ],
        allowAerobraking: true
      }],
      [Place.Mun, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Minmus, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Duna, {allowConditions: [...typicalConditions], allowAerobraking: true}],
      [Place.Ike, {allowConditions: [...typicalConditions], allowAerobraking: false}],
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

  private makeStepsFromParentToMoon(parent: DestinationConditions,
                                    moon: DestinationConditions,
                                    dvToPlane: number,
                                    dvFromElliptical: number,
                                    dvFromLow: number): DeltaVStep[] {
    return [
      [parent.lowOrbit, parent.interceptWith(moon), dvFromLow],
      [parent.ellipticalOrbit, parent.interceptWith(moon), dvFromElliptical],
      [parent.interceptWith(moon), parent.planeWith(moon), dvToPlane],

      [moon.planeWith(parent), parent.lowOrbit, dvFromLow],
      [moon.planeWith(parent), parent.ellipticalOrbit, dvFromElliptical],
      [moon.interceptWith(parent), moon.planeWith(parent), dvToPlane],
    ];
  }

  private makeStepsSelf(body: DestinationConditions,
                        dvLanding: number,
                        dvToElliptical: number): DeltaVStep[] {
    return [
      [body.surface, body.lowOrbit, dvLanding],
      [body.lowOrbit, body.ellipticalOrbit, dvToElliptical],
    ];
  }

  private makeStepsCaptureAtMoon(outside: DestinationConditions, inside: DestinationConditions, dvCapture: number) {
    return [
      [outside.planeWith(inside), inside.ellipticalOrbit, dvCapture],
      [inside.ellipticalOrbit, inside.interceptWith(outside), dvCapture],
    ];
  }

  private stringifyNode(node: CheckpointNode) {
    return `${node.name.toLowerCase()}${SEP}${node.condition}`;
  }

  getTripDetails(nodeA: CheckpointNode, nodeB: CheckpointNode, options: { planeChangeFactor?: number } = {}): TripDetails {
    let path = this.vacuumGraph.shortestPath(this.stringifyNode(nodeA), this.stringifyNode(nodeB));

    let pathDetails = path.map(nodeId => {
      let [name, condition, combinationNode] = nodeId.split(SEP);
      return {nodeId, name, condition, combinationNode};
    })
      .windowed(2)
      .map(([a, b]) => ({a, b, value: this.vacuumGraph.shortestPath(a.nodeId, b.nodeId).weight}))
      .filter(({value}) => value)
      .map(({a, b, value}) => {
        let aerobraking = this.canAerobrakeAt(a.name, a.condition,
          b.name, b.condition, b.combinationNode, nodeB.aerobraking);

        let dvCost = this.getDvCostWithOptions(
          value,
          {aerobraking, planeChangeFactor: options.planeChangeFactor, endCondition: b.condition});
        return ({
          startNode: a.name,
          startCondition: a.condition,
          combinationNode: a.combinationNode ?? b.combinationNode,
          endNode: b.name,
          endCondition: b.condition,
          value: dvCost.toInt(),
          aerobraking,
        });
      });

    return {
      totalDv: pathDetails.map(pd => pd.value).sum(),
      pathDetails,
    };
  }

  getAvailableConditionsFor(bodyName: string): TravelCondition[] {
    return this.nodeAbilitiesMap.get(bodyName.toLowerCase()).allowConditions;
  }

  getNodeAllowsAerobraking(node: CheckpointNode): boolean {
    return this.nodeAbilitiesMap.get(node.name.toLowerCase()).allowAerobraking;
  }

  private canAerobrakeAt(fromDestination: string, fromCondition: string,
                         toDestination: string, toCondition: string,
                         combinationNode: string,
                         tripRequestsAerobrake: boolean): boolean {
    if (!tripRequestsAerobrake || combinationNode) {
      return false;
    }

    let destinationAllowsAerobraking = this.nodeAbilitiesMap.get(toDestination).allowAerobraking;
    let canAerobrake = TransferFromToCondition.AerobrakeIsPossible[fromCondition + SEP + toCondition];

    return destinationAllowsAerobraking && canAerobrake;
  }

  private getDvCostWithOptions(maxDvCost: number,
                               options: { planeChangeFactor: number; aerobraking: boolean; endCondition: string }) {
    if (options.endCondition === TravelCondition.PlaneWith) {
      return maxDvCost * options.planeChangeFactor;
    } else if (options.aerobraking) {
      return 0;
    } else {
      return maxDvCost;
    }
  }
}

class Place {
  static Kerbol = 'kerbol';
  static Moho = 'moho';
  static Eve = 'eve';
  static Gilly = 'gilly';
  static Kerbin = 'kerbin';
  static Mun = 'mun';
  static Minmus = 'minmus';
  static Duna = 'duna';
  static Ike = 'ike';
}

class TransferFromToCondition {
  static AerobrakeIsPossible = {
    [TravelCondition.PlaneWith + SEP + TravelCondition.EllipticalOrbit]: true,
    [TravelCondition.PlaneWith + SEP + TravelCondition.LowOrbit]: true, // from a moon to parent planet
    [TravelCondition.EllipticalOrbit + SEP + TravelCondition.LowOrbit]: true,
    [TravelCondition.LowOrbit + SEP + TravelCondition.Surface]: true,
  };
}
