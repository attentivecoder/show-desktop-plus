export async function loadGnomeUI() {
    const St = (await import('gi://St')).default;
    const Clutter = (await import('gi://Clutter')).default;
    const GLib = (await import('gi://GLib')).default;
    const Meta = (await import('gi://Meta')).default;
    const Shell = (await import('gi://Shell')).default;

    const Main = await import('resource:///org/gnome/shell/ui/main.js');
    const PanelMenu = await import('resource:///org/gnome/shell/ui/panelMenu.js');

    const display = global.get_display();
    const workspace_manager = global.get_workspace_manager();
    const get_current_time = global.get_current_time.bind(global);
    const get_window_actors = global.get_window_actors.bind(global);

    return {
        St,
        Clutter,
        GLib,
        Meta,
        Shell,
        Main,
        PanelMenu,
        display,
        workspace_manager,
        get_current_time,
        get_window_actors,
    }
}

