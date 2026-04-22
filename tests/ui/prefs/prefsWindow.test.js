import { describe, test, expect, vi, beforeEach } from 'vitest';

// --- Mock GTK ---------------------------------------------------------------
vi.mock('gi://Gtk', () => {
    class MockBuilder {
        constructor() {
            this.files = [];
            this.objects = new Map();
        }

        set_translation_domain() {}

        add_from_file(path) {
            this.files.push(path);
        }

        get_object(name) {
            if (!this.objects.has(name)) {
                this.objects.set(name, {
                    add: vi.fn(),
                    set_margin_top: vi.fn(),
                    set_margin_bottom: vi.fn()
                });
            }
            return this.objects.get(name);
        }
    }

    return { default: { Builder: MockBuilder } };
}, { virtual: true });

// --- Mock Gio ---------------------------------------------------------------
vi.mock('gi://Gio', () => ({ default: {} }), { virtual: true });

// --- Mock ExtensionPreferences ----------------------------------------------
vi.mock(
    'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js',
    () => ({
        ExtensionPreferences: class {
            constructor() {
                this.metadata = { 'gettext-domain': 'test-domain' };

                // Directory mock with recursive get_child()
                this.dir = {
                    get_child: (name) => ({
                        get_child: (child) => ({
                            get_path: () => `/fake/${name}/${child}`
                        }),
                        get_path: () => `/fake/${name}`
                    })
                };
            }

            getSettings() {
                return { test: true };
            }
        }
    }),
    { virtual: true }
);


// --- Mock UI initializers ---------------------------------------------------
vi.mock('../../../prefs/ui/panel.js', () => ({ initPanel: vi.fn() }));
vi.mock('../../../prefs/ui/controls.js', () => ({ initControls: vi.fn() }));
vi.mock('../../../prefs/ui/shortcuts.js', () => ({ initShortcuts: vi.fn() }));
vi.mock('../../../prefs/ui/appearance.js', () => ({ initAppearance: vi.fn() }));
vi.mock('../../../prefs/ui/behavior.js', () => ({ initBehavior: vi.fn() }));

// --- Import the real prefs.js ----------------------------------------------
import Prefs from '../../../prefs.js';

import { initPanel } from '../../../prefs/ui/panel.js';
import { initControls } from '../../../prefs/ui/controls.js';
import { initShortcuts } from '../../../prefs/ui/shortcuts.js';
import { initAppearance } from '../../../prefs/ui/appearance.js';
import { initBehavior } from '../../../prefs/ui/behavior.js';

describe('Preferences Window (prefs.js)', () => {
    let prefs;
    let window;

    beforeEach(() => {
        prefs = new Prefs();

        window = {
            set_default_size: vi.fn(),
            add: vi.fn()
        };
    });

    test('fills the preferences window and initializes all UI sections', () => {
        prefs.fillPreferencesWindow(window);

        // Window sizing
        expect(window.set_default_size).toHaveBeenCalledWith(650, 800);

        // UI initializers
        expect(initPanel).toHaveBeenCalled();
        expect(initControls).toHaveBeenCalled();
        expect(initShortcuts).toHaveBeenCalled();
        expect(initAppearance).toHaveBeenCalled();
        expect(initBehavior).toHaveBeenCalled();

        // Window.add() should receive the main page
        expect(window.add).toHaveBeenCalled();
    });
});

