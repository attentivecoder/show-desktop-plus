# ⭐ Show Desktop Plus  
*A smarter, workspace‑aware “Show Desktop” extension for GNOME Shell.*

<p align="center">
  <img src="https://img.shields.io/badge/GNOME-45–50-blue?logo=gnome&logoColor=white" />
  <img src="https://img.shields.io/badge/Tests-100%25-brightgreen?logo=vitest" />
  <img src="https://img.shields.io/badge/Coverage-73%25-orange?logo=vitest" />
  <img src="https://img.shields.io/github/license/attentivecoder/show-desktop-plus" />
  <img src="https://img.shields.io/badge/version-1-blue" />
</p>

Show Desktop Plus enhances GNOME’s desktop toggling by letting you hide and restore windows **per workspace**, optionally **per monitor**, with a clean panel indicator and intuitive mouse actions.

Originally based on the “Show Desktop Applet” extension — now heavily rewritten, modernized, and fully tested.

---

## 🚀 Features

- **Left‑click:** Toggle show/hide all windows on the current workspace
- **Middle‑click:**
  - Hide the focused window, **or**
  - Toggle desktop (configurable)
- **Right‑click:**
  - Focus the preferences window if already open
  - Otherwise open preferences normally
- **Per‑workspace window sessions:**
  - Hidden windows are tracked per workspace
  - Restores all windows and re‑activates the last focused one
- **Monitor‑aware behavior (optional):**
  - Hide/restore windows only on the active monitor
- **Dynamic panel icon:**
  - Icon changes based on hidden state
  - Optional badge shows number of hidden windows
- **Configurable panel position**
- **Optional global hotkey** (overrides GNOME’s built‑in Show Desktop)
- **Automatic updates on workspace switch**
- **Fully unit‑tested with Vitest**

---

## ⚙️ Settings

### Panel
- `button-position` – button position in the top bar

### Controls
- `left-click-action` – what happens when left-clicking the icon:
  - toggle desktop
  - hide all windows
  - restore windows
  - hide focused window
  - do nothing

- `middle-click-action` – what happens when middle-clicking the icon:
  - hide all windows
  - hide focused window
  - toggle desktop

### Shortcuts
- `enable-hotkey` – enable keyboard shortcut (overrides GNOME “Show Desktop”)

### Appearance
- `icon-style` – auto / desktop / computer
- `show-hidden-count` – show/hide badge with number of hidden windows

### Behavior
- `current-monitor-only` – limit window hiding to the active monitor

## Installation
### From source (development)
Clone into your local GNOME extensions directory:
```bash
git clone https://github.com/attentivecoder/show-desktop-plus.git \
  ~/.local/share/gnome-shell/extensions/show-desktop-plus@attentivecoder
```

Compile schemas:
```bash
glib-compile-schemas ~/.local/share/gnome-shell/extensions/show-desktop-plus@attentivecoder/schemas/
```

Restart GNOME Shell:
- Xorg: press Alt+F2, type r, press Enter
- Wayland: log out and back in

Enable the extension:

```bash
gnome-extensions enable show-desktop-plus@attentivecoder
```

## 🛠️ Development Notes
### Recompile schemas after changes

```bash
glib-compile-schemas schemas/
```

Or if you need to install system-wide (rare):

```bash
sudo cp schemas/org.gnome.shell.extensions.show-desktop-plus.gschema.xml \
    /usr/share/glib-2.0/schemas/

sudo glib-compile-schemas /usr/share/glib-2.0/schemas/
```

Verify schema changes:
```bash
gsettings list-keys org.gnome.shell.extensions.show-desktop-plus
```

## Testing
This extension includes a full Vitest test suite.
Run tests:
```bash
npm test
```

Or use npx for more indepth analysis if needed.

```bash
npx vitest --reporter verbose
```

Or use npx to check code coverage.

```bash
npx vitest --coverage
```

## Reviewer notes
On the GNOME Extensions review sandbox, right‑click cannot open preferences (sandbox limitation).

### View project tree (excluding node_modules):
```bash
tree -I 'node_modules|coverage|dist|build|venv'
```

### Debug GNOME Shell logs:

```bash
journalctl -f /usr/bin/gnome-shell
```

### Useful commands:

```bash
gsettings list-keys org.gnome.shell.extensions.show-desktop-plus
gsettings get org.gnome.shell.extensions.show-desktop-plus button-position
```

## ❤️ Credits
- Original extension by **amivaleo**: https://github.com/amivaleo/Show-Desktop-Button
- Rewritten, modernized, and expanded by @attentivecoder
