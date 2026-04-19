export default class StateStore {
    constructor() {
        this._storedStateByWorkspace = new Map();
    }

    getWorkspaceMap(wsIndex) {
        return this._storedStateByWorkspace.get(wsIndex);
    }

    setWorkspaceMap(wsIndex, map) {
        this._storedStateByWorkspace.set(wsIndex, map);
    }

    deleteWorkspace(wsIndex) {
        this._storedStateByWorkspace.delete(wsIndex);
    }

    clear() {
        this._storedStateByWorkspace.clear();
    }

    entries() {
        return this._storedStateByWorkspace.entries();
    }

    hasWorkspace(wsIndex) {
        return this._storedStateByWorkspace.has(wsIndex);
    }
}
