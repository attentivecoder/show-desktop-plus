import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExtensionController from '../../../extensionController.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

vi.mock('../../../core/gnomeUI.js', () => ({
    loadGnomeUI: vi.fn(async () => createMockGnomeAPI([]))
}));

describe('ExtensionController – mutation‑driven tests', () => {
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

        // Install GNOME globals exactly like your existing tests
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

    // -------------------------------------------------------------
    // 1. Kill WindowManager → updateIcon callback mutant
    // -------------------------------------------------------------
    it('invokes updateIcon when WindowManager triggers state change', async () => {
        await controller.enable();

        const spy = vi.spyOn(controller._panelIndicator, 'updateIcon');

        // WindowManager stores this callback internally
        controller._windowManager._onStateChanged();

        expect(spy).toHaveBeenCalled();
    });

    // -------------------------------------------------------------
    // 2. Kill settings-change mutants
    // -------------------------------------------------------------
    it('reacts to settings changes by updating the icon', async () => {
        await controller.enable();

        const spy = vi.spyOn(controller._panelIndicator, 'updateIcon');

        // Trigger the callback passed to settings.connect()
        const cb = settings.connect.mock.calls[0][1];
        cb();

        expect(spy).toHaveBeenCalled();
    });

    // -------------------------------------------------------------
    // 3. Kill button-position block mutant
    // -------------------------------------------------------------
    it('rebuilds panel button when button-position changes', async () => {
        await controller.enable();

        const removeSpy = vi.spyOn(controller._panelIndicator, 'removeFromPanel');
        const addSpy = vi.spyOn(controller._panelIndicator, 'addToPanel');

        // Find the callback for button-position
        const cb = settings.connect.mock.calls.find(
            ([signal]) => signal === 'changed::button-position'
        )[1];

        cb();

        expect(removeSpy).toHaveBeenCalled();
        expect(addSpy).toHaveBeenCalled();
    });

    // -------------------------------------------------------------
    // 4. Kill optional-chaining mutants in disable()
    // -------------------------------------------------------------
    it('disable() works even if enable() was never called', () => {
        const fresh = new ExtensionController(extension);
        expect(() => fresh.disable()).not.toThrow();
    });

    // -------------------------------------------------------------
    // 5. Kill array-declaration mutant (disconnect count)
    // -------------------------------------------------------------
    it('disconnects all settings signals on disable()', async () => {
        await controller.enable();

        controller.disable();

        // 4 settings keys → 4 disconnect calls
        expect(settings.disconnect).toHaveBeenCalledTimes(4);
    });

    // -------------------------------------------------------------
    // 6. Kill arrow-function mutants by verifying connect() calls
    // -------------------------------------------------------------
    it('connects all expected settings keys', async () => {
        await controller.enable();

        const calls = settings.connect.mock.calls.map(([signal]) => signal);

        expect(calls).toContain('changed::icon-style');
        expect(calls).toContain('changed::show-hidden-count');
        expect(calls).toContain('changed::current-monitor-only');
        expect(calls).toContain('changed::button-position');
    });
});

