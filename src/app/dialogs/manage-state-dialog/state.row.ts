export class StateRow {

    name: string;
    timestamp: string;
    version: string;
    state: string;

    constructor(stateEntry: any) {
        this.name = stateEntry.name;
        this.timestamp = new Date(stateEntry.timestamp.seconds * 1e3).toLocaleString();
        this.version = 'v' + stateEntry.version.join('.');
        this.state = stateEntry.state;
    }

}
