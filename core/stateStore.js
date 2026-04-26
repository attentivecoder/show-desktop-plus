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
    
    get size() {
        return this._storedStateByWorkspace.size;
    }


    entries() {
        return this._storedStateByWorkspace.entries();
    }
    
    forEach(callback) {
        this._storedStateByWorkspace.forEach(callback);
    }

    hasWorkspace(wsIndex) {
        return this._storedStateByWorkspace.has(wsIndex);
    }
    
    getOrCreateWorkspaceMap(wsIndex) {
        let map = this._storedStateByWorkspace.get(wsIndex);
        if (!map) {
            map = new Map();
            this._storedStateByWorkspace.set(wsIndex, map);
        }
        return map;
    }
    
    deleteWindowId(id) {
        for (const [wsIndex, map] of this._storedStateByWorkspace) {
            for (const [key, list] of map) {
                const filtered = list.filter(wid => wid !== id);
                if (filtered.length > 0)
                    map.set(key, filtered);
                else
                    map.delete(key);
            }

            if (map.size === 0)
                this._storedStateByWorkspace.delete(wsIndex);
        }
    }
}
