import { vi } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

const windows = [];

vi.mock('../../../core/gnomeUi.js', () => ({
    loadGnomeUi: () => createMockGnomeAPI(windows),
}));

// ------------------------------------------------------------
// Now import the rest of the test dependencies
// ------------------------------------------------------------
import { describe, test, expect, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockWindow } from '../../mocks/gnome/window.js';
import { createStore } from '../../helpers/factories.js';

describe('Window lifecycle events', () => {
    let wm, store, gnomeAPI, extension, updateSpy;

    beforeEach(() => {
        store = createStore();
        gnomeAPI = createMockGnomeAPI([]);

        extension = {
            _settings: {
                get_boolean: vi.fn(() => false),
                get_enum: vi.fn(() => 0),
            }
        };

        updateSpy = vi.fn();

        wm = new WindowManager(store, extension, updateSpy, gnomeAPI);
         wm.enable(); 
    });

    test('window-created triggers updateIcon', () => {
        const win = createMockWindow(1);

        gnomeAPI.display.emit('window-created', win);

        expect(updateSpy).toHaveBeenCalled();
    });

    test('window-unmanaged removes window from hidden list', () => {
        const win = createMockWindow(1);

        const map = new Map();
        map.set(-1, [win.get_id()]);
        store.setWorkspaceMap(0, map);

        gnomeAPI.display.emit('window-unmanaged', win);

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

