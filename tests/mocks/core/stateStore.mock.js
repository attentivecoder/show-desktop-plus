export const mockStateStoreClear = vi.fn();

export function createMockStateStore() {
    return {
        clear: mockStateStoreClear,
        getWorkspaceMap: vi.fn(),
        setWorkspaceMap: vi.fn(),
        deleteWorkspace: vi.fn(),
        entries: vi.fn(() => []),
        hasWorkspace: vi.fn(),
    };
}
