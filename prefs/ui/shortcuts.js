import Gio from 'gi://Gio';

export function initShortcuts(builder, settings) {
    const hotkeyRow = builder.get_object('useHotkey_row');

    settings.bind(
        'enable-hotkey',
        hotkeyRow,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
}
