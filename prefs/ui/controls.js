import { bindComboRow } from '../util/bindings.js';

export function initControls(builder, settings) {
    const leftClickRow = builder.get_object('leftClickAction_row');
    const middleClickRow = builder.get_object('middleClickAction_row');

    bindComboRow(settings, 'left-click-action', leftClickRow);
    bindComboRow(settings, 'middle-click-action', middleClickRow);
}
