import { describe, it, expect, vi, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createMockWorkspace } from '../../mocks/gnome/workspace.js';

describe('WindowManager – workspace session integrity', () => {
    let g;
    let stateStore;
    let windowManager;
    let extension;

    let ws0, ws1;
    let winA, winB, winC;

    function makeWindow(id, workspaceRef) {
        return {
            id,
            minimized: false,
            skip_taskbar: false,
            window_type: g.Meta.WindowType.NORMAL,

            get_workspace: () => workspaceRef,
            located_on_workspace: ws => ws === workspaceRef,
            get_monitor: () => 0,

            is_skip_taskbar: () => false,
            is_on_all_workspaces: () => false,
            is_hidden: () => false,
            is_special_window: () => false,
            is_attached_dialog: () => false,
            is_override_redirect: () => false,

            connect: vi.fn(() => 1),

            minimize: vi.fn(function () { this.minimized = true; }),
            unminimize: vi.fn(function () { this.minimized = false; }),
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
                get_boolean: vi.fn(() => false),
                get_enum: vi.fn(() => 0),
                connect: vi.fn(),
                disconnect: vi.fn(),
            },
        };

        stateStore = new StateStore();
        windowManager = new WindowManager(stateStore, extension, () => {}, g);

        winA = makeWindow(1, ws0);
        winB = makeWindow(2, ws0);
        winC = makeWindow(3, ws1);

        ws0.add_window(winA);
        ws0.add_window(winB);
        ws1.add_window(winC);
    });


    it('tracks hidden windows per workspace independently', () => {
        g.workspace_manager.switch_to(0);
        windowManager.hideAllWindows();

        const map0 = stateStore.getWorkspaceMap(0);
        expect(map0).toBeInstanceOf(Map);
        expect(map0.get(-1).slice().sort()).toEqual([1, 2]);

        expect(stateStore.getWorkspaceMap(1)).toBeUndefined();

        g.workspace_manager.switch_to(1);
        windowManager.hideAllWindows();

        const map1 = stateStore.getWorkspaceMap(1);
        expect(map1).toBeInstanceOf(Map);
        expect(map1.get(-1)).toEqual([3]);

        expect(stateStore.getWorkspaceMap(0).get(-1).slice().sort()).toEqual([1, 2]);
    });

    it('restores windows and activates the last restored window', () => {
        g.workspace_manager.switch_to(0);

        windowManager.hideAllWindows();
        windowManager.restoreAllWindows();

        expect(winA.unminimize).toHaveBeenCalledTimes(1);
        expect(winB.unminimize).toHaveBeenCalledTimes(1);

        expect(winB.activate).toHaveBeenCalledTimes(1);
        expect(winA.activate).not.toHaveBeenCalled();
    });

    it('does not leak hidden windows across workspaces', () => {
        g.workspace_manager.switch_to(0);
        windowManager.hideAllWindows();

        g.workspace_manager.switch_to(1);
        windowManager.hideAllWindows();

        const map0 = stateStore.getWorkspaceMap(0);
        const map1 = stateStore.getWorkspaceMap(1);

        const list0 = map0.get(-1).slice().sort();
        const list1 = map1.get(-1).slice().sort();

        expect(list0).toEqual([1, 2]);
        expect(list1).toEqual([3]);

        for (const id of list0) {
            expect(list1.includes(id)).toBe(false);
        }
    });
});

