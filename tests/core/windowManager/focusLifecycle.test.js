import { describe, test, expect, beforeEach, vi } from 'vitest';
import WindowManager from '../../../core/windowManager.js';
import { createMockGnomeAPI } from '../../mocks/gnome/gnome.js';
import { createMockWindow } from '../../mocks/gnome/window.js';
import { createStore } from '../../helpers/factories.js';

describe('Focus window lifecycle behavior', () => {
    let wm, store, gnomeAPI, extension, updateSpy;

    beforeEach(() => {
        store = createStore();
        gnomeAPI = createMockGnomeAPI([]);

        extension = {
            _settings: {
                get_boolean: vi.fn(() => false),
                get_enum: vi.fn(() => 0),
            }
        };

        updateSpy = vi.fn();

        wm = new WindowManager(store, extension, updateSpy, gnomeAPI);
    });

    test('focused window is hidden when hideFocusedWindow is called', () => {
        const win = createMockWindow(1);

        // Simulate GNOME creating the window
        gnomeAPI.display.emit('window-created', win);

        // Simulate focus
        gnomeAPI.display.get_focus_window = () => win;

        // Call the action
        wm.addCurrentWindowToHidden();

        // Verify window was minimized
        expect(win.minimize).toHaveBeenCalled();

        // Verify state store updated
        const map = store.getWorkspaceMap(0);
        expect(map).toBeDefined();

        const list = map.get(-1);
        expect(list).toContain(win.get_id());

        // Verify UI updated
        expect(updateSpy).toHaveBeenCalled();
    });

    test('changing focus updates which window gets hidden', () => {
        const win1 = createMockWindow(1);
        const win2 = createMockWindow(2);

        // Simulate GNOME creating both windows
        gnomeAPI.display.emit('window-created', win1);
        gnomeAPI.display.emit('window-created', win2);

        // Focus window 1
        gnomeAPI.display.get_focus_window = () => win1;
        wm.addCurrentWindowToHidden();

        // Focus window 2
        gnomeAPI.display.get_focus_window = () => win2;
        wm.addCurrentWindowToHidden();

        const map = store.getWorkspaceMap(0);
        const list = map.get(-1);

        // Both windows should be hidden
        expect(list).toContain(win1.get_id());
        expect(list).toContain(win2.get_id());

        // Both should have been minimized
        expect(win1.minimize).toHaveBeenCalled();
        expect(win2.minimize).toHaveBeenCalled();

        expect(updateSpy).toHaveBeenCalled();
    });

    test('ignored windows are not hidden even if focused', () => {
        const win = createMockWindow(1, 0, { skip_taskbar: true });

        // Simulate GNOME creating the window
        gnomeAPI.display.emit('window-created', win);

        // Simulate focus
        gnomeAPI.display.get_focus_window = () => win;

        wm.addCurrentWindowToHidden();

        // Should NOT minimize
        expect(win.minimize).not.toHaveBeenCalled();

        // Should NOT be added to state
        expect(store.getWorkspaceMap(0)).toBeUndefined();

        // UI DOES update because window-created was emitted
        expect(updateSpy).toHaveBeenCalled();
    });
});

