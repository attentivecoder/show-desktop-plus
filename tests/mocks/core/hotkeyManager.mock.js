export const mockHotkeyEnable = vi.fn();
export const mockHotkeyDisable = vi.fn();

export function createMockHotkeyManager() {
    return {
        enable: mockHotkeyEnable,
        disable: mockHotkeyDisable,
    };
}

