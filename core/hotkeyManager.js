const HOTKEY_ID = 'show-desktop-hotkey';

export default class HotkeyManager {
    constructor(windowManager, extension, gnomeUI) {
        this._windowManager = windowManager;
        this._extension = extension;
        this._ui = gnomeUI;
        this._isHotkeySet = false;
    }

    enable() {
        const { Meta, Shell, Main } = this._ui;

        const mode =
            Shell.ActionMode.NORMAL |
            Shell.ActionMode.OVERVIEW |
            Shell.ActionMode.POPUP;

        const flag = Meta.KeyBindingFlags.IGNORE_AUTOREPEAT;

        this.disable();

        if (!this._extension._settings.get_boolean('enable-hotkey'))
            return;

        try {
            Main.wm.addKeybinding(
                HOTKEY_ID,
                this._extension._settings,
                flag,
                mode,
                () => this._windowManager.toggleDesktop()
            );

            this._isHotkeySet = true;
        } catch (e) {
            console.error('Failed to add keybinding', e);
            this._isHotkeySet = false;
        }
    }

    disable() {
        const { Main } = this._ui;

        try {
            Main.wm.removeKeybinding(HOTKEY_ID);
        } catch (e) {
            // ignore
        }

        this._isHotkeySet = false;
    }
}

