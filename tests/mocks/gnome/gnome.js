import { vi } from 'vitest';
import { Meta as MetaBase } from './meta.js';
import { createMockWorkspace } from './workspace.js';

export function createMockGnomeAPI(workspacesOrWindows) {
    const first = workspacesOrWindows?.[0];

    const workspaces =
        first && typeof first.list_windows === 'function'
            ? workspacesOrWindows
            : [createMockWorkspace(0, workspacesOrWindows || [])];

    // -----------------------------
    // WORKSPACE MANAGER
    // -----------------------------
    const workspace_manager = {
        n_workspaces: workspaces.length,
        get_n_workspaces: () => workspaces.length,

        _active: 0,

        get_active_workspace: () => workspaces[workspace_manager._active],
        get_workspace_by_index: (i) => workspaces[i],

        switch_to: (i) => {
            if (i >= 0 && i < workspaces.length) {
                workspace_manager._active = i;
            }
        },

        _signals: {},

        connect: vi.fn(function (signal, handler) {
            this._signals[signal] = handler;
            return 999;
        }),

        emit: function (signal, ...args) {
            if (this._signals[signal]) {
                this._signals[signal](this, ...args);
            }
        },

        disconnect: vi.fn(),
    };

    // -----------------------------
    // DISPLAY
    // -----------------------------
    const display = {
        _signals: {},

        _currentMonitor: 0,
        get_current_monitor() {
            return this._currentMonitor;
        },
        set_current_monitor(m) {
            this._currentMonitor = m;
        },

        get_focus_window: () => null,
        sort_windows_by_stacking: (ws) => ws,

        connect: vi.fn(function (signal, handler) {
            this._signals[signal] = handler;
            return 555;
        }),

        emit: function (signal, ...args) {
            const win = args[0];

            if (signal === 'window-created' && win) {
                let ws =
                    typeof win.get_workspace === 'function'
                        ? win.get_workspace()
                        : null;

                if (!ws) {
                    ws = workspace_manager.get_workspace_by_index(0);
                }

                if (ws && !Array.isArray(ws.windows)) {
                    ws.windows = [];
                }

                win._workspaceRef = ws;

                if (ws && !ws.windows.includes(win)) {
                    ws.windows.push(win);
                }
            }

            if (signal === 'window-unmanaged' && win) {
                const ws = win._workspaceRef;
                if (ws && Array.isArray(ws.windows)) {
                    ws.windows = ws.windows.filter((w) => w !== win);
                }
            }

            if (this._signals[signal]) {
                this._signals[signal](this, ...args);
            }
        },

        get_tab_list: vi.fn(() => []),
    };

    // -----------------------------
    // MAIN
    // -----------------------------
    const Main = {
        overview: {
            visible: false,
            hide: vi.fn(),
        },
        panel: {
            addToStatusArea: vi.fn(),
        },
        wm: {
            addKeybinding: vi.fn(),
            removeKeybinding: vi.fn(),
        },
    };

    // -----------------------------
    // PANEL MENU
    // -----------------------------
    const PanelMenu = {
        Button: vi.fn(function Button() {
            this._signals = {};

            this.connect = (signal, handler) => {
                this._signals[signal] = handler;
                return 1;
            };

            this.emit = (signal, ...args) => {
                if (this._signals[signal]) {
                    this._signals[signal](this, ...args);
                }
            };

            this.add_child = vi.fn();
            this.clear_actions = vi.fn();
            this.destroy = vi.fn();
            this.reactive = false;
        }),
    };

    // -----------------------------
    // SHELL
    // -----------------------------
    const Shell = {
        ActionMode: {
            NORMAL: 1,
            OVERVIEW: 2,
            POPUP: 4,
        },
    };

    // -----------------------------
    // ST
    // -----------------------------
    const St = {
        Widget: vi.fn(function Widget(props = {}) {
            this.layout_manager = props.layout_manager;
            this.reactive = props.reactive;
            this.add_child = vi.fn();
        }),

        Icon: vi.fn(function Icon(props = {}) {
            this.icon_name = props.icon_name;
            this.style_class = props.style_class;
        }),

        Label: vi.fn(function Label(props = {}) {
            this.visible = props.visible;
            this.text = '';
            this.reactive = props.reactive;
            this.style_class = props.style_class;
        }),
    };

    // -----------------------------
    // CLUTTER
    // -----------------------------
    const Clutter = {
        BinLayout: vi.fn(function BinLayout() {}),
        EVENT_STOP: 1,
        EVENT_PROPAGATE: 2,
    };

    // -----------------------------
    // GLib
    // -----------------------------
    const GLib = {
        PRIORITY_DEFAULT: 0,
        idle_add: vi.fn((_, cb) => {
            cb();
            return 0;
        }),
        SOURCE_REMOVE: 0,
    };

    // -----------------------------
    // META
    // -----------------------------
    const Meta = {
        ...MetaBase,
        KeyBindingFlags: {
            NONE: 0,
            IGNORE_AUTOREPEAT: 1,
        },
    };

    globalThis.log = vi.fn();

    return {
        Meta,
        Main,
        PanelMenu,
        St,
        Clutter,
        GLib,
        Shell,
        workspace_manager,
        display,
        get_current_time: () => Date.now(),
    };
}

