import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { initPanel } from './prefs/ui/panel.js';
import { initControls } from './prefs/ui/controls.js';
import { initShortcuts } from './prefs/ui/shortcuts.js';
import { initAppearance } from './prefs/ui/appearance.js';
import { initBehavior } from './prefs/ui/behavior.js';

export default class extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_default_size(650, 800);

        const settings = this.getSettings();
        const builder = new Gtk.Builder();
        
        builder.set_translation_domain(this.metadata['gettext-domain']);
        builder.add_from_file(this.dir.get_child('prefs.ui').get_path());

        const uiDir = this.dir.get_child('prefs/ui');

        builder.add_from_file(uiDir.get_child('panel.ui').get_path());
        builder.add_from_file(uiDir.get_child('controls.ui').get_path());
        builder.add_from_file(uiDir.get_child('shortcuts.ui').get_path());
        builder.add_from_file(uiDir.get_child('appearance.ui').get_path());
        builder.add_from_file(uiDir.get_child('behavior.ui').get_path());

        builder.get_object('panel_section')
            .add(builder.get_object('panel_group'));

        builder.get_object('controls_section')
            .add(builder.get_object('controls_group'));

        builder.get_object('shortcuts_section')
            .add(builder.get_object('shortcuts_group'));

        builder.get_object('appearance_section')
            .add(builder.get_object('appearance_group'));

        builder.get_object('behavior_section')
            .add(builder.get_object('behavior_group'));

        initPanel(builder, settings);
        initControls(builder, settings);
        initShortcuts(builder, settings);
        initAppearance(builder, settings);
        initBehavior(builder, settings);

        const page = builder.get_object('main_prefs');
        page.set_margin_top(12);
        page.set_margin_bottom(12);

        window.set_child(page);
    }
}

