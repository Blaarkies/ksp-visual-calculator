import { TravelConditions } from '../../../common/data-structures/delta-v-map/travel-conditions';

export class PathDetailsReader {

    private static conditionMap = {
        [TravelConditions.Surface]: 'Surface',
        [TravelConditions.LowOrbit]: 'Low Orbit',
        [TravelConditions.EllipticalOrbit]: 'Elliptical Orbit',
        [TravelConditions.PlaneWith]: 'Plane With',
        [TravelConditions.InterceptWith]: 'Intercept With',
        [TravelConditions.GeostationaryOrbit]: 'Geostationary Orbit',
    };

    static makeDescription(startNode: string,
                           startCondition: string,
                           combinationNode: string,
                           endNode: string,
                           endCondition: string): string {
        let map = PathDetailsReader.conditionMap;

        let displayStartNode = startNode.toTitleCase();
        let displayStartCondition = map[startCondition].toLowerCase();
        let displayCombinationNode = combinationNode?.toTitleCase();
        let displayEndNode = endNode.toTitleCase();
        let displayEndCondition = map[endCondition].toLowerCase();

        return PathDetailsReader.specialCondition(
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

    private static specialCondition(lastTravelCondition: string,
                                    startNode: string,
                                    startCondition: string,
                                    combinationNode: string,
                                    endNode: string) {
        switch (lastTravelCondition) {
            case TravelConditions.PlaneWith:
                return `${startNode} orbital plane correction to match ${combinationNode}`;
            case TravelConditions.InterceptWith:
                return `${startNode} maneuver to intercept ${combinationNode}`;
            case TravelConditions.Surface:
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
            case TravelConditions.PlaneWith: // PlaneWith always assumes an Intercept trajectory
                return `Capture into ${endNode} ${endCondition}`;
            case TravelConditions.Surface:
                return `Launch from ${startNode} to ${endCondition}`;
            case TravelConditions.LowOrbit:
                return `${startNode} ${startCondition} to ${endCondition}`;
            case TravelConditions.GeostationaryOrbit:
                return `${startNode} ${startCondition} to ${endCondition}`;
            case TravelConditions.EllipticalOrbit:
                return `${startNode} ${startCondition} to ${endCondition}`;
            default:
                return `${startNode} ${startCondition} ⇒ ${endNode} ${endCondition}`;
        }
    }
}
