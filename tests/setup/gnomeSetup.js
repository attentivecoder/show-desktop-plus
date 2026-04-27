import { createMockGnomeAPI } from '../mocks/gnome/gnome.js';

const gnome = createMockGnomeAPI();

globalThis.__GNOME__ = gnome;

globalThis.get_display = () => gnome.display;
globalThis.get_workspace_manager = () => gnome.workspace_manager;
globalThis.get_current_time = () => Date.now();

globalThis.St = gnome.St;
globalThis.Clutter = gnome.Clutter;
globalThis.Meta = gnome.Meta;
globalThis.Main = gnome.Main;
