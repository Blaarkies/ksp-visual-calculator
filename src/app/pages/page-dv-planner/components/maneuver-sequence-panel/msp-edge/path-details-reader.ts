import { TravelCondition } from '../../../domain/travel-condition';

export class PathDetailsReader {

  static conditionMap = {
    [TravelCondition.Surface]: 'Surface',
    [TravelCondition.LowOrbit]: 'Low Orbit',
    [TravelCondition.EllipticalOrbit]: 'Elliptical Orbit',
    [TravelCondition.PlaneWith]: 'Plane With',
    [TravelCondition.InterceptWith]: 'Intercept With',
    [TravelCondition.GeostationaryOrbit]: 'Geostationary Orbit',
  };

  static makeDescription(startNode: string,
                         startCondition: string,
                         combinationNode: string,
                         endNode: string,
                         endCondition: string,
                         aerobraking: boolean): string {
    let map = PathDetailsReader.conditionMap;

    let displayStartNode = startNode.toTitleCase();
    let displayStartCondition = map[startCondition].toLowerCase();
    let displayCombinationNode = combinationNode?.toTitleCase();
    let displayEndNode = endNode.toTitleCase();
    let displayEndCondition = map[endCondition].toLowerCase();

    return PathDetailsReader.aerobrakeCapture(
        aerobraking,
        endCondition,
        displayEndNode,
        displayEndCondition)
      ?? PathDetailsReader.specialCondition(
        endCondition,
        displayStartNode,
        displayStartCondition,
        displayCombinationNode,
        displayEndNode)
      ?? PathDetailsReader.normalCondition(
        startCondition,
        displayStartNode,
        displayStartCondition,
        displayCombinationNode,
        displayEndNode,
        displayEndCondition);

  }

  private static aerobrakeCapture(aerobraking: boolean,
                                  lastTravelCondition: string,
                                  endNode: string,
                                  endCondition: string) {
    if (!aerobraking) {
      return null;
    }

    switch (lastTravelCondition) {
      case TravelCondition.Surface:
        return `Enter atmosphere of ${endNode} to land`;
      case TravelCondition.LowOrbit:
        return `Aerobrake at ${endNode} into a low orbit`;
      case TravelCondition.EllipticalOrbit:
        return `Aerocapture at ${endNode} into an elliptical orbit`;
      default:
        return null;
    }
  }

  private static specialCondition(lastTravelCondition: string,
                                  startNode: string,
                                  startCondition: string,
                                  combinationNode: string,
                                  endNode: string) {
    switch (lastTravelCondition) {
      case TravelCondition.PlaneWith:
        return `${startNode} orbital plane correction to match ${combinationNode}`;
      case TravelCondition.InterceptWith:
        return `${startNode} maneuver to intercept ${combinationNode}`;
      case TravelCondition.Surface:
        return `Land on ${endNode}`;
      default:
        return null;
    }
  }

  private static normalCondition(firstTravelCondition: string,
                                 startNode: string,
                                 startCondition: string,
                                 combinationNode: string,
                                 endNode: string,
                                 endCondition: string) {
    switch (firstTravelCondition) {
      case TravelCondition.PlaneWith: // PlaneWith always assumes an Intercept trajectory
        return `Capture into ${endNode} ${endCondition}`;
      case TravelCondition.InterceptWith:
        return `Capture into ${endNode} ${endCondition}`;
      case TravelCondition.Surface:
        return `Launch from ${startNode} to ${endCondition}`;
      case TravelCondition.LowOrbit:
        return `${startNode} ${startCondition} to ${endCondition}`;
      case TravelCondition.GeostationaryOrbit:
        return `${startNode} ${startCondition} to ${endCondition}`;
      case TravelCondition.EllipticalOrbit:
        return `${startNode} ${startCondition} to ${endCondition}`;
      default:
        return `${startNode} ${startCondition} ⇒ ${endNode} ${endCondition}`;
    }
  }
}
