import Gio from 'gi://Gio';

export function bindComboRow(settings, key, row) {
    let updating = false;

    function updateFromSettings() {
        if (updating) return;
        updating = true;
        row.set_selected(settings.get_enum(key));
        updating = false;
    }

    function updateFromWidget() {
        if (updating) return;
        updating = true;
        settings.set_enum(key, row.get_selected());
        updating = false;
    }

    // Initial sync
    updateFromSettings();

    // Widget → Settings
    row.connect('notify::selected', updateFromWidget);

    // Settings → Widget
    settings.connect(`changed::${key}`, updateFromSettings);
}

export function bindSwitchRow(settings, key, row) {
    settings.bind(
        key,
        row,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
}
