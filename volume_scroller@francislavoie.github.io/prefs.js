import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class VolumeScrollerExtensionPreferences extends ExtensionPreferences {
   fillPreferencesWindow(window) {
    window._settings = this.getSettings();

    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create the preference rows
    const granularityRow = new Adw.ActionRow({ title: 'Granularity' });
    const invertScrollRow = new Adw.ActionRow({ title: 'Invert Scroll' });
    const middleClickRow = new Adw.ActionRow({ title: 'Middle-click toggles mute' });
    group.add(granularityRow);
    group.add(invertScrollRow);
    group.add(middleClickRow);

    // Create the modifier key dropdown
    const modifierKeys = ['none', 'ctrl', 'alt', 'shift', 'super', 'none-exclusive'];
    const modifierRow = new Adw.ComboRow({
      title: 'Required modifier key',
      subtitle: 'Only change volume on scroll while this key is held. "None (exclusive)" changes volume only when no modifier is held',
      model: Gtk.StringList.new(['None', 'Ctrl', 'Alt', 'Shift', 'Super', 'None (exclusive)']),
      selected: Math.max(0, modifierKeys.indexOf(window._settings.get_string('modifier-key'))),
    });
    group.add(modifierRow);

    const feedbackSwitch = new Adw.SwitchRow({ title: 'Enable Sound Feedback' });
    const feedbackSounds = [
      ['audio-volume-change', 'GNOME System Menu'],
      ['bell', 'Bell'],
      ['dialog-information', 'Information'],
      ['message', 'Message'],
    ];
    const feedbackRow = new Adw.ComboRow({
      title: 'Feedback Sound',
      model: Gtk.StringList.new(feedbackSounds.map(([, label]) => label)),
    });
    group.add(feedbackSwitch);
    group.add(feedbackRow);

    const settings = window._settings;
    settings.bind('enable-sound-feedback', feedbackSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
    settings.bind('enable-sound-feedback', feedbackRow, 'sensitive', Gio.SettingsBindFlags.GET);
    const updateFeedbackSound = () => {
      const sound = settings.get_string('feedback-sound');
      feedbackRow.selected = Math.max(0, feedbackSounds.findIndex(([event]) => event === sound));
    };
    updateFeedbackSound();
    settings.connect('changed::feedback-sound', updateFeedbackSound);
    feedbackRow.connect('notify::selected', () => {
      const sound = feedbackSounds[feedbackRow.selected];
      if (sound) {
        settings.set_string('feedback-sound', sound[0]);
      }
    });

    // Create the value picker
    const granularityEntry = new Gtk.SpinButton({
      adjustment: new Gtk.Adjustment({ step_increment: 1, lower: 1, upper: 50 }),
      value: window._settings.get_int('granularity'),
      valign: Gtk.Align.CENTER,
      halign: Gtk.Align.CENTER,
    });

    // Create the direction switch
    const invertScrollSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('invert-scroll'),
      valign: Gtk.Align.CENTER,
      halign: Gtk.Align.CENTER,
    });

    // Create the middle-click switch
    const middleClickSwitch = new Gtk.Switch({
      active: window._settings.get_boolean('enable-middle-click'),
      valign: Gtk.Align.CENTER,
      halign: Gtk.Align.CENTER,
    });

    // Bind the settings
    window._settings.bind(
      'granularity',
      granularityEntry,
      'value',
      Gio.SettingsBindFlags.DEFAULT
    );
    
    window._settings.bind(
      'invert-scroll',
      invertScrollSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );

    window._settings.bind(
      'enable-middle-click',
      middleClickSwitch,
      'active',
      Gio.SettingsBindFlags.DEFAULT
    );

    modifierRow.connect('notify::selected', () => {
      window._settings.set_string('modifier-key', modifierKeys[modifierRow.selected]);
    });
    window._settings.connect('changed::modifier-key', () => {
      modifierRow.selected = Math.max(0, modifierKeys.indexOf(window._settings.get_string('modifier-key')));
    });

    // Add the granularity value picker to the row
    granularityRow.add_suffix(granularityEntry);
    granularityRow.activatable_widget = granularityEntry;

    // Add the direction switch to the row
    invertScrollRow.add_suffix(invertScrollSwitch);
    invertScrollRow.activatable_widget = invertScrollSwitch;

    // Add the middle-click switch to the row
    middleClickRow.add_suffix(middleClickSwitch);
    middleClickRow.activatable_widget = middleClickSwitch;

    // Add our page to the window
    window.add(page);
  }
}
