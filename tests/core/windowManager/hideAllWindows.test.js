import { describe, test, expect, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';

describe('Action: hideAllWindows', () => {
    let wm, store, gnome, windows;

    beforeEach(() => {
        windows = [
            createWindow(1),
            createWindow(2),
            createWindow(3, { skip_taskbar: true }),
        ];

        gnome = createMockGnomeAPI(windows);
        store = createStore();

        wm = new WindowManager(
            store,
            { _settings: { get_boolean: () => false } },
            () => {},
            gnome
        );
    });

    test('hides all normal windows', () => {
        wm.hideAllWindows();

        const map = store.getWorkspaceMap(0);
        const list = [...map.values()][0];

        expect(list).toEqual([1, 2]); // skip-taskbar ignored
        expect(windows[0].minimize).toHaveBeenCalled();
        expect(windows[1].minimize).toHaveBeenCalled();
        expect(windows[2].minimize).not.toHaveBeenCalled();
    });

    test('does nothing if no windows to hide', () => {
        gnome.workspace_manager.get_active_workspace = () => ({
            index: () => 0,
            list_windows: () => [],
        });

        wm.hideAllWindows();
        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });
});

