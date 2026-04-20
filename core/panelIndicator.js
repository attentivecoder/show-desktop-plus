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

        this._panelButton = null;
        this._panelIcon = null;
        this._panelBadge = null;

        this._prefsOpenedByExtension = false;
    }

    _safeOpenPreferences() {
        try {
            const result = this._extension.openPreferences();

            if (result && typeof result.catch === 'function') {
                result.catch(err => {
                    if (typeof logError === 'function')
                        logError(err);
                    else
                        log(err);
                });
            }

        } catch (err) {
            if (typeof logError === 'function')
                logError(err);
            else
                log(err);
        }
    }

    _findPrefsWindow() {
        const windows = global.display.get_tab_list(
            this._Meta.TabList.NORMAL_ALL,
            null
        );

        const extName = this._extension.metadata.name;

        return windows.find(w => {
          //  const title = w.get_title?.() || "";            
            const title = w.get_title?.() || w.title || "";
            const wmClass = w.get_wm_class?.() || "";
            return (
                wmClass === "org.gnome.Shell.Extensions" &&
                title.includes(extName)
            );
        });
    }

    _handlePrefsWindow() {
        const prefsWin = this._findPrefsWindow();
        const currentWs = global.workspace_manager.get_active_workspace();

        if (!prefsWin) {
            this._prefsOpenedByExtension = true;
            this._safeOpenPreferences();
            return;
        }

        try {
            if (this._prefsOpenedByExtension) {
                if (prefsWin.get_workspace() !== currentWs)
                    prefsWin.change_workspace(currentWs);
            }

            prefsWin.activate(global.get_current_time());

        } catch {
            this._safeOpenPreferences();
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
            icon_name: 'computer-symbolic',
            style_class: 'system-status-icon',
        });

        this._panelBadge = new St.Label({
            style_class: 'desktop-toggle-badge',
            visible: false,
            reactive: false,
        });

        box.add_child(this._panelIcon);
        box.add_child(this._panelBadge);
        this._panelButton.add_child(box);

        this._panelButton.reactive = true;
        this._panelButton.clear_actions();

        this._panelButton.connect('button-release-event', (_, event) => {
            const button = event.get_button();

            if (button === 1) {
                const action = this._extension._settings.get_enum('left-click-action');
                switch (action) {
                    case 0: this._windowManager.toggleDesktop(); break;
                    case 1: this._windowManager.hideAllWindows(); break;
                    case 2: this._windowManager.restoreAllWindows(); break;
                    case 3:
                        this._windowManager.addCurrentWindowToHidden();
                        this.updateIcon();
                        break;
                }
                return Clutter.EVENT_STOP;
            }

            if (button === 2) {
                const action = this._extension._settings.get_enum('middle-click-action');
                switch (action) {
                    case 0: this._windowManager.hideAllWindows(); break;
                    case 1:
                        this._windowManager.addCurrentWindowToHidden();
                        this.updateIcon();
                        break;
                    case 2: this._windowManager.toggleDesktop(); break;
                }
                return Clutter.EVENT_STOP;
            }

            if (button === 3) {
                this._GLib.idle_add(this._GLib.PRIORITY_DEFAULT, () => {
                    this._handlePrefsWindow();
                    return this._GLib.SOURCE_REMOVE;
                });

                return Clutter.EVENT_STOP;
            }

            return Clutter.EVENT_PROPAGATE;
        });
    }

    addToPanel() {
        const role = `${this._extension._extensionName} Indicator`;

        const positions = ['left', 'left', 'center', 'right', 'right'];
        const offsets = [0, 1, 0, 0, 1];

        this._createPanelButton();

        this._Main.panel.addToStatusArea(
            role,
            this._panelButton,
            offsets[this._extension._settings.get_enum('button-position')],
            positions[this._extension._settings.get_enum('button-position')]
        );
    }

    removeFromPanel() {
        if (this._panelButton) {
            this._panelButton.destroy();
            this._panelButton = null;
            this._panelIcon = null;
            this._panelBadge = null;
        }
    }

    updateIcon() {
        if (!this._panelIcon || !this._panelBadge || !this._extension)
            return;

        const workspace = global.workspace_manager.get_active_workspace();
        const wsIndex = workspace.index();

        const count = this._windowManager.getHiddenCountForWorkspace(wsIndex);
        const hasHidden = count > 0;

        const iconStyle = this._extension._settings.get_enum('icon-style');

        switch (iconStyle) {
            case 0:
                this._panelIcon.icon_name = hasHidden
                    ? 'user-desktop-symbolic'
                    : 'computer-symbolic';
                break;
            case 1:
                this._panelIcon.icon_name = 'user-desktop-symbolic';
                break;
            case 2:
                this._panelIcon.icon_name = 'computer-symbolic';
                break;
            default:
                this._panelIcon.icon_name = 'computer-symbolic';
        }

        const showCount = this._extension._settings.get_boolean('show-hidden-count');

        this._panelBadge.visible = showCount && hasHidden;
        this._panelBadge.text = showCount && hasHidden ? `${count}` : '';
    }
}

