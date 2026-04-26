import { bindSwitchRow } from '../util/bindings.js';

export function initShortcuts(builder, settings) {
    const hotkeyRow = builder.get_object('useHotkey_row');
    bindSwitchRow(settings, 'enable-hotkey', hotkeyRow);
}
