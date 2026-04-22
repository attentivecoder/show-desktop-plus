import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createMockWindow } from '../../mocks/gnome/window.js';
import { createStore } from '../../helpers/factories.js';

describe('WindowManager – _resolveWindowById', () => {
    let wm, store, gnomeAPI, extension;

    beforeEach(() => {
        const win = createMockWindow(5);

        store = createStore();
        gnomeAPI = createMockGnomeAPI([win]);

        extension = {
            _settings: {
                get_boolean: vi.fn(() => false),
                get_enum: vi.fn(() => 0),
            }
        };

        wm = new WindowManager(store, extension, () => {}, gnomeAPI);
    });

    test('returns null for falsy ID', () => {
        expect(wm._resolveWindowById(null)).toBe(null);
        expect(wm._resolveWindowById(undefined)).toBe(null);
        expect(wm._resolveWindowById(0)).toBe(null);
    });

    test('finds window by ID', () => {
        const ws = gnomeAPI.workspace_manager.get_active_workspace();
        const win = ws.list_windows()[0];
        const id = win.get_id();

        expect(wm._resolveWindowById(id)).toBe(win);
    });
});

