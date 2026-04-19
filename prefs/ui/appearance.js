import { bindComboRow } from '../util/bindings.js';
import Gio from 'gi://Gio';

export function initAppearance(builder, settings) {
    const iconStyleRow = builder.get_object('iconStyle_row');
    const showCountRow = builder.get_object('showHiddenCount_row');

    bindComboRow(settings, 'icon-style', iconStyleRow);

    settings.bind(
        'show-hidden-count',
        showCountRow,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
}
