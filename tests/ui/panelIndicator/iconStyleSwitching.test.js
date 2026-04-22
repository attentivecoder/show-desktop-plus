import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import PanelIndicator from '../../../core/panelIndicator.js';

describe('PanelIndicator icon-style switching', () => {
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
            getHiddenCountForWorkspace: vi.fn(),
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            _settings: {
                get_enum: vi.fn(),
                get_boolean: vi.fn(() => false),
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

    it('icon-style=0 (auto) → computer-symbolic when no hidden windows', () => {
        mockExtension._settings.get_enum.mockReturnValue(0);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(0);

        indicator.updateIcon();

        expect(indicator._panelIcon.icon_name).toBe('computer-symbolic');
    });

    it('icon-style=0 (auto) → user-desktop-symbolic when hidden windows exist', () => {
        mockExtension._settings.get_enum.mockReturnValue(0);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(3);

        indicator.updateIcon();

        expect(indicator._panelIcon.icon_name).toBe('user-desktop-symbolic');
    });

    it('icon-style=1 → always user-desktop-symbolic', () => {
        mockExtension._settings.get_enum.mockReturnValue(1);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(0);

        indicator.updateIcon();

        expect(indicator._panelIcon.icon_name).toBe('user-desktop-symbolic');
    });

    it('icon-style=2 → always computer-symbolic', () => {
        mockExtension._settings.get_enum.mockReturnValue(2);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(5);

        indicator.updateIcon();

        expect(indicator._panelIcon.icon_name).toBe('computer-symbolic');
    });

    it('icon-style=999 (fallback) → computer-symbolic', () => {
        mockExtension._settings.get_enum.mockReturnValue(999);
        mockWindowManager.getHiddenCountForWorkspace.mockReturnValue(1);

        indicator.updateIcon();

        expect(indicator._panelIcon.icon_name).toBe('computer-symbolic');
    });
});
