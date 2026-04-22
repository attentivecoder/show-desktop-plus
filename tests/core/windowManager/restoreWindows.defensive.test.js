import { describe, it, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import StateStore from '../../../core/stateStore.js';

describe('WindowManager – restoreAllWindows defensive behavior', () => {
    let wm, state, mockWorkspace, mockDisplay, mockWorkspaceManager, mockMain;

    beforeEach(() => {
        state = new StateStore();

        mockWorkspace = {
            index: () => 0,
            list_windows: vi.fn(),
        };

        mockWorkspaceManager = {
            get_active_workspace: () => mockWorkspace,
        };

        mockDisplay = {
            get_focus_window: () => null,
            connect: vi.fn(() => 1),
            disconnect: vi.fn(),
        };

        mockMain = {
            overview: { visible: false, hide: vi.fn() },
        };

        wm = new WindowManager(
            state,
            { _settings: { get_boolean: () => false } },
            () => {},
            {
                Meta: { WindowType: { NORMAL: 0 } },
                Main: mockMain,
                workspace_manager: mockWorkspaceManager,
                display: mockDisplay,
                get_current_time: () => 123,
            }
        );
    });

    it('skips windows whose unminimize throws', () => {
        const badWin = {
            get_id: () => 1,
            unminimize: () => { throw new Error('boom') },
            activate: vi.fn(),
        };

        const goodWin = {
            get_id: () => 2,
            unminimize: vi.fn(),
            activate: vi.fn(),
        };

        mockWorkspace.list_windows.mockReturnValue([badWin, goodWin]);

        state.setWorkspaceMap(0, new Map([[-1, [1, 2]]]));

        expect(() => wm.restoreAllWindows()).not.toThrow();

        expect(goodWin.unminimize).toHaveBeenCalled();
        expect(goodWin.activate).toHaveBeenCalled();
        expect(badWin.activate).not.toHaveBeenCalled();
    });

    it('does not crash if activate throws', () => {
        const win = {
            get_id: () => 1,
            unminimize: vi.fn(),
            activate: () => { throw new Error('boom') },
        };

        mockWorkspace.list_windows.mockReturnValue([win]);
        state.setWorkspaceMap(0, new Map([[-1, [1]]]));

        expect(() => wm.restoreAllWindows()).not.toThrow();
    });

    it('activates only the last successfully restored window', () => {
        const w1 = {
            get_id: () => 1,
            unminimize: vi.fn(),
            activate: vi.fn(),
        };

        const w2 = {
            get_id: () => 2,
            unminimize: vi.fn(),
            activate: vi.fn(),
        };

        mockWorkspace.list_windows.mockReturnValue([w1, w2]);
        state.setWorkspaceMap(0, new Map([[-1, [1, 2]]]));

        wm.restoreAllWindows();

        expect(w1.activate).not.toHaveBeenCalled();
        expect(w2.activate).toHaveBeenCalled();
    });

    it('clears workspace state after restoring', () => {
        const win = {
            get_id: () => 1,
            unminimize: vi.fn(),
            activate: vi.fn(),
        };

        mockWorkspace.list_windows.mockReturnValue([win]);
        state.setWorkspaceMap(0, new Map([[-1, [1]]]));

        wm.restoreAllWindows();

        expect(state.getWorkspaceMap(0)).toBeUndefined();
    });
});

