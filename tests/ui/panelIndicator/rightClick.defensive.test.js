import { describe, it, expect, beforeEach, vi } from 'vitest';
import PanelIndicator from '../../../core/panelIndicator.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

describe('PanelIndicator – right-click defensive behavior', () => {
    let indicator, mockExtension, gnome;

    function simulateRightClick() {
        const event = { get_button: () => 3 };
        indicator._panelButton.emit('button-release-event', event);
    }
    beforeEach(() => {
        gnome = createMockGnomeAPI([]);

        globalThis.global = gnome;

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            _settings: { get_enum: () => 0 },
            openPreferences: vi.fn(),
        };

        indicator = new PanelIndicator(
            {
                toggleDesktop: vi.fn(),
                hideAllWindows: vi.fn(),
                restoreAllWindows: vi.fn(),
                addCurrentWindowToHidden: vi.fn(),
            },
            { getHiddenCountForWorkspace: () => 0 },
            mockExtension,
            gnome
        );

        indicator._createPanelButton();
    });

    it('opens preferences when no prefs window exists', () => {
        gnome.display.get_tab_list.mockReturnValue([]);

        simulateRightClick();

        expect(mockExtension.openPreferences).toHaveBeenCalled();
    });

    it('focuses existing prefs window (get_title)', () => {
        const prefsWin = {
            get_title: () => 'show-desktop-plus Preferences',
            activate: vi.fn(),
            get_workspace: () => gnome.workspace_manager.get_active_workspace(),
            change_workspace: vi.fn(),
        };

        gnome.display.get_tab_list.mockReturnValue([prefsWin]);

        simulateRightClick();

        expect(prefsWin.activate).toHaveBeenCalled();
    });

    it('focuses existing prefs window (.title)', () => {
        const prefsWin = {
            title: 'show-desktop-plus Preferences',
            activate: vi.fn(),
            get_workspace: () => gnome.workspace_manager.get_active_workspace(),
            change_workspace: vi.fn(),
        };

        gnome.display.get_tab_list.mockReturnValue([prefsWin]);

        simulateRightClick();

        expect(prefsWin.activate).toHaveBeenCalled();
    });

    it('falls back to openPreferences() if activate throws', () => {
        const prefsWin = {
            get_title: () => 'show-desktop-plus Preferences',
            activate: () => { throw new Error('boom') },
            get_workspace: () => gnome.workspace_manager.get_active_workspace(),
            change_workspace: vi.fn(),
        };

        gnome.display.get_tab_list.mockReturnValue([prefsWin]);

        simulateRightClick();

        expect(mockExtension.openPreferences).toHaveBeenCalled();
    });
});

