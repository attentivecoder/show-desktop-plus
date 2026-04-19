import { describe, it, expect, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';

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

describe('WindowManager – GNOME Shell version compatibility', () => {
    it('does not crash with older GNOME (no get_current_monitor)', () => {
        const g = makeMinimalGnomeAPI({
            display: {
                sort_windows_by_stacking: ws => ws,
                get_tab_list: () => [],
                get_focus_window: () => null,
                connect: vi.fn(() => 1),
                emit: vi.fn(),
            },
        });

        const stateStore = new StateStore();
        const extension = makeExtension();

        const wm = new WindowManager(stateStore, extension, () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.restoreAllWindows()).not.toThrow();
        expect(() => wm.toggleDesktop()).not.toThrow();
    });

    it('handles newer GNOME where overview is always defined but visible toggles', () => {
        const fakeWindow = {
            get_workspace: () => ({ index: () => 0 }),
            located_on_workspace: () => true,
            get_monitor: () => 0,
            minimize: vi.fn(),
            window_type: 0,
            is_skip_taskbar: () => false,
            is_on_all_workspaces: () => false,
            is_hidden: () => false,
            is_special_window: () => false,
            is_attached_dialog: () => false,
            is_override_redirect: () => false,
            get_id: () => 1,
            connect: vi.fn(),
        };

        const g = makeMinimalGnomeAPI({
            Main: {
                overview: {
                    visible: true,
                    hide: vi.fn(),
                },
            },
            workspace_manager: {
                get_active_workspace: () => ({
                    index: () => 0,
                    list_windows: () => [fakeWindow],
                }),
                get_workspace_by_index: () => ({
                    index: () => 0,
                    list_windows: () => [fakeWindow],
                }),
            },
            display: {
                get_current_monitor: () => 0,
                sort_windows_by_stacking: ws => ws,
                get_tab_list: () => [fakeWindow],
                get_focus_window: () => null,
                connect: vi.fn(() => 1),
                emit: vi.fn(),
            },
        });

        const stateStore = new StateStore();
        const extension = makeExtension();
        const wm = new WindowManager(stateStore, extension, () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(g.Main.overview.hide).toHaveBeenCalledTimes(1);
    });

    it('tolerates missing overview object (GNOME API change)', () => {
        const g = makeMinimalGnomeAPI({
            Main: {}, // no overview
        });

        const stateStore = new StateStore();
        const extension = makeExtension();
        const wm = new WindowManager(stateStore, extension, () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.restoreAllWindows()).not.toThrow();
    });

    it('handles additional Meta.WindowType values without breaking _shouldBeIgnored', () => {
        const g = makeMinimalGnomeAPI({
            Meta: {
                WindowType: {
                    NORMAL: 0,
                    DIALOG: 1,
                    UTILITY: 2,
                    SPLASHSCREEN: 3,
                    DROPDOWN_MENU: 4,
                },
            },
        });

        const stateStore = new StateStore();
        const extension = makeExtension();
        const wm = new WindowManager(stateStore, extension, () => {}, g);

        expect(() => wm.hideAllWindows()).not.toThrow();
    });

    it('does not crash when display emits unknown signals (future GNOME versions)', () => {
        const g = makeMinimalGnomeAPI();
        const stateStore = new StateStore();
        const extension = makeExtension();
        const wm = new WindowManager(stateStore, extension, () => {}, g);

        expect(() => g.display.emit('random-future-signal', {})).not.toThrow();
        expect(() => wm.hideAllWindows()).not.toThrow();
    });
});

