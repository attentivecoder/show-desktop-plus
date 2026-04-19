import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';

describe('Action: hideFocusedWindow', () => {
    let wm, store, gnome, windows;

    beforeEach(() => {
        windows = [createWindow(1), createWindow(2)];

        gnome = createMockGnomeAPI(windows);
        store = createStore();

        // Focus window 2
        gnome.display.get_focus_window = () => windows[1];

        wm = new WindowManager(
            store,
            { _settings: { get_boolean: () => false } },
            () => {},
            gnome
        );
    });

    test('hides only the focused window', () => {
        wm.addCurrentWindowToHidden();

        const map = store.getWorkspaceMap(0);
        const list = [...map.values()][0];

        expect(list).toEqual([2]);
        expect(windows[1].minimize).toHaveBeenCalled();
        expect(windows[0].minimize).not.toHaveBeenCalled();
    });

    test('does nothing if no focused window', () => {
        gnome.display.get_focus_window = () => null;

        wm.addCurrentWindowToHidden();
        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });
});

