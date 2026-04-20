import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import ExtensionController from './extensionController.js';

export default class ShowDesktopPlus extends Extension {
    enable() {
        this._extensionName = this.metadata.name || 'Show Desktop Plus';
        this._settings = this.getSettings();

        this._controller = new ExtensionController(this);
        this._controller.enable();
    }

    disable() {
        if (this._controller) {
            this._controller.disable();
            this._controller = null;
        }

        this._settings = null;
        this._extensionName = null;
    }
}
