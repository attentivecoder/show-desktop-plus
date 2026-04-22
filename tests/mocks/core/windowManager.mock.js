export const mockWMDisable = vi.fn();

export function createMockWindowManager() {
    return {
        disable: mockWMDisable,
        toggleDesktop: vi.fn(),
        hideAllWindows: vi.fn(),
        restoreAllWindows: vi.fn(),
        addCurrentWindowToHidden: vi.fn(),
        getHiddenCountForWorkspace: vi.fn(() => 0),
    };
}

