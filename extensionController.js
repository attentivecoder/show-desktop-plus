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
            this._gnomeUI = await loadGnomeUI();

            this._windowManager = new WindowManager(
                this._stateStore,
                this._extension,
                // Stryker disable next-line OptionalChaining
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

            this._panelIndicator.addToPanel();
            this._hotkeyManager.enable();

            this._workspaceSignal = global.get_workspace_manager().connect(
                // Stryker disable next-line StringLiteral
                'active-workspace-changed',
                () => this._panelIndicator.updateIcon()
            );

            this._connectSettings();
            this._panelIndicator.updateIcon();
    } 
    

    disable() {
        // Stryker disable next-line ConditionalExpression
        if (this._workspaceSignal) {
            global.workspace_manager.disconnect(this._workspaceSignal);
            this._workspaceSignal = null;
        }

        for (const id of this._settingsSignals) {
            this._extension._settings.disconnect(id);
        }
        // Stryker disable next-line ArrayDeclaration
        this._settingsSignals = [];
        

        this._hotkeyManager?.disable();
        this._hotkeyManager = null;

        this._windowManager?.disable?.();
        this._windowManager = null;

        // Stryker disable next-line OptionalChaining
        this._panelIndicator?.destroy?.();
        this._panelIndicator = null;

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
            this._panelIndicator.destroy();
            this._panelIndicator.addToPanel();
            this._panelIndicator.updateIcon();
        });
    }
}

