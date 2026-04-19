import { describe, it, expect, vi, beforeEach } from 'vitest';
import ExtensionController from '../../../extensionController.js';

vi.mock('../../../core/gnomeUI.js', () => ({
    loadGnomeUI: vi.fn(async () => ({
        Meta: {},
        Shell: {},
        Main: { wm: { addKeybinding: vi.fn(), removeKeybinding: vi.fn() } },
    })),
}));

const mockAddToPanel = vi.fn();
const mockRemoveFromPanel = vi.fn();
const mockUpdateIcon = vi.fn();

vi.mock('../../../core/panelIndicator.js', () => ({
    default: vi.fn().mockImplementation(() => ({
        addToPanel: mockAddToPanel,
        removeFromPanel: mockRemoveFromPanel,
        updateIcon: mockUpdateIcon,
    })),
}));

const mockHotkeyEnable = vi.fn();
const mockHotkeyDisable = vi.fn();

vi.mock('../../../core/hotkeyManager.js', () => ({
    default: vi.fn().mockImplementation(() => ({
        enable: mockHotkeyEnable,
        disable: mockHotkeyDisable,
    })),
}));

const mockStateClear = vi.fn();

vi.mock('../../../core/stateStore.js', () => ({
    default: vi.fn().mockImplementation(() => ({
        clear: mockStateClear,
    })),
}));

vi.mock('../../../core/windowManager.js', () => ({
    default: vi.fn().mockImplementation(() => ({})),
}));

describe('ExtensionController lifecycle', () => {
    let mockExtension;
    let controller;

    beforeEach(() => {
        global.workspace_manager = {
            connect: vi.fn(() => 999),
            disconnect: vi.fn(),
        };

        mockExtension = {
            _extensionName: 'show-desktop-plus',
            _settings: {
                connect: vi.fn(() => 42),
                disconnect: vi.fn(),
                get_enum: vi.fn(),
                get_boolean: vi.fn(),
            },
        };

        mockAddToPanel.mockReset();
        mockRemoveFromPanel.mockReset();
        mockUpdateIcon.mockReset();
        mockHotkeyEnable.mockReset();
        mockHotkeyDisable.mockReset();
        mockStateClear.mockReset();
        mockExtension._settings.connect.mockReset();
        mockExtension._settings.disconnect.mockReset();

        controller = new ExtensionController(mockExtension);
    });


    it('enable() wires everything correctly', async () => {
        await controller.enable();

        expect(mockAddToPanel).toHaveBeenCalledTimes(1);
        expect(mockHotkeyEnable).toHaveBeenCalledTimes(1);
        expect(mockUpdateIcon).toHaveBeenCalledTimes(1);

        expect(global.workspace_manager.connect).toHaveBeenCalledTimes(1);
        expect(mockExtension._settings.connect).toHaveBeenCalledTimes(4);
    });

    it('disable() unwires everything correctly', async () => {
        await controller.enable();

        const id = global.workspace_manager.connect.mock.results[0].value; // 999

        controller.disable();

        expect(global.workspace_manager.disconnect).toHaveBeenCalledWith(id);
        expect(mockExtension._settings.disconnect).toHaveBeenCalledTimes(4);
        expect(mockHotkeyDisable).toHaveBeenCalledTimes(1);
        expect(mockRemoveFromPanel).toHaveBeenCalledTimes(1);
        expect(mockStateClear).toHaveBeenCalledTimes(1);
    });
});

