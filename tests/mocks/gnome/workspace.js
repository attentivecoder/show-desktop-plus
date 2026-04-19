export function createMockWorkspace(index, windows = []) {
    return {
        index: () => index,
        windows,
        list_windows: () => windows,
    };
}
