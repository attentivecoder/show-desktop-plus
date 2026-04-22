import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import PanelIndicator from '../../../core/panelIndicator.js';

describe('PanelIndicator badge visibility', () => {
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

        mockWindowManager = {
            getHiddenCountForWorkspace: vi.fn(() => 0),
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            _settings: {
                get_enum: vi.fn(() => 0),       // icon-style
                get_boolean: vi.fn(() => false) // show-hidden-count
            },
        };

        indicator = new PanelIndicator(
            mockWindowManager,
            {},
            mockExtension,
            g
        );

        indicator.addToPanel();
    });

    it('badge hidden when show-hidden-count = false', () => {
        mockExtension._settings.get_boolean.mockReturnValue(false);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(5);

        indicator.updateIcon();

        expect(indicator._panelBadge.visible).toBe(false);
        expect(indicator._panelBadge.text).toBe('');
    });

    it('badge hidden when count = 0 even if show-hidden-count = true', () => {
        mockExtension._settings.get_boolean.mockReturnValue(true);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(0);

        indicator.updateIcon();

        expect(indicator._panelBadge.visible).toBe(false);
        expect(indicator._panelBadge.text).toBe('');
    });

    it('badge visible with correct count when enabled and count > 0', () => {
        mockExtension._settings.get_boolean.mockReturnValue(true);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(3);

        indicator.updateIcon();

        expect(indicator._panelBadge.visible).toBe(true);
        expect(indicator._panelBadge.text).toBe('3');
    });
});
