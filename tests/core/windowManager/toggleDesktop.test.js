import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';

describe('Action: toggleDesktop', () => {
    let wm, store, gnome, windows;

    beforeEach(() => {
        windows = [createWindow(1), createWindow(2)];
        gnome = createMockGnomeAPI(windows);
        store = createStore();

        wm = new WindowManager(
            store,
            { _settings: { get_boolean: () => false } },
            () => {},
            gnome
        );
    });

    test('toggles hide → restore', () => {
        wm.toggleDesktop();
        expect(store.getWorkspaceMap(0)).toBeDefined();

        wm.toggleDesktop();
        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });

    test('restores last focused window', () => {
        windows[1].activate = vi.fn();
        wm.hideAllWindows();
        wm.restoreAllWindows();

        expect(windows[1].activate).toHaveBeenCalled();
    });
});
