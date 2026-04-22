export const mockAddKeybinding = vi.fn();
export const mockRemoveKeybinding = vi.fn();

export async function loadGnomeUI() {
    return {
        Meta: {
            KeyBindingFlags: { IGNORE_AUTOREPEAT: 1 },
            TabList: { NORMAL_ALL: 0 }
        },
        Shell: { ActionMode: { NORMAL: 1, OVERVIEW: 2, POPUP: 4 } },
        Main: {
            wm: {
                addKeybinding: mockAddKeybinding,
                removeKeybinding: mockRemoveKeybinding,
            },
            panel: {
                addToStatusArea: vi.fn(),
            },
        },
        St: {
            Icon: vi.fn(),
            Label: vi.fn(),
            Widget: vi.fn(),
        },
        Clutter: {
            BinLayout: vi.fn(),
            EVENT_STOP: 1,
            EVENT_PROPAGATE: 2,
        },
        GLib: {
            idle_add: vi.fn((_, cb) => { cb(); return 0; }),
            PRIORITY_DEFAULT: 0,
            SOURCE_REMOVE: 0,
        },
    };
}


