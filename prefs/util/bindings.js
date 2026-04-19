export function bindComboRow(settings, key, row) {
    row.set_selected(settings.get_enum(key));

    row.connect('notify::selected', () => {
        settings.set_enum(key, row.get_selected());
    });

    settings.connect(`changed::${key}`, () => {
        row.set_selected(settings.get_enum(key));
    });
}
