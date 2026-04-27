export function createMockWorkspace(index, initialWindows = []) {
    const windows = [...initialWindows];

    return {
        index: () => index,

        list_windows: () => windows,

        get_windows: () => windows,

        add_window(win) {
            windows.push(win);
        },

        remove_window(win) {
            const i = windows.indexOf(win);
            if (i !== -1) windows.splice(i, 1);
        },
    };
}
