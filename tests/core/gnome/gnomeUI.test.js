import { describe, test, expect, vi, beforeEach } from 'vitest';
import { loadGnomeUI } from '../../../core/gnomeUI.js';

describe('gnomeUI – loadGnomeUI', () => {
    beforeEach(() => {
        global.get_display = vi.fn(() => 'DISPLAY');
        global.get_workspace_manager = vi.fn(() => 'WORKSPACES');
        global.get_current_time = vi.fn(() => 12345);

        vi.mock('gi://St', () => ({ default: 'ST' }), { virtual: true });
        vi.mock('gi://Clutter', () => ({ default: 'CLUTTER' }), { virtual: true });
        vi.mock('gi://GLib', () => ({ default: 'GLIB' }), { virtual: true });
        vi.mock('gi://Meta', () => ({ default: 'META' }), { virtual: true });
        vi.mock('gi://Shell', () => ({ default: 'SHELL' }), { virtual: true });

        vi.mock('resource:///org/gnome/shell/ui/main.js', () => ({ default: 'MAIN' }), { virtual: true });
        vi.mock('resource:///org/gnome/shell/ui/panelMenu.js', () => ({ default: 'PANELMENU' }), { virtual: true });
    });

    test('loads GNOME UI modules and returns them', async () => {
        const ui = await loadGnomeUI();

        expect(ui.St).toBe('ST');
        expect(ui.Clutter).toBe('CLUTTER');
        expect(ui.GLib).toBe('GLIB');
        expect(ui.Meta).toBe('META');
        expect(ui.Shell).toBe('SHELL');
        expect(ui.Main.default).toBe('MAIN');
        expect(ui.PanelMenu.default).toBe('PANELMENU');
        expect(ui.display).toBe('DISPLAY');
        expect(ui.workspace_manager).toBe('WORKSPACES');
        expect(ui.get_current_time()).toBe(12345);
    });
});

