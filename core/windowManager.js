export default class WindowManager {
    constructor(stateStore, extension, onStateChanged, gnome = null) {
        this._stateStore = stateStore;
        this._extension = extension;
        this._onStateChanged = onStateChanged;

        this._Meta = gnome?.Meta ?? globalThis.Meta;
        this._Main = gnome?.Main ?? globalThis.Main;
        this._workspace_manager = gnome?.workspace_manager ?? global.get_workspace_manager();
        this._display = gnome?.display ?? global.get_display();
        this._get_current_time = gnome?.get_current_time ?? global.get_current_time;

        this._displaySignals = [];
        this._windowSignals = new Map();

        this._connectSignals();
    }

    _connectSignals() {
        const id1 = this._display.connect('window-created', (_d, win) => {
            this._trackWindow(win);
            this._onStateChanged();
        });

        this._displaySignals.push(id1);
    }

    _trackWindow(win) {
        if (!win || win._dtpTracked) return;
        win._dtpTracked = true;

        const ids = [];

        ids.push(win.connect('unmanaged', () => {
            this._removeWindowFromState(win);
            this._onStateChanged();
        }));

        ids.push(win.connect('notify::minimized', () => {
            if (!win.minimized) {
                this._removeWindowFromState(win);
                this._onStateChanged();
            }
        }));

        this._windowSignals.set(win, ids);
    }

    disable() {
        for (const id of this._displaySignals)
            this._display.disconnect(id);
        this._displaySignals = [];

        for (const [win, ids] of this._windowSignals) {
            for (const id of ids)
                win.disconnect(id);

            delete win._dtpTracked;
        }

        this._windowSignals.clear();
    }

    _shouldBeIgnored(w) {
        return (
            !w ||
            w.minimized ||
            w.skip_taskbar ||
            w.window_type !== this._Meta.WindowType.NORMAL
        );
    }

    _getWindowId(w) {
        try {
            return w?.get_id?.() ?? null;
        } catch {
            return null;
        }
    }

    _resolveWindowById(id) {
        if (!id) return null;

        const wm = this._workspace_manager;

        const workspaces = wm.get_n_workspaces
            ? Array.from({ length: wm.n_workspaces }, (_, i) =>
                  wm.get_workspace_by_index(i)
              )
            : [wm.get_active_workspace()];

        for (const ws of workspaces) {
            for (const w of ws.list_windows()) {
                if (this._getWindowId(w) === id)
                    return w;
            }
        }
        return null;
    }

    _cleanWorkspaceMap(map) {
        for (const [key, list] of map.entries()) {
            const filtered = list.filter(id => this._resolveWindowById(id));
            if (filtered.length > 0) map.set(key, filtered);
            else map.delete(key);
        }
    }

    getHiddenCountForWorkspace(wsIndex) {
        const map = this._stateStore.getWorkspaceMap(wsIndex);
        if (!map) return 0;

        this._cleanWorkspaceMap(map);

        let count = 0;
        for (const list of map.values())
            count += list.length;

        return count;
    }

    _removeWindowFromState(win) {
        const id = this._getWindowId(win);

        for (const [wsIndex, map] of this._stateStore.entries()) {
            for (const [key, list] of map.entries()) {
                const filtered = list.filter(wid => wid !== id);

                if (filtered.length > 0)
                    map.set(key, filtered);
                else
                    map.delete(key);
            }

            if (map.size === 0)
                this._stateStore.deleteWorkspace(wsIndex);
        }
    }

    addCurrentWindowToHidden() {
        const workspace = this._workspace_manager.get_active_workspace();
        const wsIndex = workspace.index();

        const focusWin = this._display.get_focus_window();
        if (!focusWin || this._shouldBeIgnored(focusWin)) return;

        const id = this._getWindowId(focusWin);
        if (!id) return;


        const map = this._stateStore.getOrCreateWorkspaceMap(wsIndex);
        
        const ignoreExternal =
            this._extension._settings.get_boolean('current-monitor-only');
        const monitor = focusWin.get_monitor();
        const key = ignoreExternal ? monitor : -1;

        if (!map.has(key)) map.set(key, []);

        const list = map.get(key);

        if (!list.includes(id)) {
            list.push(id);
            this._trackWindow(focusWin);
            focusWin.minimize();
        }

        this._onStateChanged();
    }

    hideAllWindows() {
        const workspace = this._workspace_manager.get_active_workspace();
        const wsIndex = workspace.index();

        const ignoreExternal =
            this._extension._settings.get_boolean('current-monitor-only');
        const currentMonitor = this._display.get_current_monitor();

        const windows = workspace.list_windows();

        const sorted = this._display
            .sort_windows_by_stacking(windows)
            .filter(
                w =>
                    !this._shouldBeIgnored(w) &&
                    w.located_on_workspace(workspace) &&
                    (!ignoreExternal || w.get_monitor() === currentMonitor)
            );

        if (sorted.length === 0) return;

        const map = new Map();
        const key = ignoreExternal ? currentMonitor : -1;

        map.set(
            key,
            sorted.map(w => this._getWindowId(w)).filter(Boolean)
        );

        this._stateStore.setWorkspaceMap(wsIndex, map);

        for (const w of sorted) {
            this._trackWindow(w);
            w.minimize();
        }

        if (this._Main.overview.visible)
            this._Main.overview.hide();

        this._onStateChanged();
    }

    restoreAllWindows() {
        const workspace = this._workspace_manager.get_active_workspace();
        const wsIndex = workspace.index();

        const map = this._stateStore.getWorkspaceMap(wsIndex);
        if (!map) return;

        let last = null;

        for (const list of map.values()) {
            for (const id of list) {
                const w = this._resolveWindowById(id);
                if (!w) continue;

                try {
                    if (typeof w.unminimize === 'function')
                        w.unminimize();

                    last = w;
                } catch {}
            }
        }

        if (last) {
            try {
                if (typeof last.activate === 'function')
                    last.activate(this._get_current_time());
            } catch {}
        }

        this._stateStore.deleteWorkspace(wsIndex);

        if (this._Main.overview.visible)
            this._Main.overview.hide();

        this._onStateChanged();
    }

    toggleDesktop() {
        const wsIndex = this._workspace_manager.get_active_workspace().index();

        if (!this._stateStore.getWorkspaceMap(wsIndex))
            this.hideAllWindows();
        else
            this.restoreAllWindows();
    }
}

