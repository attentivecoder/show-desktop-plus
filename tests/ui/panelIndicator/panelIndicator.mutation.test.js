import { vi } from "vitest";
import PanelIndicator from "../../../core/panelIndicator.js";
import * as gnomeUI from "../../mocks/core/gnomeUI.mock.js";

describe("PanelIndicator – mutation-driven tests", () => {
  beforeEach(() => {
    vi.stubGlobal("logError", vi.fn());
  });

  it("returns early when panel icon or badge is missing", async () => {
    const windowManager = {
      getHiddenCountForWorkspace: vi.fn(),
    };

    const settings = {
      get_enum: vi.fn(),
      get_boolean: vi.fn(),
    };

    const gnome = await gnomeUI.loadGnomeUI();

    const indicator = new PanelIndicator(
      windowManager,
      {},
      { _settings: settings },
      gnome
    );

    indicator._panelIcon = null;
    indicator._panelBadge = null;

    indicator.updateIcon();

    expect(windowManager.getHiddenCountForWorkspace).not.toHaveBeenCalled();
  });

  it("does not match prefs window when title and get_title() are missing", async () => {
    const windowManager = {};
    const settings = { get_enum: vi.fn(), get_boolean: vi.fn() };

    const extension = {
      metadata: { name: "show-desktop-plus" },
      _settings: settings,
    };

    const gnome = await gnomeUI.loadGnomeUI();

    gnome.get_window_actors = vi.fn(() => [
      {
        meta_window: {
          get_title: () => undefined, 
          get_wm_class: () => "org.gnome.Shell.Extensions",
        },
      },
    ]);

    const indicator = new PanelIndicator(
      windowManager,
      {},
      extension,
      gnome
    );

    const result = indicator._findPrefsWindow();

    expect(result).toBeUndefined();
  });

  it("does not match prefs window when wmClass is wrong even if title matches", async () => {
    const windowManager = {};
    const settings = { get_enum: vi.fn(), get_boolean: vi.fn() };

    const extension = {
      metadata: { name: "show-desktop-plus" },
      _settings: settings,
    };

    const gnome = await gnomeUI.loadGnomeUI();

    gnome.get_window_actors = vi.fn(() => [
      {
        meta_window: {
          get_title: () => "show-desktop-plus Preferences",
          get_wm_class: () => "NotTheRightClass",
        },
      },
    ]);

    const indicator = new PanelIndicator(
      windowManager,
      {},
      extension,
      gnome
    );

    const result = indicator._findPrefsWindow();

    expect(result).toBeUndefined();
  });

  it("handles promise-like return from openPreferences defensively", async () => {
    const windowManager = {};
    const settings = { get_enum: vi.fn(), get_boolean: vi.fn() };

    const logErrorSpy = vi.fn();
    vi.stubGlobal("logError", logErrorSpy);

    const promiseLike = Promise.reject("boom");

    const extension = {
      metadata: { name: "test-extension" },
      _settings: settings,
      openPreferences: vi.fn(() => promiseLike),
    };

    const gnome = await gnomeUI.loadGnomeUI();

    const indicator = new PanelIndicator(
      windowManager,
      {},
      extension,
      gnome
    );

    indicator._safeOpenPreferences();

    await Promise.resolve();

    expect(logErrorSpy).toHaveBeenCalledWith("boom");
  });

  it("falls back to console.error when logError is not a function", async () => {
    const windowManager = {};
    const settings = { get_enum: vi.fn(), get_boolean: vi.fn() };

    vi.stubGlobal("logError", undefined);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const extension = {
      metadata: { name: "test-extension" },
      _settings: settings,
      openPreferences: vi.fn(() => Promise.reject("boom")),
    };

    const gnome = await gnomeUI.loadGnomeUI();

    const indicator = new PanelIndicator(
      windowManager,
      {},
      extension,
      gnome
    );

    indicator._safeOpenPreferences();

    await Promise.resolve();

    expect(consoleErrorSpy).toHaveBeenCalledWith("boom");
  });

  it("does not call logError when openPreferences returns a non-promise value", async () => {
    const windowManager = {};
    const settings = { get_enum: vi.fn(), get_boolean: vi.fn() };

    const logErrorSpy = vi.fn();
    vi.stubGlobal("logError", logErrorSpy);

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const extension = {
      metadata: { name: "test-extension" },
      _settings: settings,
      openPreferences: vi.fn(() => ({ foo: "bar" })),
    };

    const gnome = await gnomeUI.loadGnomeUI();

    const indicator = new PanelIndicator(
      windowManager,
      {},
      extension,
      gnome
    );

    indicator._safeOpenPreferences();

    await Promise.resolve();

    expect(logErrorSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
