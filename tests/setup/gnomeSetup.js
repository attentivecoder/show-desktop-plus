import { Meta, Main } from '../mocks/gnome/gnome.js';

globalThis.__GNOME__ = {
    Meta,
    Main
};

globalThis.global = {
    workspace_manager: {
        get_active_workspace: () => ({
            index: () => 0,
            list_windows: () => []
        }),
        get_n_workspaces: 1,
        get_workspace_by_index: () => ({
            list_windows: () => []
        })
    },
    display: {
        get_focus_window: () => null,
        get_current_monitor: () => 0,
        sort_windows_by_stacking: (w) => w
    },
    get_current_time: () => Date.now()
};
