import Gio from 'gi://Gio';

export function initBehavior(builder, settings) {
    const currentMonitorRow = builder.get_object('currentMonitor_row');

    settings.bind(
        'current-monitor-only',
        currentMonitorRow,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );
}
