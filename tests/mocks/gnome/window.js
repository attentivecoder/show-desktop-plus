import { vi } from 'vitest';

export function createMockWindow(id, monitor = 0, props = {}) {
    const win = {
        minimized: props.minimized ?? false,
        skip_taskbar: props.skip_taskbar ?? false,
        window_type: props.window_type ?? 0,
        _id: id,
        _monitor: monitor,
        workspace: props.workspace ?? 0,

        get_id() { return this._id; },
        get_monitor() { return this._monitor; },
        located_on_workspace() { return true; },

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
                if (s === signal) handler(win, ...args);
            }
        },
        
        get_window_type() {
            return this.window_type;
        },

        minimize: vi.fn(() => {
            win.minimized = true;
            win.emit('notify::minimized');
        }),

        unminimize: vi.fn(() => {
            win.minimized = false;
            win.emit('notify::minimized');
        }),

        change_workspace: vi.fn((ws) => {
            win.workspace = ws;
            win.emit('notify::workspace');
        }),

        destroy: vi.fn(() => {
            win.emit('unmanaged');

            const ws = win._workspaceRef;
            if (ws) {
                ws.windows = ws.windows.filter(w => w !== win);
            }

            win.workspace = -1;
        }),

        activate: vi.fn(),

        get_workspace: () => ({ index: () => win.workspace }),

        get_title() {
            return props.title ?? `Window ${id}`;
        },

        get_wm_class() {
            return props.wmClass ?? "org.gnome.Shell.Extensions";
        },
    };

    return win;
}

