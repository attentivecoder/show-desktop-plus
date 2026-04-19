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

        _signals: {},

        connect: vi.fn((signal, handler) => {
            win._signals[signal] = handler;
            return id * 1000;
        }),

        disconnect: vi.fn(),

        emit(signal, ...args) {
            if (win._signals[signal]) {
                win._signals[signal](win, ...args);
            }
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
        title: props.title ?? `Window ${id}`,
    };

    return win;
}

