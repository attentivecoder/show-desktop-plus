import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import PanelIndicator from '../../../core/panelIndicator.js';

describe('PanelIndicator preferences window behavior', () => {
    let g;
    let mockWindowManager;
    let mockExtension;
    let indicator;

    beforeEach(() => {
        g = createMockGnomeAPI();

        globalThis.St = g.St;
        globalThis.Clutter = g.Clutter;
        globalThis.PanelMenu = g.PanelMenu;
        globalThis.Main = g.Main;
        globalThis.GLib = g.GLib;
        globalThis.Meta = g.Meta;
        globalThis.global = g;
        globalThis.log = vi.fn();

        mockWindowManager = {
            getHiddenCountForWorkspace: () => 0,
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            metadata: { name: 'show-desktop-plus' },
            _settings: {
                get_enum: vi.fn(() => 0),
                get_boolean: vi.fn(() => false),
            },
            openPreferences: vi.fn(),
        };

        indicator = new PanelIndicator(
            mockWindowManager,
            {},
            mockExtension,
            g
        );

        indicator.addToPanel();
    });

    it('opens preferences when no prefs window exists', () => {
        g.display.get_tab_list.mockReturnValue([]);

        indicator._panelButton.emit('button-release-event', {
            get_button: () => 3,
        });

        expect(mockExtension.openPreferences).toHaveBeenCalledTimes(1);
    });

    it('focuses existing prefs window on same workspace', () => {
        const mockWs = g.workspace_manager.get_active_workspace();

        const prefsWin = {
            title: 'show-desktop-plus Preferences',
            get_title: () => 'show-desktop-plus Preferences',
            get_wm_class: () => 'org.gnome.Shell.Extensions',
            get_workspace: () => mockWs,
            activate: vi.fn(),
            change_workspace: vi.fn(),
        };

        g.display.get_tab_list.mockReturnValue([prefsWin]);

        indicator._panelButton.emit('button-release-event', {
            get_button: () => 3,
        });

        expect(prefsWin.change_workspace).not.toHaveBeenCalled();
        expect(prefsWin.activate).toHaveBeenCalledTimes(1);
        expect(mockExtension.openPreferences).not.toHaveBeenCalled();
    });

    it('moves prefs window to current workspace and activates it', () => {
        const mockWsCurrent = g.workspace_manager.get_active_workspace();
        const mockWsOther = { index: () => 1 };

        const prefsWin = {
            title: 'show-desktop-plus Preferences',
            get_title: () => 'show-desktop-plus Preferences',
            get_wm_class: () => 'org.gnome.Shell.Extensions',
            get_workspace: () => mockWsOther,
            activate: vi.fn(),
            change_workspace: vi.fn(),
        };

        g.display.get_tab_list.mockReturnValue([prefsWin]);

        indicator._prefsOpenedByExtension = true;

        indicator._panelButton.emit('button-release-event', {
            get_button: () => 3,
        });

        expect(prefsWin.change_workspace).toHaveBeenCalledWith(mockWsCurrent);
        expect(prefsWin.activate).toHaveBeenCalledTimes(1);
        expect(mockExtension.openPreferences).not.toHaveBeenCalled();
    });
});
