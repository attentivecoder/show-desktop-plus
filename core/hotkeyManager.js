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

        if (this._extension._settings.get_boolean('enable-hotkey')) {
            Main.wm.addKeybinding(
                'show-desktop-hotkey',
                this._extension._settings,
                flag,
                mode,
                () => this._windowManager.toggleDesktop()
            );
            this._isHotkeySet = true;
        }
    }

    disable() {
        const { Main } = this._ui;

        if (this._isHotkeySet) {
            Main.wm.removeKeybinding('show-desktop-hotkey');
            this._isHotkeySet = false;
        }
    }
}

