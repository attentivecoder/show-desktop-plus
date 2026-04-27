import { describe, it, expect, vi, beforeEach } from 'vitest';
import PanelIndicator from '../../../core/panelIndicator.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

describe('PanelIndicator – right‑click behavior (preferences)', () => {
    let indicator;
    let mockWindowManager;
    let mockExtension; 
    let g;

    beforeEach(() => {
        g = createMockGnomeAPI([]);

        mockWindowManager = {
            hideAllWindows: vi.fn(),
            restoreAllWindows: vi.fn(),
            addCurrentWindowToHidden: vi.fn(),
            toggleDesktop: vi.fn(),
            getHiddenCountForWorkspace: vi.fn(() => 0),
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            metadata: { name: 'show-desktop-plus' },
            openPreferences: vi.fn(),
            _settings: {
                get_enum: vi.fn(),
                get_boolean: vi.fn(),
            },
        };

        indicator = new PanelIndicator(
            mockWindowManager,
            {},
            mockExtension,
            g
        );
    });

    function withWindow(win) {
        win.connect = vi.fn(() => 1);
        win.disconnect = vi.fn();
        return win;
    }

    it('right-click: opens preferences when no prefs window exists', async () => {
    // PanelIndicator uses g.display.get_window_actors()
    g.display.get_window_actors = vi.fn(() => []);

    await indicator._handlePrefsWindow();

    expect(mockExtension.openPreferences).toHaveBeenCalledTimes(1);
    expect(indicator._prefsOpenedByExtension).toBe(true);
});

it('right-click: focuses preferences when already open', async () => {
    const prefsWin = withWindow({
        get_title: () => 'show-desktop-plus Preferences',
        get_wm_class: () => 'org.gnome.Shell.Extensions',
        get_workspace: vi.fn(() => g.workspace_manager.get_active_workspace()),
        change_workspace: vi.fn(),
        activate: vi.fn(),
    });

    // PanelIndicator uses g.display.get_window_actors()
    g.display.get_window_actors = vi.fn(() => [
        { meta_window: prefsWin },
    ]);

    await indicator._handlePrefsWindow();

    expect(prefsWin.activate).toHaveBeenCalledTimes(1);
    expect(prefsWin.change_workspace).not.toHaveBeenCalled();
    expect(mockExtension.openPreferences).not.toHaveBeenCalled();
});


   it('right-click does NOT trigger left-click actions', async () => {
    g.display.get_window_actors = vi.fn(() => []);

    await indicator._handlePrefsWindow();

    expect(mockWindowManager.hideAllWindows).not.toHaveBeenCalled();
    expect(mockWindowManager.restoreAllWindows).not.toHaveBeenCalled();
    expect(mockWindowManager.toggleDesktop).not.toHaveBeenCalled();
    expect(mockWindowManager.addCurrentWindowToHidden).not.toHaveBeenCalled();
});

});

