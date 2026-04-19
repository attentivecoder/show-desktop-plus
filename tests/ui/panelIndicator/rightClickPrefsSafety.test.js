import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import PanelIndicator from '../../../core/panelIndicator.js';

describe('PanelIndicator – right-click prefs safety', () => {
    let g;
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

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            _settings: {
                get_enum: vi.fn(() => 0),
                get_boolean: vi.fn(() => false),
            },
            openPreferences: vi.fn(),
        };

        indicator = new PanelIndicator(
            {},
            {}, 
            mockExtension,
            g
        );

        indicator.addToPanel();
    });

    it('opens preferences when no valid prefs window exists (weird windows)', () => {
        g.display.get_tab_list.mockReturnValue([
            { title: null },
            { get_title: () => null },
            { get_title: () => 'Firefox' },
            { get_title: () => 'Extensions — GNOME Shell' },
        ]);

        indicator._panelButton.emit('button-release-event', {
            get_button: () => 3,
        });

        expect(mockExtension.openPreferences).toHaveBeenCalledTimes(1);
    });
});

