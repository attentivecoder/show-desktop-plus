import { bindSwitchRow } from '../util/bindings.js';

export function initBehavior(builder, settings) {
    const currentMonitorRow = builder.get_object('currentMonitor_row');
    bindSwitchRow(settings, 'current-monitor-only', currentMonitorRow);
}

