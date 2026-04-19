import { describe, test, expect, beforeEach, vi } from 'vitest';
import ExtensionController from '../../../extensionController.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

vi.mock('../../../core/gnomeUI.js', () => ({
    loadGnomeUI: vi.fn(async () => createMockGnomeAPI([]))
}));

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

        controller = new ExtensionController(extension);
    });

    test('enable() wires everything together', async () => {
        await controller.enable();

        const ui = controller._gnomeUI;

        // PanelIndicator added to panel
        expect(ui.Main.panel.addToStatusArea).toHaveBeenCalled();

        // Hotkey enabled
        expect(ui.Main.wm.addKeybinding).toHaveBeenCalled();

        // Workspace signal connected
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

        // Simulate workspace change
        const handler = global.workspace_manager.connect.mock.calls[0][1];
        handler();

        expect(updateSpy).toHaveBeenCalled();
    });

    test('settings change triggers icon update', async () => {
        await controller.enable();

        const updateSpy = vi.spyOn(controller._panelIndicator, 'updateIcon');

        // Simulate settings change
        const callback = settings.connect.mock.calls[0][1];
        callback();

        expect(updateSpy).toHaveBeenCalled();
    });
});

