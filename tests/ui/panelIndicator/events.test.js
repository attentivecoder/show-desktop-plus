import { describe, it, expect, vi, beforeEach } from 'vitest';
import PanelIndicator from '../../../core/panelIndicator.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

describe('PanelIndicator – left‑click behavior', () => {
    let indicator;
    let mockWindowManager;
    let mockExtension;
    let g;
    let clickHandler;

    beforeEach(() => {
        g = createMockGnomeAPI([]);

        const OriginalButton = g.PanelMenu.Button;
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

        mockWindowManager = {
            hideAllWindows: vi.fn(),
            restoreAllWindows: vi.fn(),
            addCurrentWindowToHidden: vi.fn(),
            toggleDesktop: vi.fn(),
            getHiddenCountForWorkspace: vi.fn(() => 0),
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
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

    const clickLeft = () =>
        clickHandler(null, { get_button: () => 1 });

    it('left-click: toggle desktop', () => {
        mockExtension._settings.get_enum.mockReturnValue(0);

        clickLeft();

        expect(mockWindowManager.toggleDesktop).toHaveBeenCalledTimes(1);
    });

    it('left-click: hide all windows', () => {
        mockExtension._settings.get_enum.mockReturnValue(1);

        clickLeft();

        expect(mockWindowManager.hideAllWindows).toHaveBeenCalledTimes(1);
    });

    it('left-click: restore windows', () => {
        mockExtension._settings.get_enum.mockReturnValue(2);

        clickLeft();

        expect(mockWindowManager.restoreAllWindows).toHaveBeenCalledTimes(1);
    });

    it('left-click: hide focused window', () => {
        mockExtension._settings.get_enum.mockReturnValue(3);

        clickLeft();

        expect(mockWindowManager.addCurrentWindowToHidden).toHaveBeenCalledTimes(1);
    });

    it('left-click: none (do nothing)', () => {
        mockExtension._settings.get_enum.mockReturnValue(99);

        clickLeft();

        expect(mockWindowManager.hideAllWindows).not.toHaveBeenCalled();
        expect(mockWindowManager.restoreAllWindows).not.toHaveBeenCalled();
        expect(mockWindowManager.toggleDesktop).not.toHaveBeenCalled();
        expect(mockWindowManager.addCurrentWindowToHidden).not.toHaveBeenCalled();
    });
});

describe('PanelIndicator – middle‑click behavior', () => {
    let indicator;
    let mockWindowManager;
    let mockExtension;
    let g;
    let clickHandler;

    beforeEach(() => {
        g = createMockGnomeAPI([]);

        const OriginalButton = g.PanelMenu.Button;
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

        mockWindowManager = {
            hideAllWindows: vi.fn(),
            restoreAllWindows: vi.fn(),
            addCurrentWindowToHidden: vi.fn(),
            toggleDesktop: vi.fn(),
            getHiddenCountForWorkspace: vi.fn(() => 0),
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
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

    const clickMiddle = () =>
        clickHandler(null, { get_button: () => 2 });

    it('middle-click: hide all windows', () => {
        mockExtension._settings.get_enum.mockReturnValue(0);

        clickMiddle();

        expect(mockWindowManager.hideAllWindows).toHaveBeenCalledTimes(1);
    });

    it('middle-click: hide focused window', () => {
        mockExtension._settings.get_enum.mockReturnValue(1);

        clickMiddle();

        expect(mockWindowManager.addCurrentWindowToHidden).toHaveBeenCalledTimes(1);
    });

    it('middle-click: toggle desktop', () => {
        mockExtension._settings.get_enum.mockReturnValue(2);

        clickMiddle();

        expect(mockWindowManager.toggleDesktop).toHaveBeenCalledTimes(1);
    });

    it('middle-click does NOT trigger left-click actions', () => {
        mockExtension._settings.get_enum.mockReturnValue(0);

        clickMiddle();

        expect(mockWindowManager.restoreAllWindows).not.toHaveBeenCalled();
    });

    it('middle-click does NOT trigger right-click actions', () => {
        mockExtension._settings.get_enum.mockReturnValue(0);

        clickMiddle();

        expect(mockWindowManager.restoreAllWindows).not.toHaveBeenCalled();
    });
});

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

    it('right-click: opens preferences when no prefs window exists', () => {
        global.display.get_tab_list.mockReturnValue([]);

        clickRight();

        expect(mockExtension.openPreferences).toHaveBeenCalledTimes(1);
        expect(indicator._prefsOpenedByExtension).toBe(true);
    });

    it('right-click: focuses preferences when already open', () => {
        const prefsWin = {
            get_title: () => 'show-desktop-plus Preferences',
            get_wm_class: () => 'org.gnome.Shell.Extensions',
            get_workspace: vi.fn(() => global.workspace_manager.get_active_workspace()),
            change_workspace: vi.fn(),
            activate: vi.fn(),
        };

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


describe('PanelIndicator mouse click events', () => {
    let g;
    let mockWindowManager;
    let mockStateStore;
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

        mockWindowManager = {
            toggleDesktop: vi.fn(),
            hideAllWindows: vi.fn(),
            restoreAllWindows: vi.fn(),
            addCurrentWindowToHidden: vi.fn(),
        };

        mockStateStore = {};

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
            mockStateStore,
            mockExtension,
            g
        );

        indicator.addToPanel();
    });

    it('left-click triggers toggleDesktop()', () => {
        indicator._panelButton.emit('button-release-event', {
            get_button: () => 1,
        });

        expect(mockWindowManager.toggleDesktop).toHaveBeenCalledTimes(1);
    });

    it('middle-click triggers hideAllWindows()', () => {
        indicator._panelButton.emit('button-release-event', {
            get_button: () => 2,
        });

        expect(mockWindowManager.hideAllWindows).toHaveBeenCalledTimes(1);
    });

    it('right-click triggers preferences open', () => {
        indicator._panelButton.emit('button-release-event', {
            get_button: () => 3,
        });

        expect(mockExtension.openPreferences).toHaveBeenCalledTimes(1);
    });
});

