export async function loadGnomeUI() {
    const St = (await import('gi://St')).default;
    const Clutter = (await import('gi://Clutter')).default;
    const GLib = (await import('gi://GLib')).default;
    const Meta = (await import('gi://Meta')).default;
    const Shell = (await import('gi://Shell')).default;

    const Main = await import('resource:///org/gnome/shell/ui/main.js');
    const PanelMenu = await import('resource:///org/gnome/shell/ui/panelMenu.js');

    return {
        St,
        Clutter,
        GLib,
        Meta,
        Shell,
        Main,
        PanelMenu,
    };
}