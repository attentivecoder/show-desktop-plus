import { describe, it, expect, vi, beforeEach } from 'vitest';
import PanelIndicator from '../../../core/panelIndicator.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

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

