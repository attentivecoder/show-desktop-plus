import { describe, it, expect, vi, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createMockWorkspace } from '../../mocks/gnome/workspace.js';

describe('WindowManager – multi‑monitor behavior', () => {
    let g;
    let stateStore;
    let windowManager;
    let extension;

    let ws0, ws1;
    let winA, winB, winC, winD;

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
            createMockWorkspace(1, []),
        ]);

        ws0 = g.workspace_manager.get_workspace_by_index(0);
        ws1 = g.workspace_manager.get_workspace_by_index(1);

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
        winC = makeWindow(3, ws0, 1);
        winD = makeWindow(4, ws0, 1);

        g.display.emit('window-created', winA);
        g.display.emit('window-created', winB);
        g.display.emit('window-created', winC);
        g.display.emit('window-created', winD);

        g.display.get_tab_list = vi.fn(() => [
            winA, winB, winC, winD
        ]);
    });

    it('hides only windows on the active monitor', () => {
        g.display.set_current_monitor(0);

        windowManager.hideAllWindows();

        expect(winA.minimize).toHaveBeenCalled();
        expect(winB.minimize).toHaveBeenCalled();

        expect(winC.minimize).not.toHaveBeenCalled();
        expect(winD.minimize).not.toHaveBeenCalled();

        const map = stateStore.getWorkspaceMap(0);
        expect(map.get(0).sort()).toEqual([1, 2]);
    });

    it('switching active monitor changes which windows are hidden', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        g.display.set_current_monitor(1);
        windowManager.hideAllWindows();

        const map = stateStore.getWorkspaceMap(0);
        expect(map.get(1).sort()).toEqual([3, 4]);
    });

    it('restoreAllWindows restores only windows hidden on the active monitor', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        g.display.set_current_monitor(1);
        windowManager.hideAllWindows();

        g.display.set_current_monitor(1);
        windowManager.restoreAllWindows();

        expect(winC.unminimize).toHaveBeenCalled();
        expect(winD.unminimize).toHaveBeenCalled();

        expect(winA.unminimize).not.toHaveBeenCalled();
        expect(winB.unminimize).not.toHaveBeenCalled();
    });

    it('hideFocusedWindow hides only the focused window on the active monitor', () => {
        g.display.set_current_monitor(1);
        g.display.get_focus_window = () => winC;

        windowManager.addCurrentWindowToHidden();

        expect(winC.minimize).toHaveBeenCalled();
        expect(winA.minimize).not.toHaveBeenCalled();
        expect(winB.minimize).not.toHaveBeenCalled();
        expect(winD.minimize).not.toHaveBeenCalled();

        const map = stateStore.getWorkspaceMap(0);
        expect(map.get(1)).toEqual([3]);
    });

    it('moving a window between monitors updates hide/restore behavior', () => {
        g.display.set_current_monitor(0);
        windowManager.hideAllWindows();

        winA.get_monitor = () => 1;

        g.display.set_current_monitor(1);
        windowManager.restoreAllWindows();

        expect(winA.unminimize).toHaveBeenCalled();
        expect(winA.activate).not.toHaveBeenCalled();
    });
});

