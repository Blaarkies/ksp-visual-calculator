import { DeltavDestination } from './deltav-destination';
import { GraphDataStructure, NodeGraph } from './graph-data-structure';
import { TravelCondition } from './travel-condition';
import { CheckpointNode } from './checkpoint-node';
import { DvRouteType } from '../../domain/dv-route-type';

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

  private readonly graphWeighted: GraphDataStructure = NodeGraph();
  private readonly graphWeightless: GraphDataStructure = NodeGraph();

  private readonly nodeAbilitiesMap: Map<string, MissionNodeAbilities> = this.makeNodeAbilitiesMap();

  constructor() {
    let specialTravelConditions = [TravelCondition.PlaneWith, TravelCondition.InterceptWith];

    this.getDeltaVHops()
      .forEach(([nodeA, nodeB, weight]: [string, string, number]) =>
        this.setupEdges(nodeA, nodeB, specialTravelConditions, weight));
  }

  /**
   * Adds bidirectional edges to simple travel conditions (e.g. mun:surface to mun:lowOrbit),
   * but single edges for complex conditions.
   */
  private setupEdges(nodeA: string, nodeB: string, specialTravelConditions: string[], weight: number) {
    let [, conditionA] = nodeA.split(SEP);
    let [, conditionB] = nodeB.split(SEP);

    if (specialTravelConditions.includes(conditionA)
      || specialTravelConditions.includes(conditionB)) {
      this.graphWeighted.addEdge(nodeA, nodeB, weight);
      this.graphWeightless.addEdge(nodeA, nodeB);
    } else {
      this.graphWeighted.addBiEdge(nodeA, nodeB, weight);
      this.graphWeightless.addBiEdge(nodeA, nodeB);
    }
  }

  private getDeltaVHops(): DeltaVStep[] {
    let kerbol = new DeltavDestination(Place.Kerbol, 27640);
    let moho = new DeltavDestination(Place.Moho, 319);
    let eve = new DeltavDestination(Place.Eve, 1303);
    let gilly = new DeltavDestination(Place.Gilly, 5.7);
    let kerbin = new DeltavDestination(Place.Kerbin, 931);
    let mun = new DeltavDestination(Place.Mun, 199);
    let minmus = new DeltavDestination(Place.Minmus, 62);
    let duna = new DeltavDestination(Place.Duna, 364);
    let ike = new DeltavDestination(Place.Ike, 120);
    let dres = new DeltavDestination(Place.Dres, 157);
    let jool = new DeltavDestination(Place.Jool, 2782);
    let laythe = new DeltavDestination(Place.Laythe, 596);
    let vall = new DeltavDestination(Place.Vall, 271);
    let tylo = new DeltavDestination(Place.Tylo, 809);
    let bop = new DeltavDestination(Place.Bop, 68); // measured from 10km low orbit (orbit is not stable)
    let pol = new DeltavDestination(Place.Pol, 44);
    let eeloo = new DeltavDestination(Place.Eeloo, 240);

    let destinations: { [key: string]: DeltavDestination } = {
      kerbol, moho, eve, gilly, kerbin, mun, minmus, duna, ike,
      dres, jool, laythe, vall, tylo, bop, pol, eeloo
    };

    let kerbolOut = [
      [kerbol.lowOrbit, kerbol.ellipticalOrbit, kerbol.dvToElliptical],

      ...StepMaker.starToPlanet(kerbol, moho, 24780, 7530),
      ...StepMaker.starToPlanet(kerbol, eve, 26450, 5130),
      ...StepMaker.starToPlanet(kerbol, kerbin, 26800, 4930),
      ...StepMaker.starToPlanet(kerbol, duna, 27130, 4900),
      ...StepMaker.starToPlanet(kerbol, dres, 27390, 4350),
      ...StepMaker.starToPlanet(kerbol, jool, 27530, 570),
      ...StepMaker.starToPlanet(kerbol, eeloo, 27540, 3010),
    ];

    let mohoOut = [...StepMaker.self(moho, 870)];

    let eveOut = [
      ...StepMaker.self(eve, 8000),
      ...StepMaker.parentToMoon(eve, gilly, 0, 1287, 191),
    ];
    let gillyOut = [...StepMaker.self(gilly, 30)];

    let kerbinOut = [
      ...StepMaker.self(kerbin, 3400),
      [kerbin.lowOrbit, kerbin.geostationaryOrbit, 1115],

      ...StepMaker.parentToMoon(kerbin, mun, 0, 852, 71.8),
      ...StepMaker.parentToMoon(kerbin, minmus, 0, 921, 98),
    ];
    let munOut = [...StepMaker.self(mun, 580)];
    let minmusOut = [...StepMaker.self(minmus, 180)];

    let dunaOut = [
      ...StepMaker.self(duna, 1450),
      ...StepMaker.parentToMoon(duna, ike, 0, 282, 10.8),
    ];
    let ikeOut = [...StepMaker.self(ike, 390)];

    let dresOut = [...StepMaker.self(dres, 430)];

    let joolOut = [
      ...StepMaker.self(jool, 14000),
      ...StepMaker.parentToMoon(jool, laythe, 0, 1812, 210),
      ...StepMaker.parentToMoon(jool, vall, 0, 2168, 568),
      ...StepMaker.parentToMoon(jool, tylo, 0, 2378, 209),
      ...StepMaker.parentToMoon(jool, bop, 0, 2608, 647),
      ...StepMaker.parentToMoon(jool, pol, 0, 2655, 643),
    ];
    let laytheOut = [...StepMaker.self(laythe, 2900)];
    let vallOut = [...StepMaker.self(vall, 860)];
    let tyloOut = [...StepMaker.self(tylo, 2270)];
    let bopOut = [...StepMaker.self(bop, 230)];
    let polOut = [...StepMaker.self(pol, 130)];

    let eelooOut = [...StepMaker.self(eeloo, 620)];

    /**
     * Handles the transfers for all bodies, from the body's elliptical orbit, into a capture of
     * the other body's elliptical orbit
     */
    let interBodyTransfers = bodiesTransferDvNumbers.map(({origin, destination, ejectDv, captureDv, planeChangeDv}) => {
      let from = destinations[origin];
      let to = destinations[destination];
      return StepMaker.escapeToOtherElliptical(from, to, planeChangeDv,
        ejectDv - from.dvToElliptical, captureDv - to.dvToElliptical);
    })
      .flatMap();

    let fullList = [
      ...kerbolOut,

      ...mohoOut,

      ...eveOut,
      ...gillyOut,

      ...kerbinOut,
      ...munOut,
      ...minmusOut,

      ...dunaOut,
      ...ikeOut,

      ...dresOut,

      ...joolOut,
      ...laytheOut,
      ...vallOut,
      ...tyloOut,
      ...bopOut,
      ...polOut,

      ...eelooOut,

      ...interBodyTransfers,
    ];

    return fullList;
  }

  private makeNodeAbilitiesMap(): Map<string, MissionNodeAbilities> {
    let typicalConditions = [
      TravelCondition.Surface,
      TravelCondition.LowOrbit,
      TravelCondition.EllipticalOrbit,
    ];

    let noSurfaceConditions = [
      TravelCondition.LowOrbit,
      TravelCondition.EllipticalOrbit,
    ];

    return new Map<string, MissionNodeAbilities>([
      [Place.Kerbol, {allowConditions: [...noSurfaceConditions], allowAerobraking: true}],
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
      [Place.Dres, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Jool, {allowConditions: [...noSurfaceConditions], allowAerobraking: true}],
      [Place.Laythe, {allowConditions: [...typicalConditions], allowAerobraking: true}],
      [Place.Vall, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Tylo, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Bop, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Pol, {allowConditions: [...typicalConditions], allowAerobraking: false}],
      [Place.Eeloo, {allowConditions: [...typicalConditions], allowAerobraking: false}],
    ]);
  }


  private stringifyNode(node: CheckpointNode) {
    return `${node.name.toLowerCase()}${SEP}${node.condition}`;
  }

  getTripDetails(nodeA: CheckpointNode,
                 nodeB: CheckpointNode,
                 options: {
                   errorMarginFactor?: number,
                   planeChangeFactor?: number,
                   routeType?: DvRouteType,
                 } = {}): TripDetails {
    let graph = options.routeType === DvRouteType.lessDv
      ? this.graphWeighted
      : this.graphWeightless;

    let path = graph.shortestPath(this.stringifyNode(nodeA), this.stringifyNode(nodeB));

    let pathDetails = path.map(nodeId => {
      let [name, condition, combinationNode] = nodeId.split(SEP);
      return {nodeId, name, condition, combinationNode};
    })
      .windowed(2)
      .map(([a, b]) => ({a, b, value: this.graphWeighted.shortestPath(a.nodeId, b.nodeId).weight}))
      .filter(({value}) => value)
      .map(({a, b, value}) => {
        let aerobraking = this.canAerobrakeAt(a.name, a.condition,
          b.name, b.condition, b.combinationNode, nodeB.aerobraking);

        let dvCost = this.getDvCostWithOptions(
          value,
          {
            errorMarginFactor: options.errorMarginFactor,
            aerobraking,
            planeChangeFactor: options.planeChangeFactor,
            endCondition: b.condition,
          });
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
                               options: {
                                 errorMarginFactor: number,
                                 planeChangeFactor: number;
                                 aerobraking: boolean;
                                 endCondition: string
                               }) {
    let dvCost;

    if (options.endCondition === TravelCondition.PlaneWith) {
      dvCost = maxDvCost * options.planeChangeFactor;
    } else if (options.aerobraking) {
      dvCost = 0;
    } else {
      dvCost = maxDvCost;
    }

    return dvCost * options.errorMarginFactor;
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
  static Dres = 'dres';
  static Jool = 'jool';
  static Laythe = 'laythe';
  static Vall = 'vall';
  static Tylo = 'tylo';
  static Bop = 'bop';
  static Pol = 'pol';
  static Eeloo = 'eeloo';
}

class TransferFromToCondition {
  static AerobrakeIsPossible = {
    [TravelCondition.PlaneWith + SEP + TravelCondition.EllipticalOrbit]: true,
    [TravelCondition.PlaneWith + SEP + TravelCondition.LowOrbit]: true, // from a moon to parent planet
    [TravelCondition.EllipticalOrbit + SEP + TravelCondition.LowOrbit]: true,
    [TravelCondition.LowOrbit + SEP + TravelCondition.Surface]: true,
  };
}

class StepMaker {

  static escapeToOtherElliptical(from: DeltavDestination,
                                 to: DeltavDestination,
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

  static parentToMoon(parent: DeltavDestination,
                      moon: DeltavDestination,
                      dvToPlane: number,
                      dvFromLow: number,
                      dvCapture: number): DeltaVStep[] {
    return [
      [parent.lowOrbit, parent.interceptWith(moon), dvFromLow],
      [parent.ellipticalOrbit, parent.interceptWith(moon), parent.dvToElliptical - dvFromLow],
      [parent.interceptWith(moon), parent.planeWith(moon), dvToPlane],

      [moon.planeWith(parent), parent.lowOrbit, dvFromLow],
      [moon.planeWith(parent), parent.ellipticalOrbit, parent.dvToElliptical - dvFromLow],
      [moon.interceptWith(parent), moon.planeWith(parent), dvToPlane],

      ...this.captureAtMoon(parent, moon, dvCapture),
    ];
  }

  static self(body: DeltavDestination,
              dvLanding: number): DeltaVStep[] {
    return [
      [body.surface, body.lowOrbit, dvLanding],
      [body.lowOrbit, body.ellipticalOrbit, body.dvToElliptical],
    ];
  }

  static captureAtMoon(outside: DeltavDestination,
                       inside: DeltavDestination,
                       dvCapture: number): DeltaVStep[] {
    return [
      [outside.planeWith(inside), inside.ellipticalOrbit, dvCapture],
      [inside.ellipticalOrbit, inside.interceptWith(outside), dvCapture],
    ];
  }

  static starToPlanet(star: DeltavDestination,
                      planet: DeltavDestination,
                      dvFromLow: number,
                      dvCapture: number): DeltaVStep[] {
    return [
      ...this.parentToMoon(star, planet, 0, dvFromLow, dvCapture),
    ];
  }
}

let bodiesTransferDvNumbers: { origin, destination, ejectDv, captureDv, planeChangeDv }[] = JSON.parse(`[
{"origin":"eve","destination":"moho","ejectDv":2241,"captureDv":1260,"planeChangeDv":0},
{"origin":"kerbin","destination":"eve","ejectDv":1025,"captureDv":1411,"planeChangeDv":0},
{"origin":"kerbin","destination":"moho","ejectDv":2288,"captureDv":1909,"planeChangeDv":0},
{"origin":"duna","destination":"moho","ejectDv":2523,"captureDv":2700,"planeChangeDv":0},
{"origin":"duna","destination":"eve","ejectDv":1013,"captureDv":1683,"planeChangeDv":0},
{"origin":"duna","destination":"kerbin","ejectDv":556,"captureDv":1088,"planeChangeDv":0},
{"origin":"dres","destination":"moho","ejectDv":2673,"captureDv":3596,"planeChangeDv":0},
{"origin":"dres","destination":"eve","ejectDv":1642,"captureDv":2216,"planeChangeDv":0},
{"origin":"dres","destination":"kerbin","ejectDv":1305,"captureDv":1560,"planeChangeDv":0},
{"origin":"dres","destination":"duna","ejectDv":738,"captureDv":867,"planeChangeDv":0},
{"origin":"jool","destination":"moho","ejectDv":3165,"captureDv":4012,"planeChangeDv":0},
{"origin":"jool","destination":"eve","ejectDv":3000,"captureDv":2517,"planeChangeDv":0},
{"origin":"jool","destination":"kerbin","ejectDv":2961,"captureDv":1931,"planeChangeDv":0},
{"origin":"jool","destination":"duna","ejectDv":2888,"captureDv":1280,"planeChangeDv":0},
{"origin":"jool","destination":"dres","ejectDv":2805,"captureDv":612,"planeChangeDv":2},
{"origin":"eeloo","destination":"moho","ejectDv":1818,"captureDv":5020,"planeChangeDv":2},
{"origin":"eeloo","destination":"eve","ejectDv":1405,"captureDv":2708,"planeChangeDv":2},
{"origin":"eeloo","destination":"kerbin","ejectDv":1319,"captureDv":2114,"planeChangeDv":2},
{"origin":"eeloo","destination":"duna","ejectDv":1044,"captureDv":1551,"planeChangeDv":2},
{"origin":"eeloo","destination":"dres","ejectDv":1060,"captureDv":492,"planeChangeDv":2},
{"origin":"eeloo","destination":"jool","ejectDv":246,"captureDv":2849,"planeChangeDv":2},
{"origin":"minmus","destination":"mun","ejectDv":85,"captureDv":215,"planeChangeDv":2},
{"origin":"vall","destination":"laythe","ejectDv":330,"captureDv":628,"planeChangeDv":2},
{"origin":"tylo","destination":"laythe","ejectDv":848,"captureDv":649,"planeChangeDv":2},
{"origin":"tylo","destination":"vall","ejectDv":830,"captureDv":357,"planeChangeDv":2},
{"origin":"bop","destination":"laythe","ejectDv":404,"captureDv":787,"planeChangeDv":2},
{"origin":"bop","destination":"vall","ejectDv":304,"captureDv":483,"planeChangeDv":2},
{"origin":"bop","destination":"tylo","ejectDv":109,"captureDv":894,"planeChangeDv":2},
{"origin":"pol","destination":"laythe","ejectDv":416,"captureDv":797,"planeChangeDv":2},
{"origin":"pol","destination":"vall","ejectDv":303,"captureDv":495,"planeChangeDv":2},
{"origin":"pol","destination":"tylo","ejectDv":178,"captureDv":846,"planeChangeDv":2},
{"origin":"pol","destination":"bop","ejectDv":75,"captureDv":182,"planeChangeDv":2}]`);
