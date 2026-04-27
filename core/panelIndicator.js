const LeftClickAction = {
    TOGGLE_DESKTOP: 0,
    HIDE_ALL: 1,
    RESTORE_ALL: 2,
    HIDE_CURRENT: 3,
    DO_NOTHING: 4,
};

const MiddleClickAction = {
    HIDE_ALL: 0,
    HIDE_CURRENT: 1,
    TOGGLE_DESKTOP: 2,
};

const IconStyle = {
    AUTO: 0,
    DESKTOP: 1,
    COMPUTER: 2,
};

export default class PanelIndicator {
    constructor(windowManager, stateStore, extension, gnomeUI) {
        this._windowManager = windowManager;
        this._stateStore = stateStore;
        this._extension = extension;

        this._St = gnomeUI.St;
        this._Clutter = gnomeUI.Clutter;
        this._GLib = gnomeUI.GLib;
        this._Meta = gnomeUI.Meta;
        this._PanelMenu = gnomeUI.PanelMenu;
        this._Main = gnomeUI.Main;
        this._display = gnomeUI.display;        
        this._workspace_manager = gnomeUI.workspace_manager;
        this._get_window_actors = gnomeUI.get_window_actors;
        this._get_current_time = gnomeUI.get_current_time;

        this._panelButton = null;
        this._panelIcon = null;
        this._panelBadge = null;

        this._prefsOpenedByExtension = false;
        this._prefsWindow = null;
        this._prefsWindowSignal = null;
        this._buttonSignal = null;
    }
    
    _safeOpenPreferences() {
        try {
            const result = this._extension.openPreferences();

            // Normalize the return value so the catch attaches immediately
            Promise.resolve(result).catch(err => {
                if (typeof logError === "function") logError(err);
                else console.error(err);
            });

        } catch (err) {
            if (typeof logError === "function") logError(err);
            else console.error(err);
        }
    }

    _findPrefsWindow() {
        const extName = this._extension.metadata.name;

        const windows = this._get_window_actors()
            .map(actor => actor.meta_window)
            .filter(w => w);

        return windows.find(w => {
            const title = w.get_title() || "";
            const wmClass = w.get_wm_class() || "";
            return (
                wmClass === "org.gnome.Shell.Extensions" &&
                title.includes(extName)
            );
        });
    }
    
    // Stryker disable next-line BlockStatement
    _trackPrefsWindow(win) {
        // Stryker disable next-line LogicalOperator, ConditionalExpression, BooleanLiteral
        if (!win || this._prefsWindowSignal) return;

        this._prefsWindow = win;

        // Stryker disable next-line StringLiteral
        this._prefsWindowSignal = win.connect("unmanaged", () => {
            this._prefsWindow = null;
            this._prefsWindowSignal = null;
            this._prefsOpenedByExtension = false;
        });
    }
    
    _handleLeftClick(action) {
        const actions = {
            [LeftClickAction.TOGGLE_DESKTOP]: () => this._windowManager.toggleDesktop(),
            [LeftClickAction.HIDE_ALL]: () => this._windowManager.hideAllWindows(),
            [LeftClickAction.RESTORE_ALL]: () => this._windowManager.restoreAllWindows(),
            [LeftClickAction.HIDE_CURRENT]: () => {
                this._windowManager.addCurrentWindowToHidden();
                this.updateIcon();
            },
            [LeftClickAction.DO_NOTHING]: () => {},
        };

        actions[action]?.();
    }
    
    _handleMiddleClick(action) {
        const actions = {
            [MiddleClickAction.HIDE_ALL]: () => this._windowManager.hideAllWindows(),
            [MiddleClickAction.HIDE_CURRENT]: () => {
                this._windowManager.addCurrentWindowToHidden();
                this.updateIcon();
            },
            [MiddleClickAction.TOGGLE_DESKTOP]: () => this._windowManager.toggleDesktop(),
        };

        actions[action]?.();
    }

    async _handlePrefsWindow() {
        if (this._prefsHandling)
            return;

        this._prefsHandling = true;

        try {
            let prefsWin = this._findPrefsWindow();
            const currentWs = this._workspace_manager.get_active_workspace();

            if (!prefsWin) {
                this._prefsOpenedByExtension = true;
                this._safeOpenPreferences();

                // Wait for GNOME Shell to finish creating the window
                await new Promise(resolve => {
                    this._GLib.timeout_add(
                        this._GLib.PRIORITY_DEFAULT,
                        50,
                        () => { resolve(); return this._GLib.SOURCE_REMOVE; }
                    );
                });

                prefsWin = this._findPrefsWindow();
                if (!prefsWin)
                    return; // avoid crash
            }

            this._trackPrefsWindow(prefsWin);

            if (this._prefsOpenedByExtension) {
                if (prefsWin.get_workspace() !== currentWs)
                    prefsWin.change_workspace(currentWs);
            }

           try {
            prefsWin.activate(this._get_current_time());
        } catch (err) {
            if (typeof logError === "function") logError(err);
            else console.error(err);

            // ⭐ FIX: fallback to opening preferences
            this._safeOpenPreferences();
        }

        } catch (err) {
            if (typeof logError === "function") logError(err);
            else console.error(err);

        } finally {
            this._prefsHandling = false;
        }
    }

    _createPanelButton() {
        if (this._panelButton) return;

        const St = this._St;
        const Clutter = this._Clutter;
        const GLib = this._GLib;
        const PanelMenu = this._PanelMenu;
        
        this._panelButton = new PanelMenu.Button(
            0.0,
            `${this._extension._extensionName}-indicator`,
            false
        );

        const box = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            reactive: false,
        });

        this._panelIcon = new St.Icon({
            icon_name: "computer-symbolic",
            style_class: "system-status-icon",
        });

        this._panelBadge = new St.Label({
            style_class: "desktop-toggle-badge",
            visible: false,
            reactive: false,
        });

        box.add_child(this._panelIcon);
        box.add_child(this._panelBadge);
        this._panelButton.add_child(box);

        this._panelButton.reactive = true;
        this._panelButton.clear_actions();

        this._buttonSignal = this._panelButton.connect(
            "button-release-event",
            (_, event) => {
                const button = event.get_button();

                switch (button) {
                    case this._Clutter.BUTTON_PRIMARY: {
                        const action = this._extension._settings.get_enum("left-click-action");
                        this._handleLeftClick(action);
                        return this._Clutter.EVENT_STOP;
                    }

                    case this._Clutter.BUTTON_MIDDLE: {
                        const action = this._extension._settings.get_enum("middle-click-action");
                        this._handleMiddleClick(action);
                        return this._Clutter.EVENT_STOP;
                    }

                    case this._Clutter.BUTTON_SECONDARY:
                        this._GLib.idle_add(this._GLib.PRIORITY_DEFAULT, () => {
                            this._handlePrefsWindow();
                            return this._GLib.SOURCE_REMOVE;
                        });
                        return this._Clutter.EVENT_STOP;
                }

                return this._Clutter.EVENT_PROPAGATE;
            }
        );
    }

    addToPanel() {
        const role = `${this._extension._extensionName} Indicator`;

        const positions = ["left", "left", "center", "right", "right"];
        const offsets = [0, 1, 0, 0, 1];

        this._createPanelButton();

        this._Main.panel.addToStatusArea(
            role,
            this._panelButton,
            offsets[this._extension._settings.get_enum("button-position")],
            positions[this._extension._settings.get_enum("button-position")]
        );
    }

    destroy() {
        if (!this._panelButton) return;

        if (this._buttonSignal) {
            this._panelButton.disconnect(this._buttonSignal);
            this._buttonSignal = null;
        }

        if (this._prefsWindow && this._prefsWindowSignal) {
            this._prefsWindow.disconnect(this._prefsWindowSignal);
            this._prefsWindowSignal = null;
        }

        this._panelButton.destroy();
        this._panelButton = null;
        this._panelIcon = null;
        this._panelBadge = null;

        this._prefsWindow = null;
        this._prefsOpenedByExtension = false;
    }

    updateIcon() {
        if (!this._panelIcon || !this._panelBadge || !this._extension)
            return;

        const workspace = this._workspace_manager.get_active_workspace();
        const wsIndex = workspace.index();

        const count = this._windowManager.getHiddenCountForWorkspace(wsIndex);
        const hasHidden = count > 0;

        const iconStyle = this._extension._settings.get_enum("icon-style");

        switch (iconStyle) {
            case IconStyle.AUTO:
                this._panelIcon.icon_name = hasHidden
                    ? "user-desktop-symbolic"
                    : "computer-symbolic";
                break;

            case IconStyle.DESKTOP:
                this._panelIcon.icon_name = "user-desktop-symbolic";
                break;

            case IconStyle.COMPUTER:
                this._panelIcon.icon_name = "computer-symbolic";
                break;

            default:
                this._panelIcon.icon_name = "computer-symbolic";
        }

        const showCount = this._extension._settings.get_boolean("show-hidden-count");

        this._panelBadge.visible = showCount && hasHidden;
        this._panelBadge.text = showCount && hasHidden ? `${count}` : "";
    }
}

