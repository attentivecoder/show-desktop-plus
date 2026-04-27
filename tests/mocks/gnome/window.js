import { vi } from 'vitest';

export function createMockWindow(id, monitor = 0, props = {}) {
    const win = {
        minimized: props.minimized ?? false,
        skip_taskbar: props.skip_taskbar ?? false,
        window_type: props.window_type ?? 0,

        _id: id,
        _monitor: monitor,

        // IMPORTANT: workspace is stored as object, not primitive
        _workspace: props.workspace ?? { index: () => 0 },

        // -----------------------
        // BASIC API
        // -----------------------
        get_id() {
            return this._id;
        },

        get_monitor() {
            return this._monitor;
        },

        located_on_workspace() {
            return true;
        },

        // -----------------------
        // WORKSPACE HANDLING
        // -----------------------
        get_workspace() {
            return this._workspace;
        },

        change_workspace: vi.fn(function (ws) {
            this._workspace = ws;
            this.workspace = ws?.index?.() ?? 0;
            this.emit?.('notify::workspace');
        }),

        workspace: props.workspace?.index?.() ?? 0,

        // -----------------------
        // SIGNAL SYSTEM
        // -----------------------
        _signals: new Map(),
        _nextSignalId: 1,

        connect(signal, handler) {
            const id = this._nextSignalId++;
            this._signals.set(id, { signal, handler });
            return id;
        },

        disconnect(id) {
            this._signals.delete(id);
        },

        emit(signal, ...args) {
            for (const { signal: s, handler } of this._signals.values()) {
                if (s === signal) handler(this, ...args);
            }
        },

        // -----------------------
        // WINDOW ACTIONS
        // -----------------------
        minimize: vi.fn(function () {
            this.minimized = true;
            this.emit('notify::minimized');
        }),

        unminimize: vi.fn(function () {
            this.minimized = false;
            this.emit('notify::minimized');
        }),

        activate: vi.fn(),

        destroy: vi.fn(function () {
            this.emit('unmanaged');
            this.workspace = -1;
        }),

        // -----------------------
        // METADATA
        // -----------------------
        get_title() {
            return props.title ?? `Window ${id}`;
        },

        get_wm_class() {
            return props.wmClass ?? "org.gnome.Shell.Extensions";
        },

        get_window_type() {
            return this.window_type;
        },
    };

    return win;
}
