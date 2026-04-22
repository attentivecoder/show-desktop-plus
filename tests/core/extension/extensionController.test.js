import { describe, test, expect, beforeEach, vi } from 'vitest';
import ExtensionController from '../../../core/extensionController.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

vi.mock('../../../core/gnomeUI.js', () => ({
    loadGnomeUI: vi.fn(), // we’ll control the return value in beforeEach
}));

import { loadGnomeUI } from '../../../core/gnomeUI.js';

describe('ExtensionController (integration)', () => {
    let controller, extension, gnomeAPI, settings;

    beforeEach(() => {
        settings = {
            get_boolean: vi.fn(() => true),
            get_enum: vi.fn(() => 0),
            connect: vi.fn(() => 123),
            disconnect: vi.fn(),
        };

        extension = {
            _extensionName: 'TestExt',
            _settings: settings,
            openPreferences: vi.fn(),
        };

        // Single shared GNOME API instance
        gnomeAPI = createMockGnomeAPI([]);

        // Make sure display + workspace_manager have the methods we rely on
        gnomeAPI.display.disconnect = vi.fn();
        // workspace_manager.connect is already a vi.fn() in the mock, but we rely on get_workspace_manager
        global.workspace_manager = gnomeAPI.workspace_manager;
        global.get_workspace_manager = () => gnomeAPI.workspace_manager;

        global.display = gnomeAPI.display;
        global.get_display = () => gnomeAPI.display;

        global.get_current_time = gnomeAPI.get_current_time;
        global.Main = gnomeAPI.Main;
        global.PanelMenu = gnomeAPI.PanelMenu;
        global.St = gnomeAPI.St;
        global.Clutter = gnomeAPI.Clutter;
        global.GLib = gnomeAPI.GLib;
        global.Meta = gnomeAPI.Meta;

        // Ensure ExtensionController.enable() gets THIS gnomeAPI
        vi.mocked(loadGnomeUI).mockResolvedValue(gnomeAPI);

        controller = new ExtensionController(extension);
    });

    test('enable() wires everything together', async () => {
        await controller.enable();

        const ui = controller._gnomeUI;

        // PanelIndicator added to panel
        expect(ui.Main.panel.addToStatusArea).toHaveBeenCalled();

        // Hotkey enabled
        expect(ui.Main.wm.addKeybinding).toHaveBeenCalled();

        // Workspace signal connected via global.get_workspace_manager()
        expect(global.workspace_manager.connect).toHaveBeenCalled();
    });

    test('disable() unwires everything', async () => {
        await controller.enable();
        controller.disable();

        const ui = controller._gnomeUI;

        // Hotkey disabled
        expect(ui.Main.wm.removeKeybinding).toHaveBeenCalled();

        // PanelIndicator removed
        const panelButton = ui.PanelMenu.Button.mock.results[0].value;
        expect(panelButton.destroy).toHaveBeenCalled();

        // Settings signals disconnected
        expect(settings.disconnect).toHaveBeenCalled();
    });

    test('workspace change triggers icon update', async () => {
        await controller.enable();

        const updateSpy = vi.spyOn(controller._panelIndicator, 'updateIcon');

        // Simulate workspace change (handler passed to workspace_manager.connect)
        const handler = global.workspace_manager.connect.mock.calls[0][1];
        handler();

        expect(updateSpy).toHaveBeenCalled();
    });

    test('settings change triggers icon update', async () => {
        await controller.enable();

        const updateSpy = vi.spyOn(controller._panelIndicator, 'updateIcon');

        // Simulate settings change (first settings.connect callback)
        const callback = settings.connect.mock.calls[0][1];
        callback();

        expect(updateSpy).toHaveBeenCalled();
    });
});

