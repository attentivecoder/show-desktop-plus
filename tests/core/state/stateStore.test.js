import { describe, test, expect, beforeEach } from 'vitest';
import StateStore from '../../../core/stateStore.js';

describe('StateStore', () => {
    let store;

    beforeEach(() => {
        store = new StateStore();
    });

    test('starts empty', () => {
        expect(store.hasWorkspace(0)).toBe(false);
    });

    test('sets and gets workspace map', () => {
        const map = { foo: 'bar' };
        store.setWorkspaceMap(1, map);

        expect(store.getWorkspaceMap(1)).toBe(map);
    });

    test('deletes workspace', () => {
        store.setWorkspaceMap(2, { a: 1 });
        store.deleteWorkspace(2);

        expect(store.hasWorkspace(2)).toBe(false);
    });

    test('clears all workspaces', () => {
        store.setWorkspaceMap(1, { a: 1 });
        store.setWorkspaceMap(2, { b: 2 });

        store.clear();

        expect(store.hasWorkspace(1)).toBe(false);
        expect(store.hasWorkspace(2)).toBe(false);
    });

    test('entries returns iterator', () => {
        store.setWorkspaceMap(1, { a: 1 });

        const entries = Array.from(store.entries());

        expect(entries.length).toBe(1);
    });
});
