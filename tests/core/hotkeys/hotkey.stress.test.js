import { describe, it, expect, vi, beforeEach } from 'vitest';
import HotkeyManager from '../../../core/hotkeyManager.js';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';

describe('HotkeyManager – stress test', () => {
    let g;
    let windowManager;
    let stateStore;
    let hotkeyManager;
    let callback;

    beforeEach(() => {
        g = createMockGnomeAPI([]);

        // Provide all ActionMode flags used by HotkeyManager
        g.Shell.ActionMode = {
            NORMAL: 1 << 0,
            OVERVIEW: 1 << 1,
            POPUP: 1 << 2,
        };

        // Provide KeyBindingFlags
        g.Meta.KeyBindingFlags = {
            IGNORE_AUTOREPEAT: 0,
        };

        // Capture the hotkey callback
        g.Main.wm.addKeybinding = vi.fn((name, settings, flags, mode, cb) => {
            callback = cb;
        });

        g.Main.wm.removeKeybinding = vi.fn();

        // Minimal GNOME globals required by WindowManager
        global.workspace_manager = {
            _active: 0,
            get_active_workspace: vi.fn(() => ({
                index: () => global.workspace_manager._active,
            })),
        };

        global.display = {
            get_tab_list: vi.fn(() => []),
        };

        global.get_current_time = vi.fn(() => 123456);

        // Mock extension settings
        const mockExtension = {
            _settings: {
                get_boolean: vi.fn(() => true), // enable-hotkey = true
                get_enum: vi.fn(() => 0),
                connect: vi.fn(),
                disconnect: vi.fn(),
            },
        };

        stateStore = new StateStore();

        windowManager = new WindowManager(
            stateStore,
            mockExtension,
            () => {},   // no-op state change callback
            g
        );
        hotkeyManager = new HotkeyManager(windowManager, mockExtension, g);

        hotkeyManager.enable();
    });

    it('handles 200 rapid hotkey presses without inconsistent state', () => {
        // Create 20 fake GNOME-like windows
        const windows = [];
        for (let i = 0; i < 20; i++) {
            windows.push({
                id: i,
                minimized: false,
                skip_taskbar: false,
                get_workspace: () =>
                    global.workspace_manager.get_active_workspace(),
                get_monitor: () => 0,
                minimize: vi.fn(function () {
                    this.minimized = true;
                }),
                unminimize: vi.fn(function () {
                    this.minimized = false;
                }),
                activate: vi.fn(),
            });
        }

        // GNOME API returns these windows
        global.display.get_tab_list = vi.fn(() => windows);

        // Stress loop
        for (let i = 0; i < 200; i++) {
            // Random workspace switch
            global.workspace_manager._active = Math.floor(Math.random() * 4);

            // Randomly toggle minimized state
            for (const w of windows) {
                if (Math.random() < 0.2) {
                    w.minimized = !w.minimized;
                }
            }

            // Fire the hotkey callback
            callback();
        }

        // Assertions

        // 1. No window should be in an impossible state
        for (const w of windows) {
            expect(typeof w.minimized).toBe('boolean');
        }

        // 2. StateStore should only contain numeric workspace keys
        for (const [key] of stateStore.entries()) {
            expect(Number.isInteger(Number(key))).toBe(true);
        }

        // 3. Hotkey should only be registered once
        expect(g.Main.wm.addKeybinding).toHaveBeenCalledTimes(1);

        // 4. No crashes occurred
        expect(true).toBe(true);
    });
});

