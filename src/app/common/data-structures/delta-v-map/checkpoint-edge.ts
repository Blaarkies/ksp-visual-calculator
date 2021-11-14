export class CheckpointEdge {

    dv: number;
    pathDetails: any[];

    constructor({dv, pathDetails}: { dv: number, pathDetails: any[] }) {
        this.dv = dv;
        this.pathDetails = pathDetails;
    }
}
