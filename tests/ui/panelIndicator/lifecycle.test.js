import { describe, test, expect, beforeEach, vi } from 'vitest';
import PanelIndicator from '../../../core/panelIndicator.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';

describe('PanelIndicator', () => {
    let indicator, store, gnomeUi, windows, extension, wm;

    beforeEach(() => {
        windows = [createWindow(1), createWindow(2)];
        store = createStore();

        gnomeUi = createMockGnomeAPI(windows);

        global.workspace_manager = gnomeUi.workspace_manager;
        global.display = gnomeUi.display;
        global.get_current_time = gnomeUi.get_current_time;

        global.Meta = gnomeUi.Meta;
        global.Clutter = gnomeUi.Clutter;
        global.GLib = gnomeUi.GLib;
        global.Main = gnomeUi.Main;

        extension = {
            _extensionName: 'TestExt',
            metadata: { name: 'TestExt' },
            _settings: {
                get_enum: vi.fn(() => 0),
                get_boolean: vi.fn(() => true),
            },
            openPreferences: vi.fn(),
        };

        wm = {
            getHiddenCountForWorkspace: () => 2,
            toggleDesktop: vi.fn(),
            hideAllWindows: vi.fn(),
            restoreAllWindows: vi.fn(),
            addCurrentWindowToHidden: vi.fn(),
        };

        indicator = new PanelIndicator(
            wm,
            store,
            extension,
            gnomeUi
        );
    });

    test('addToPanel calls Main.panel.addToStatusArea', () => {
        indicator.addToPanel();
        expect(gnomeUi.Main.panel.addToStatusArea).toHaveBeenCalled();
    });

    test('removeFromPanel destroys the button', () => {
        indicator.addToPanel();
        const button = gnomeUi.PanelMenu.Button.mock.results[0].value;

        // FIX: PanelIndicator uses destroy(), not removeFromPanel()
        indicator.destroy();

        expect(button.destroy).toHaveBeenCalled();
    });

    test('updateIcon sets correct icon and badge', () => {
        indicator.addToPanel();
        indicator.updateIcon();

        expect(indicator._panelIcon.icon_name).toBe('user-desktop-symbolic');
        expect(indicator._panelBadge.visible).toBe(true);
        expect(indicator._panelBadge.text).toBe('2');
    });
});

