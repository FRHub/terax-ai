import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDevicePreviewStore } from "./useDevicePreviewStore";

function resetStore() {
  useDevicePreviewStore.setState({
    active: [],
    pickerOpen: false,
    url: "",
  });
}

describe("useDevicePreviewStore", () => {
  beforeEach(() => {
    resetStore();
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("starts with no active previews", () => {
    expect(useDevicePreviewStore.getState().active).toHaveLength(0);
  });

  it("addDevice adds a device to active list", () => {
    const { addDevice } = useDevicePreviewStore.getState();
    addDevice("iphone-16-pro");
    expect(useDevicePreviewStore.getState().active).toHaveLength(1);
    expect(useDevicePreviewStore.getState().active[0].deviceId).toBe(
      "iphone-16-pro",
    );
  });

  it("addDevice does not add duplicates", () => {
    const { addDevice } = useDevicePreviewStore.getState();
    addDevice("iphone-16-pro");
    addDevice("iphone-16-pro");
    expect(useDevicePreviewStore.getState().active).toHaveLength(1);
  });

  it("addDevice respects MAX_CONCURRENT_PREVIEWS", () => {
    const { addDevice } = useDevicePreviewStore.getState();
    addDevice("iphone-16-pro");
    addDevice("pixel-9");
    addDevice("galaxy-s24");
    addDevice("ipad-air");
    addDevice("ipad-mini");
    expect(useDevicePreviewStore.getState().active).toHaveLength(4);
  });

  it("removeDevice removes a device", () => {
    const { addDevice } = useDevicePreviewStore.getState();
    addDevice("iphone-16-pro");
    addDevice("pixel-9");

    useDevicePreviewStore.getState().removeDevice("iphone-16-pro");
    const remaining = useDevicePreviewStore.getState().active;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].deviceId).toBe("pixel-9");
  });

  it("setUrl updates the url", () => {
    useDevicePreviewStore.getState().setUrl("http://localhost:5173");
    expect(useDevicePreviewStore.getState().url).toBe("http://localhost:5173");
  });

  it("updatePosition updates device position", () => {
    useDevicePreviewStore.getState().addDevice("iphone-16-pro");
    useDevicePreviewStore
      .getState()
      .updatePosition("iphone-16-pro", { x: 200, y: 300 });
    const preview = useDevicePreviewStore
      .getState()
      .active.find((p) => p.deviceId === "iphone-16-pro");
    expect(preview?.position).toEqual({ x: 200, y: 300 });
  });

  it("updateScale clamps between 0.25 and 1.0", () => {
    useDevicePreviewStore.getState().addDevice("iphone-16-pro");

    useDevicePreviewStore.getState().updateScale("iphone-16-pro", 0.1);
    let preview = useDevicePreviewStore
      .getState()
      .active.find((p) => p.deviceId === "iphone-16-pro");
    expect(preview?.scale).toBe(0.25);

    useDevicePreviewStore.getState().updateScale("iphone-16-pro", 1.5);
    preview = useDevicePreviewStore
      .getState()
      .active.find((p) => p.deviceId === "iphone-16-pro");
    expect(preview?.scale).toBe(1);
  });

  it("toggleCollapse toggles the collapsed state", () => {
    useDevicePreviewStore.getState().addDevice("iphone-16-pro");
    expect(useDevicePreviewStore.getState().active[0].collapsed).toBe(false);

    useDevicePreviewStore.getState().toggleCollapse("iphone-16-pro");
    expect(useDevicePreviewStore.getState().active[0].collapsed).toBe(true);

    useDevicePreviewStore.getState().toggleCollapse("iphone-16-pro");
    expect(useDevicePreviewStore.getState().active[0].collapsed).toBe(false);
  });

  it("togglePicker toggles picker open state", () => {
    expect(useDevicePreviewStore.getState().pickerOpen).toBe(false);
    useDevicePreviewStore.getState().togglePicker();
    expect(useDevicePreviewStore.getState().pickerOpen).toBe(true);
    useDevicePreviewStore.getState().togglePicker();
    expect(useDevicePreviewStore.getState().pickerOpen).toBe(false);
  });

  it("closeAll removes all active previews", () => {
    const { addDevice } = useDevicePreviewStore.getState();
    addDevice("iphone-16-pro");
    addDevice("pixel-9");
    addDevice("ipad-air");

    useDevicePreviewStore.getState().closeAll();
    expect(useDevicePreviewStore.getState().active).toHaveLength(0);
    expect(useDevicePreviewStore.getState().pickerOpen).toBe(false);
  });

  it("new device gets a staggered position", () => {
    const { addDevice } = useDevicePreviewStore.getState();
    addDevice("iphone-16-pro");
    addDevice("pixel-9");

    const [first, second] = useDevicePreviewStore.getState().active;
    expect(first.position.x).not.toBe(second.position.x);
    expect(first.position.y).not.toBe(second.position.y);
  });

  it("new device starts at 0.5 scale, not collapsed", () => {
    useDevicePreviewStore.getState().addDevice("iphone-16-pro");
    const preview = useDevicePreviewStore.getState().active[0];
    expect(preview.scale).toBe(0.5);
    expect(preview.collapsed).toBe(false);
  });

  it("updateSize updates custom dimensions with bounds clamping", () => {
    useDevicePreviewStore.getState().addDevice("responsive");
    useDevicePreviewStore
      .getState()
      .updateSize("responsive", { width: 1024, height: 768 });
    const preview = useDevicePreviewStore
      .getState()
      .active.find((p) => p.deviceId === "responsive");
    expect(preview?.customSize).toEqual({ width: 1024, height: 768 });

    // clamping lower bounds
    useDevicePreviewStore
      .getState()
      .updateSize("responsive", { width: 100, height: 50 });
    const clamped = useDevicePreviewStore
      .getState()
      .active.find((p) => p.deviceId === "responsive");
    expect(clamped?.customSize).toEqual({ width: 280, height: 200 });
  });
});
