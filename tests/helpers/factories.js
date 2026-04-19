import { vi } from 'vitest';
import { Meta } from '../mocks/gnome/meta.js';
import StateStore from '../../core/stateStore.js';

export function createWindow(id, opts = {}) {
    return {
        id,
        minimized: false,
        skip_taskbar: !!opts.skip_taskbar,
        window_type: opts.window_type ?? Meta.WindowType.NORMAL,
        monitor: opts.monitor ?? 0,

        get_id: () => id,
        get_monitor: () => opts.monitor ?? 0,
        located_on_workspace: () => true,

        minimize: vi.fn(function () { this.minimized = true }),
        unminimize: vi.fn(function () { this.minimized = false }),
        activate: vi.fn(),
        connect: vi.fn(),
    };
}

export function createStore() {
    return new StateStore();
}
