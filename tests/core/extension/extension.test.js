import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import ShowDesktopPlus from '../../../extension.js';
import ExtensionController from '../../../extensionController.js';

vi.mock('resource:///org/gnome/shell/extensions/extension.js', () => {
    class MockExtension {
        constructor() {}
        getSettings() { return {}; }
    }

    return {
        default: MockExtension,
        Extension: MockExtension,
    };
});

vi.mock('../../../core/gnomeUI.js', () => ({
    loadGnomeUI: vi.fn(async () => createMockGnomeAPI([]))
}));

vi.mock('../../../extensionController.js', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            enable: vi.fn(),
            disable: vi.fn(),
        }))
    };
});

describe('ShowDesktopPlus Extension', () => {
    let ext, gnomeAPI;

    beforeEach(() => {
        gnomeAPI = createMockGnomeAPI([]);

        global.workspace_manager = gnomeAPI.workspace_manager;
        global.display = gnomeAPI.display;
        global.get_current_time = gnomeAPI.get_current_time;
        global.Main = gnomeAPI.Main;
        global.PanelMenu = gnomeAPI.PanelMenu;
        global.St = gnomeAPI.St;
        global.Clutter = gnomeAPI.Clutter;
        global.GLib = gnomeAPI.GLib;
        global.Meta = gnomeAPI.Meta;

        ext = new ShowDesktopPlus();
        ext.metadata = { name: 'ShowDesktopPlus' };
        ext.getSettings = vi.fn(() => ({}));
    });

    test('enable() creates controller and calls enable()', () => {
        ext.enable();

        expect(ExtensionController).toHaveBeenCalledWith(ext);

        const instance = ExtensionController.mock.results[0].value;
        expect(instance.enable).toHaveBeenCalled();

        expect(ext._extensionName).toBe('ShowDesktopPlus');
        expect(ext._settings).toBeDefined();
    });

    test('disable() calls controller.disable() and clears fields', () => {
        ext.enable();

        const instance = ext._controller;

        ext.disable();

        expect(instance.disable).toHaveBeenCalled();
        expect(ext._controller).toBeNull();
        expect(ext._settings).toBeNull();
        expect(ext._extensionName).toBeNull();
    });

    test('disable() works even if enable() was never called', () => {
        const fresh = new ShowDesktopPlus();
        fresh.metadata = { name: 'ShowDesktopPlus' };
        fresh.getSettings = vi.fn(() => ({}));

        expect(() => fresh.disable()).not.toThrow();
        expect(fresh._controller).toBeUndefined();
    });
    
    test('enable() uses fallback name when metadata.name is missing', () => {
        const ext = new ShowDesktopPlus();
        ext.metadata = {};
        ext.getSettings = vi.fn(() => ({}));

        ext.enable();

        expect(ext._extensionName).toBe('Show Desktop Plus');
    });

});

