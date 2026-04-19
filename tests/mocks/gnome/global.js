import { vi } from 'vitest';
import { Meta } from './meta.js';

export function setupGnomeMock(windows = []) {
    globalThis.__GNOME__ = {
        Meta,
        Main: {
            overview: {
                visible: false,
                hide: vi.fn(),
            }
        }
    };

    global.workspace_manager = {
        n_workspaces: 1,
        get_n_workspaces: () => 1,

        get_active_workspace: () => ({
            index: () => 0,
            list_windows: () => windows,
        }),

        get_workspace_by_index: () => ({
            list_windows: () => windows,
        }),
    };

    global.display = {
        get_focus_window: () => null,
        get_current_monitor: () => 0,
        sort_windows_by_stacking: (ws) => ws,
    };

    global.get_current_time = () => Date.now();
}
