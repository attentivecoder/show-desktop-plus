import { vi } from 'vitest';
import { createGlobalMock } from '../mocks/gnome/global.js';

export function setupGnome() {
    global.global = createGlobalMock();

    return {
        reset() {
            global.global = createGlobalMock();
        }
    };
}
