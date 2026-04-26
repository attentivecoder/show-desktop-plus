import { bindComboRow, bindSwitchRow } from '../util/bindings.js';

export function initAppearance(builder, settings) {
    const iconStyleRow = builder.get_object('iconStyle_row');
    const showCountRow = builder.get_object('showHiddenCount_row');

    bindComboRow(settings, 'icon-style', iconStyleRow);
    bindSwitchRow(settings, 'show-hidden-count', showCountRow);
}

