import { describe, it, expect, vi, beforeEach } from 'vitest';
import PanelIndicator from '../../../core/panelIndicator.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

describe('PanelIndicator – right‑click behavior (preferences)', () => {
    let indicator;
    let mockWindowManager;
    let mockExtension;
    let g;
    let clickHandler;

    beforeEach(() => {
        g = createMockGnomeAPI([]);

        g.PanelMenu.Button = vi.fn(function () {
            this.connect = vi.fn((signal, handler) => {
                if (signal === 'button-release-event') clickHandler = handler;
                return 1;
            });
            this.add_child = vi.fn();
            this.clear_actions = vi.fn();
            this.destroy = vi.fn();
            this.reactive = true;
        });

        global.workspace_manager = {
            get_active_workspace: vi.fn(() => ({ index: () => 0 })),
        };

        global.display = {
            get_tab_list: vi.fn(() => []),
        };

        global.get_current_time = vi.fn(() => 123456);

        g.Meta.TabList = { NORMAL_ALL: 0 };

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

        indicator._createPanelButton();
    });

    const clickRight = () =>
        clickHandler(null, { get_button: () => 3 });
        
        
    function withWindow(win) {
        win.connect = vi.fn(() => 1);
        win.disconnect = vi.fn();
        return win;
    }

    it('right-click: opens preferences when no prefs window exists', () => {
        global.display.get_tab_list.mockReturnValue([]);

        clickRight();

        expect(mockExtension.openPreferences).toHaveBeenCalledTimes(1);
        expect(indicator._prefsOpenedByExtension).toBe(true);
    });

    it('right-click: focuses preferences when already open', () => {
        const prefsWin = withWindow({
            get_title: () => 'show-desktop-plus Preferences',
            get_wm_class: () => 'org.gnome.Shell.Extensions',
            get_workspace: vi.fn(() => global.workspace_manager.get_active_workspace()),
            change_workspace: vi.fn(),
            activate: vi.fn(),
        });

        global.display.get_tab_list.mockReturnValue([prefsWin]);

        clickRight();

        expect(prefsWin.activate).toHaveBeenCalledTimes(1);
        expect(prefsWin.change_workspace).not.toHaveBeenCalled();
        expect(mockExtension.openPreferences).not.toHaveBeenCalled();
    });

    it('right-click does NOT trigger left-click actions', () => {
        clickRight();

        expect(mockWindowManager.hideAllWindows).not.toHaveBeenCalled();
        expect(mockWindowManager.restoreAllWindows).not.toHaveBeenCalled();
        expect(mockWindowManager.toggleDesktop).not.toHaveBeenCalled();
        expect(mockWindowManager.addCurrentWindowToHidden).not.toHaveBeenCalled();
    });
});

