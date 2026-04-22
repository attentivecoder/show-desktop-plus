export function setupGlobalGnome() {
    global.workspace_manager = {
        connect: vi.fn(() => 999),
        disconnect: vi.fn(),
    };

    global.get_workspace_manager = () => global.workspace_manager;

    global.get_current_time = () => Date.now();
}

