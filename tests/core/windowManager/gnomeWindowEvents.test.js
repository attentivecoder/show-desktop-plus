import { vi } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

const windows = [];

vi.mock('../../../core/gnomeUI.js', () => ({
    loadGnomeUi: () => createMockGnomeAPI(windows),
}));

import { describe, test, expect, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockWindow } from '../../mocks/gnome/window.js';
import { createStore } from '../../helpers/factories.js';

describe('Window lifecycle events', () => {
    let wm, store, gnomeAPI, extension, updateSpy;

    beforeEach(() => {
        store = createStore();
        gnomeAPI = createMockGnomeAPI([]);

        globalThis.global = gnomeAPI;
        globalThis.display = gnomeAPI.display;
        globalThis.workspace_manager = gnomeAPI.workspace_manager;
        globalThis.get_workspace_manager = () => gnomeAPI.workspace_manager;
        globalThis.Meta = gnomeAPI.Meta;
        globalThis.Main = gnomeAPI.Main;
        globalThis.get_current_time = gnomeAPI.get_current_time;

        extension = {
            _settings: {
                get_boolean: vi.fn(() => false),
                get_enum: vi.fn(() => 0),
            }
        };

        updateSpy = vi.fn();

        wm = new WindowManager(store, extension, updateSpy, gnomeAPI);
    });

    test('window-created triggers updateIcon', () => {
        const win = createMockWindow(1);

        gnomeAPI.display.emit('window-created', win);

        expect(updateSpy).toHaveBeenCalled();
    });

    test('window-unmanaged removes window from hidden list', () => {
        const win = createMockWindow(1);

        // Put window into hidden state for workspace 0
        const map = new Map();
        map.set(-1, [win.get_id()]);
        store.setWorkspaceMap(0, map);

        // Make WindowManager track this window
        gnomeAPI.display.emit('window-created', win);

        // Now simulate the window being unmanaged
        win.emit('unmanaged');

        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });

    test('minimize event triggers updateIcon', () => {
        const win = createMockWindow(1);

        gnomeAPI.display.emit('window-created', win);
        win.minimize();

        expect(updateSpy).toHaveBeenCalled();
    });

    test('unminimize event triggers updateIcon', () => {
        const win = createMockWindow(1, 0, { minimized: true });

        gnomeAPI.display.emit('window-created', win);
        win.unminimize();

        expect(updateSpy).toHaveBeenCalled();
    });

    test('workspace change triggers updateIcon', () => {
        const win = createMockWindow(1);

        gnomeAPI.display.emit('window-created', win);
        win.change_workspace(2);

        expect(updateSpy).toHaveBeenCalled();
    });

    test('destroy event cleans up hidden windows', () => {
        const win = createMockWindow(1);

        const map = new Map();
        map.set(-1, [win.get_id()]);
        store.setWorkspaceMap(0, map);

        gnomeAPI.display.emit('window-created', win);
        win.destroy();

        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });
});

