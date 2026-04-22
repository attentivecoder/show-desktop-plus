export const mockAddToPanel = vi.fn();
export const mockDestroy = vi.fn();
export const mockUpdateIcon = vi.fn();

export function createMockPanelIndicator() {
    return {
        addToPanel: mockAddToPanel,
        destroy: mockDestroy,
        updateIcon: mockUpdateIcon,
    };
}

