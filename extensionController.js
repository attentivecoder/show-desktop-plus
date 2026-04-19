import StateStore from './core/stateStore.js';
import WindowManager from './core/windowManager.js';
import PanelIndicator from './core/panelIndicator.js';
import HotkeyManager from './core/hotkeyManager.js';
import { loadGnomeUI } from './core/gnomeUI.js';

export default class ExtensionController {
    constructor(extension) {
        this._extension = extension;

        this._stateStore = new StateStore();

        this._windowManager = null;
        this._panelIndicator = null;
        this._hotkeyManager = null;

        this._gnomeUI = null;

        this._workspaceSignal = null;
        this._settingsSignals = [];
    }

    async enable() {
        // Load GNOME UI first
        this._gnomeUI = await loadGnomeUI();

        // Now construct everything that depends on gnomeUI
        this._windowManager = new WindowManager(
            this._stateStore,
            this._extension,
            () => this._panelIndicator?.updateIcon(),
            this._gnomeUI
        );

        this._panelIndicator = new PanelIndicator(
            this._windowManager,
            this._stateStore,
            this._extension,
            this._gnomeUI
        );

        this._hotkeyManager = new HotkeyManager(
            this._windowManager,
            this._extension,
            this._gnomeUI
        );

        // Add UI
        this._panelIndicator.addToPanel();
        this._hotkeyManager.enable();

        // Workspace change updates icon
        this._workspaceSignal = global.workspace_manager.connect(
            'active-workspace-changed',
            () => this._panelIndicator.updateIcon()
        );

        // Settings change updates icon
        this._connectSettings();

        // Initial icon update
        this._panelIndicator.updateIcon();
    }

    disable() {
        if (this._workspaceSignal) {
            global.workspace_manager.disconnect(this._workspaceSignal);
            this._workspaceSignal = null;
        }

        for (const id of this._settingsSignals) {
            this._extension._settings.disconnect(id);
        }
        this._settingsSignals = [];

        this._hotkeyManager?.disable();
        this._panelIndicator?.removeFromPanel();
        this._stateStore.clear();
    }

    _connectSettings() {
        const connectChanged = (key, callback) => {
            const id = this._extension._settings.connect(`changed::${key}`, callback);
            this._settingsSignals.push(id);
        };

        connectChanged('icon-style', () => this._panelIndicator.updateIcon());
        connectChanged('show-hidden-count', () => this._panelIndicator.updateIcon());
        connectChanged('current-monitor-only', () => this._panelIndicator.updateIcon());
        connectChanged('button-position', () => {
            this._panelIndicator.removeFromPanel();
            this._panelIndicator.addToPanel();
            this._panelIndicator.updateIcon();
        });
    }
}

