import { describe, test, expect, beforeEach } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createWindow, createStore } from '../../helpers/factories.js';
import { createMockWorkspace } from '../../mocks/gnome/workspace.js';

describe('Action: workspace sessions', () => {
    let wm, store, gnome, ws0, ws1;

    beforeEach(() => {
        ws0 = createMockWorkspace(0, [createWindow(1)]);
        ws1 = createMockWorkspace(1, [createWindow(2)]);

        gnome = createMockGnomeAPI([ws0, ws1]);
        store = createStore();

        wm = new WindowManager(
            store,
            { _settings: { get_boolean: () => false } },
            () => {},
            gnome
        );
    });

    test('hiding on workspace 0 does not affect workspace 1', () => {
        gnome.workspace_manager.get_active_workspace = () => ws0;
        wm.hideAllWindows();

        expect(store.getWorkspaceMap(0)).toBeDefined();
        expect(store.getWorkspaceMap(1)).toBeUndefined();
    });

    test('restoring on workspace 1 does not affect workspace 0', () => {
        // Hide on workspace 0
        gnome.workspace_manager.get_active_workspace = () => ws0;
        wm.hideAllWindows();

        // Switch to workspace 1 and restore
        gnome.workspace_manager.get_active_workspace = () => ws1;
        wm.restoreAllWindows();

        // Only workspace 1 should be cleared
        expect(store.getWorkspaceMap(0)).toBeDefined();
        expect(store.getWorkspaceMap(1)).toBeUndefined();
    });
});

