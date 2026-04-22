import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import PanelIndicator from '../../../core/panelIndicator.js';

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

