import { bindComboRow } from '../util/bindings.js';

export function initPanel(builder, settings) {
    const positionRow = builder.get_object('panelButtonPosition_row');
    bindComboRow(settings, 'button-position', positionRow);
}
