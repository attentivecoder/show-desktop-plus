import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';

describe('WindowManager – non-window focus safety', () => {
    it('does not crash when focus window is not a Meta.Window', () => {
        const store = new StateStore();
        const onStateChanged = vi.fn();

        const gnome = {
            Meta: { WindowType: { NORMAL: 0 } },
            Main: { overview: { visible: false, hide: vi.fn() } },
            workspace_manager: {
                get_active_workspace: () => ({
                    index: () => 0,
                    list_windows: () => [],   // <-- required
                }),
            },
            display: {
                get_focus_window: () => ({}), // <-- non-window object
                get_current_monitor: () => 0,
                sort_windows_by_stacking: ws => ws,
            },
            get_current_time: () => 123,
        };

        const wm = new WindowManager(
            store,
            { _settings: { get_boolean: () => false } },
            onStateChanged,
            gnome
        );

        expect(() => wm.addCurrentWindowToHidden()).not.toThrow();
        expect(() => wm.hideAllWindows()).not.toThrow();
        expect(() => wm.restoreAllWindows()).not.toThrow();
        expect(() => wm.toggleDesktop()).not.toThrow();
    });
});

