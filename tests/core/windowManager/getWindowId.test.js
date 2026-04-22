import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createStore } from '../../helpers/factories.js';

describe('WindowManager – _getWindowId', () => {
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

    test('returns null for null or missing get_id', () => {
        expect(wm._getWindowId(null)).toBe(null);
        expect(wm._getWindowId({})).toBe(null);
    });

    test('returns ID when get_id works', () => {
        const w = { get_id: () => 42 };
        expect(wm._getWindowId(w)).toBe(42);
    });

    test('returns null when get_id throws', () => {
        const w = { get_id: () => { throw new Error('boom'); } };
        expect(wm._getWindowId(w)).toBe(null);
    });
});

