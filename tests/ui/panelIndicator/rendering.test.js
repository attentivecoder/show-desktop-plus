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

describe('PanelIndicator panel position', () => {
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

        mockWindowManager = {};

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            _settings: {
                get_enum: vi.fn(),
            },
        };

        indicator = new PanelIndicator(
            mockWindowManager,
            {},
            mockExtension,
            g
        );
    });

    const cases = [
        { pos: 0, expectedPos: 'left',   expectedOffset: 0 },
        { pos: 1, expectedPos: 'left',   expectedOffset: 1 },
        { pos: 2, expectedPos: 'center', expectedOffset: 0 },
        { pos: 3, expectedPos: 'right',  expectedOffset: 0 },
        { pos: 4, expectedPos: 'right',  expectedOffset: 1 },
    ];

    cases.forEach(({ pos, expectedPos, expectedOffset }) => {
        it(`button-position=${pos} → ${expectedPos} (offset ${expectedOffset})`, () => {
            mockExtension._settings.get_enum.mockReturnValue(pos);

            indicator.addToPanel();

            expect(g.Main.panel.addToStatusArea).toHaveBeenCalledTimes(1);

            const call = g.Main.panel.addToStatusArea.mock.calls[0];

            const role = `${mockExtension._extensionName} Indicator`;

            expect(call[0]).toBe(role);
            expect(call[1]).toBe(indicator._panelButton);
            expect(call[2]).toBe(expectedOffset);
            expect(call[3]).toBe(expectedPos);
        });
    });
});

