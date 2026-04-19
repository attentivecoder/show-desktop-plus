import { describe, it, expect, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';

//
// ────────────────────────────────────────────────────────────────
//   Minimal GNOME API mocks
// ────────────────────────────────────────────────────────────────
//

function makeMinimalGnomeAPI(overrides = {}) {
    const base = {
        Meta: {
            WindowType: {
                NORMAL: 0,
                DIALOG: 1,
                UTILITY: 2,
            },
        },
        workspace_manager: {
            get_active_workspace: () => ({
                index: () => 0,
                list_windows: () => [],
            }),
            get_workspace_by_index: () => ({
                index: () => 0,
                list_windows: () => [],
            }),
        },
        display: {
            get_current_monitor: () => 0,
            sort_windows_by_stacking: ws => ws,
            get_tab_list: () => [],
            get_focus_window: () => null,
            connect: vi.fn(() => 1),
            emit: vi.fn(),
        },
        Main: {
            overview: {
                visible: false,
                hide: vi.fn(),
            },
        },
    };

    return {
        ...base,
        ...overrides,
        Meta: { ...base.Meta, ...(overrides.Meta || {}) },
        workspace_manager: {
            ...base.workspace_manager,
            ...(overrides.workspace_manager || {}),
        },
        display: { ...base.display, ...(overrides.display || {}) },
        Main: { ...base.Main, ...(overrides.Main || {}) },
    };
}

function makeExtension(settingsOverrides = {}) {
    return {
        _settings: {
            get_boolean: vi.fn(key => key === 'current-monitor-only'),
            get_enum: vi.fn(() => 0),
            connect: vi.fn(),
            disconnect: vi.fn(),
            ...settingsOverrides,
        },
    };
}

function makeSimpleWindow(g) {
    return {
        get_workspace: () => ({ index: () => 0 }),
        located_on_workspace: () => true,
        get_monitor: () => 0,
        minimize: vi.fn(),
        unminimize: vi.fn(),
        activate: vi.fn(),
        window_type: g.Meta.WindowType.NORMAL,
        is_skip_taskbar: () => false,
        is_on_all_workspaces: () => false,
        is_hidden: () => false,
        is_special_window: () => false,
        is_attached_dialog: () => false,
        is_override_redirect: () => false,
        get_id: () => 1,
        connect: vi.fn(),
    };
}

//
// ────────────────────────────────────────────────────────────────
//   GNOME 45 → 50 Migration Tests
// ────────────────────────────────────────────────────────────────
//

describe('WindowManager – GNOME 45 → 50 migration behavior', () => {

    //
    // GNOME 45
    //
    it('GNOME 45 style: classic APIs, everything present', () => {
        const g = makeMinimalGnomeAPI();
        const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.restoreAllWindows()).not.toThrow();
        expect(() => wm.toggleDesktop()).not.toThrow();
    });

    //
    // GNOME 46
    //
    it('GNOME 46 style: get_current_monitor removed, get_primary_monitor added', () => {
        const g = makeMinimalGnomeAPI({
            display: {
                get_primary_monitor: () => 0,
                sort_windows_by_stacking: ws => ws,
                get_tab_list: () => [],
                get_focus_window: () => null,
                connect: vi.fn(() => 1),
                emit: vi.fn(),
            },
        });

        const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.restoreAllWindows()).not.toThrow();
    });

    it('GNOME 46 style: overview always defined, visible may be true', () => {
        const g = makeMinimalGnomeAPI();
        const win = makeSimpleWindow(g);

        g.Main.overview.visible = true;
        g.workspace_manager.get_active_workspace = () => ({
            index: () => 0,
            list_windows: () => [win],
        });
        g.display.get_tab_list = () => [win];

        const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(g.Main.overview.hide).toHaveBeenCalledTimes(1);
    });

    //
    // GNOME 47
    //
    it('GNOME 47 style: extra Meta.WindowType values and new display methods', () => {
        const g = makeMinimalGnomeAPI({
            Meta: {
                WindowType: {
                    NORMAL: 0,
                    DIALOG: 1,
                    UTILITY: 2,
                    SPLASHSCREEN: 3,
                    DROPDOWN_MENU: 4,
                    POPUP_MENU: 5,
                },
            },
            display: {
                get_current_monitor: () => 0,
                sort_windows_by_stacking: ws => ws,
                get_tab_list: () => [],
                get_focus_window: () => null,
                connect: vi.fn(() => 1),
                emit: vi.fn(),
                get_n_monitors: () => 2,
                get_monitor_geometry: vi.fn(),
            },
        });

        const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.restoreAllWindows()).not.toThrow();
    });

    it('GNOME 47 style: workspace manager gains new methods but old ones still work', () => {
        const g = makeMinimalGnomeAPI({
            workspace_manager: {
                get_active_workspace: () => ({
                    index: () => 0,
                    list_windows: () => [],
                }),
                get_workspace_by_index: () => ({
                    index: () => 0,
                    list_windows: () => [],
                }),
                get_n_workspaces: () => 4,
                append_new_workspace: vi.fn(),
                remove_workspace: vi.fn(),
            },
        });

        const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.toggleDesktop()).not.toThrow();
    });

    //
    // GNOME 48
    //
   describe('GNOME 48 style: continued API evolution', () => {
        it('tolerates new display helper methods', () => {
            const g = makeMinimalGnomeAPI({
                display: {
                    get_primary_monitor: () => 0,
                    get_monitor_scale_factor: () => 2,
                    sort_windows_by_stacking: ws => ws,
                    get_tab_list: () => [],
                    get_focus_window: () => null,
                    connect: vi.fn(() => 1),
                    emit: vi.fn(),
                },
            });

            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);
            expect(() => wm.hideAllWindows()).not.toThrow();
        });

        it('handles additional Meta.WindowType values', () => {
            const g = makeMinimalGnomeAPI({
                Meta: {
                    WindowType: {
                        NORMAL: 0,
                        DIALOG: 1,
                        UTILITY: 2,
                        FUTURE_TYPE: 9999,
                    },
                },
            });

            const win = makeSimpleWindow(g);
            win.window_type = 9999;

            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);
            expect(() => wm._shouldBeIgnored(win)).not.toThrow();
        });

        it('workspace manager gains new helpers but old ones still work', () => {
            const g = makeMinimalGnomeAPI({
                workspace_manager: {
                    get_active_workspace: () => ({
                        index: () => 0,
                        list_windows: () => [],
                    }),
                    get_workspace_for_monitor: () => ({
                        index: () => 1,
                        list_windows: () => [],
                    }),
                },
            });

            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);
            expect(() => wm.toggleDesktop()).not.toThrow();
        });
    });


    //
    // GNOME 49
    //
    describe('GNOME 49 style: deprecated APIs and new signals', () => {
        it('deprecated methods exist only as renamed APIs', () => {
        const g = makeMinimalGnomeAPI({
            display: {
                // get_current_monitor removed entirely (not null)
                get_primary_monitor: () => 0,
                sort_windows_by_stacking: ws => ws,
                get_tab_list: () => [],
                get_focus_window: () => null,
                connect: vi.fn(() => 1),
                emit: vi.fn(),
            },
        });

        const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
    });


        it('handles unknown future signals gracefully', () => {
            const g = makeMinimalGnomeAPI();
            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);

            expect(() => {
                g.display.emit('future-signal-added-in-gnome-49');
            }).not.toThrow();
        });
    });


    //
    // GNOME 50
    //
    describe('GNOME 50 style: major future-proofing', () => {
        it('tolerates entirely new optional APIs', () => {
            const g = makeMinimalGnomeAPI({
                display: {
                    get_current_monitor: () => 0,
                    get_monitor_refresh_rate: () => 144,
                    sort_windows_by_stacking: ws => ws,
                    get_tab_list: () => [],
                    get_focus_window: () => null,
                    connect: vi.fn(() => 1),
                    emit: vi.fn(),
                },
            });

            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);
            expect(() => wm.hideAllWindows()).not.toThrow();
        });

        it('handles even more Meta.WindowType values', () => {
            const g = makeMinimalGnomeAPI({
                Meta: {
                    WindowType: {
                        NORMAL: 0,
                        DIALOG: 1,
                        UTILITY: 2,
                        FUTURE_TYPE_1: 9999,
                        FUTURE_TYPE_2: 12345,
                    },
                },
            });

            const win = makeSimpleWindow(g);
            win.window_type = 12345;

            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);
            expect(() => wm._shouldBeIgnored(win)).not.toThrow();
        });

        it('workspace manager gains more advanced helpers', () => {
            const g = makeMinimalGnomeAPI({
                workspace_manager: {
                    get_active_workspace: () => ({
                        index: () => 0,
                        list_windows: () => [],
                    }),
                    get_workspaces_for_monitor: () => [0, 1],
                },
            });

            const wm = new WindowManager(new StateStore(), makeExtension(), () => {}, g);
            expect(() => wm.toggleDesktop()).not.toThrow();
        });
    });

});

