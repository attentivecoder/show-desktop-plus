import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createStore } from '../../helpers/factories.js';

describe('WindowManager – _removeWindowFromState', () => {
    let wm, store, gnomeAPI, extension;

    beforeEach(() => {
        store = createStore();
        gnomeAPI = createMockGnomeAPI([]);

        extension = {
            _settings: {
                get_boolean: vi.fn(() => false),
                get_enum: vi.fn(() => 0),
            }
        };

        wm = new WindowManager(store, extension, () => {}, gnomeAPI);
    });

    test('removes a window ID from lists', () => {
        store.setWorkspaceMap(0, new Map([[-1, [1, 2]]]));

        wm._getWindowId = () => 1;

        wm._removeWindowFromState({});

        expect(store.getWorkspaceMap(0).get(-1)).toEqual([2]);
    });

    test('deletes workspace when empty', () => {
        store.setWorkspaceMap(0, new Map([[-1, [1]]]));

        wm._getWindowId = () => 1;

        wm._removeWindowFromState({});

        expect(store.getWorkspaceMap(0)).toBeUndefined();
    });

});

