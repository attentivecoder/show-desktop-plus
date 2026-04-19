import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';

describe('Action: restoreWindows', () => {
    let wm, store, gnome, windows;

    beforeEach(() => {
        windows = [createWindow(1), createWindow(2)];
        windows[1].activate = vi.fn();

        gnome = createMockGnomeAPI(windows);
        store = createStore();

        wm = new WindowManager(
            store,
            { _settings: { get_boolean: () => false } },
            () => {},
            gnome
        );
    });

    test('restores all windows and clears state', () => {
        wm.hideAllWindows();
        wm.restoreAllWindows();

        expect(windows[0].unminimize).toHaveBeenCalled();
        expect(windows[1].unminimize).toHaveBeenCalled();

        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });

    test('activates last restored window', () => {
        wm.hideAllWindows();
        wm.restoreAllWindows();

        expect(windows[1].activate).toHaveBeenCalled();
    });
});

