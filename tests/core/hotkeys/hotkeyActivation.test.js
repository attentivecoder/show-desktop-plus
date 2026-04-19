import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import HotkeyManager from '../../../core/hotkeyManager.js';

describe('HotkeyManager activation behavior', () => {
    let g;
    let mockWindowManager;
    let mockExtension;
    let hotkeys;

    beforeEach(() => {
        g = createMockGnomeAPI();

        mockWindowManager = {
            toggleDesktop: vi.fn(),
        };

        mockExtension = {
            _settings: {
                get_boolean: vi.fn(key => {
                    if (key === 'enable-hotkey') return true;
                    return false;
                }),
            },
        };

        hotkeys = new HotkeyManager(
            mockWindowManager,
            mockExtension,
            g
        );
    });

    it('registers show-desktop-hotkey and triggers toggleDesktop()', () => {
        hotkeys.enable();

        const call = g.Main.wm.addKeybinding.mock.calls.find(
            c => c[0] === 'show-desktop-hotkey'
        );

        expect(call).toBeTruthy();

        const callback = call[4];

        callback();

        expect(mockWindowManager.toggleDesktop).toHaveBeenCalledTimes(1);
    });

    it('disable() removes the hotkey', () => {
        hotkeys.enable();
        hotkeys.disable();

        expect(g.Main.wm.removeKeybinding).toHaveBeenCalledWith(
            'show-desktop-hotkey'
        );
    });
});

