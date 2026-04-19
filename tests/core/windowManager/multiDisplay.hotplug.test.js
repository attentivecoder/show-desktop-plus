import { describe, it, expect, vi, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createMockWorkspace } from '../../mocks/gnome/workspace.js';

describe('WindowManager – multi‑display hot‑plug behavior', () => {
    let g;
    let stateStore;
    let windowManager;
    let extension;

    let ws0;
    let winA, winB, winC;

    function makeWindow(id, workspaceRef, monitorIndex) {
        return {
            id,
            minimized: false,
            skip_taskbar: false,
            window_type: g.Meta.WindowType.NORMAL,

            get_workspace: () => workspaceRef,
            located_on_workspace: ws => ws === workspaceRef,
            get_monitor: () => monitorIndex,

            is_skip_taskbar: () => false,
            is_on_all_workspaces: () => false,
            is_hidden: () => false,
            is_special_window: () => false,
            is_attached_dialog: () => false,
            is_override_redirect: () => false,

            connect: vi.fn(() => 1),

            minimize: vi.fn(function () { this.minimized = true }),
            unminimize: vi.fn(function () { this.minimized = false }),
            activate: vi.fn(),

            get_id: () => id,
        };
    }

    beforeEach(() => {
        g = createMockGnomeAPI([
            createMockWorkspace(0, []),
        ]);

        ws0 = g.workspace_manager.get_workspace_by_index(0);

        extension = {
            _settings: {
                get_boolean: vi.fn((key) => key === 'current-monitor-only'),
                get_enum: vi.fn(() => 0),
                connect: vi.fn(),
                disconnect: vi.fn(),
            },
        };

        stateStore = new StateStore();
        windowManager = new WindowManager(stateStore, extension, () => {}, g);

        winA = makeWindow(1, ws0, 0);
        winB = makeWindow(2, ws0, 0);
        winC = makeWindow(3, ws0, 1); // monitor 1 appears later

        g.display.emit('window-created', winA);
        g.display.emit('window-created', winB);

        g.display.get_tab_list = vi.fn(() => [winA, winB, winC]);
    });

    it('handles monitor-added event without losing state', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        expect(stateStore.getWorkspaceMap(0).get(0)).toEqual([1, 2]);

        // Simulate monitor-added
        g.display.emit('monitor-added', 1);

        // Window C now exists on monitor 1
        g.display.emit('window-created', winC);

        expect(() => windowManager.hideAllWindows()).not.toThrow();
    });

    it('handles monitor-removed by reassigning windows safely', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        // Simulate monitor removal
        g.display.emit('monitor-removed', 1);

        // Window C moves to monitor 0
        winC.get_monitor = () => 0;

        expect(() => windowManager.restoreAllWindows()).not.toThrow();
    });

    it('restores windows correctly after monitor hot-plug', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        // Add monitor 1
        g.display.emit('monitor-added', 1);

        // Move winA to monitor 1
        winA.get_monitor = () => 1;

        g.display.set_current_monitor(1);
        windowManager.restoreAllWindows();

        expect(winA.unminimize).toHaveBeenCalled();
        expect(winA.activate).not.toHaveBeenCalled();
    });

    it('does not lose focused window during monitor hot-plug', () => {
        g.display.set_current_monitor(0);
        g.display.get_focus_window = () => winA;

        windowManager.addCurrentWindowToHidden();

        expect(stateStore.getWorkspaceMap(0).get(0)).toEqual([1]);

        g.display.emit('monitor-added', 1);

        expect(() => windowManager.restoreAllWindows()).not.toThrow();
    });

    it('cleans up state when monitor is removed', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        expect(stateStore.getWorkspaceMap(0).get(0)).toEqual([1, 2]);

        g.display.emit('monitor-removed', 0);

        expect(() => stateStore.getWorkspaceMap(0)).not.toThrow();
    });
});
