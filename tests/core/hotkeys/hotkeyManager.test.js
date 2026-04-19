import { describe, test, expect, beforeEach, vi } from 'vitest';
import HotkeyManager from '../../../core/hotkeyManager.js';

describe('HotkeyManager', () => {
    let manager, wm, extension, fakeUi;

    beforeEach(() => {
        wm = {
            toggleDesktop: vi.fn(),
        };

        extension = {
            _settings: {
                get_boolean: vi.fn(() => true), // enable-hotkey = true
            },
        };

        fakeUi = {
            Meta: {
                KeyBindingFlags: { IGNORE_AUTOREPEAT: 1 },
            },
            Shell: {
                ActionMode: {
                    NORMAL: 1,
                    OVERVIEW: 2,
                    POPUP: 4,
                }
            },
            Main: {
                wm: {
                    addKeybinding: vi.fn(),
                    removeKeybinding: vi.fn(),
                }
            }
        };

        manager = new HotkeyManager(wm, extension, fakeUi);
    });

    test('enable() registers the keybinding', () => {
        manager.enable();
        expect(fakeUi.Main.wm.addKeybinding).toHaveBeenCalled();
    });

    test('disable() unregisters the keybinding', () => {
        manager.enable();
        manager.disable();
        expect(fakeUi.Main.wm.removeKeybinding).toHaveBeenCalled();
    });

    test('hotkey triggers toggleDesktop', () => {
        manager.enable();

        const callback = fakeUi.Main.wm.addKeybinding.mock.calls[0][4];
        callback();

        expect(wm.toggleDesktop).toHaveBeenCalled();
    });
});

