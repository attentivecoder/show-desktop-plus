import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createStore } from '../../helpers/factories.js';

describe('WindowManager – _cleanWorkspaceMap', () => {
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

    test('removes keys when all window IDs are invalid', () => {
        wm._resolveWindowById = () => null;

        const map = new Map([[0, [1, 2]]]);
        wm._cleanWorkspaceMap(map);

        expect(map.size).toBe(0);
    });

    test('keeps keys when some window IDs are valid', () => {
        wm._resolveWindowById = id => (id === 1 ? {} : null);

        const map = new Map([[0, [1, 2]]]);
        wm._cleanWorkspaceMap(map);

        expect(map.get(0)).toEqual([1]);
    });
});

