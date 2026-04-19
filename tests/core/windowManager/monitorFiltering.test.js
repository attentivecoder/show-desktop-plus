import { describe, test, expect, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';

describe('Action: monitor filtering', () => {
    let wm, store, gnome, windows, extension;

    beforeEach(() => {
        windows = [
            createWindow(1, { monitor: 0 }),
            createWindow(2, { monitor: 1 }),
        ];

        gnome = createMockGnomeAPI(windows);
        store = createStore();

        extension = {
            _settings: {
                get_boolean: (key) => key === 'current-monitor-only',
            }
        };

        wm = new WindowManager(store, extension, () => {}, gnome);
    });

    test('hides only windows on the active monitor when enabled', () => {
        wm.hideAllWindows();

        const map = store.getWorkspaceMap(0);
        const list = [...map.values()][0];

        expect(list).toEqual([1]); // only monitor 0
    });

    test('hides all windows when disabled', () => {
        extension._settings.get_boolean = () => false;

        wm.hideAllWindows();

        const list = [...store.getWorkspaceMap(0).values()][0];
        expect(list).toEqual([1, 2]);
    });
});

