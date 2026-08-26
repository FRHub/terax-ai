import { create } from "zustand";
import { MAX_CONCURRENT_PREVIEWS } from "./devices";

export type ActivePreview = {
  deviceId: string;
  position: { x: number; y: number };
  scale: number;
  collapsed: boolean;
  customSize?: { width: number; height: number };
};

type DevicePreviewState = {
  active: ActivePreview[];
  pickerOpen: boolean;
  url: string;

  addDevice: (deviceId: string) => void;
  removeDevice: (deviceId: string) => void;
  setUrl: (url: string) => void;
  updatePosition: (deviceId: string, pos: { x: number; y: number }) => void;
  updateScale: (deviceId: string, scale: number) => void;
  updateSize: (
    deviceId: string,
    size: { width: number; height: number },
  ) => void;
  toggleCollapse: (deviceId: string) => void;
  togglePicker: () => void;
  closePicker: () => void;
  closeAll: () => void;
};

const STORAGE_KEY = "terax-device-preview";

function loadPersistedState(): {
  active: ActivePreview[];
  url: string;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: [], url: "" };
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.active) &&
      typeof parsed.url === "string"
    ) {
      return { active: parsed.active, url: parsed.url };
    }
  } catch {
    // corrupted storage, ignore
  }
  return { active: [], url: "" };
}

function persist(state: { active: ActivePreview[]; url: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded, ignore
  }
}

function staggerPosition(index: number): { x: number; y: number } {
  const base = { x: 80, y: 80 };
  return {
    x: base.x + index * 40,
    y: base.y + index * 40,
  };
}

const initial = loadPersistedState();

export const useDevicePreviewStore = create<DevicePreviewState>((set, get) => ({
  active: initial.active,
  pickerOpen: false,
  url: initial.url,

  addDevice: (deviceId) => {
    const { active } = get();
    if (active.length >= MAX_CONCURRENT_PREVIEWS) return;
    if (active.some((p) => p.deviceId === deviceId)) return;
    const next: ActivePreview = {
      deviceId,
      position: staggerPosition(active.length),
      scale: 0.5,
      collapsed: false,
    };
    const updated = [...active, next];
    set({ active: updated });
    persist({ active: updated, url: get().url });
  },

  removeDevice: (deviceId) => {
    const updated = get().active.filter((p) => p.deviceId !== deviceId);
    set({ active: updated });
    persist({ active: updated, url: get().url });
  },

  setUrl: (url) => {
    set({ url });
    persist({ active: get().active, url });
  },

  updatePosition: (deviceId, pos) => {
    const updated = get().active.map((p) =>
      p.deviceId === deviceId ? { ...p, position: pos } : p,
    );
    set({ active: updated });
    persist({ active: updated, url: get().url });
  },

  updateScale: (deviceId, scale) => {
    const clamped = Math.min(1, Math.max(0.25, scale));
    const updated = get().active.map((p) =>
      p.deviceId === deviceId ? { ...p, scale: clamped } : p,
    );
    set({ active: updated });
    persist({ active: updated, url: get().url });
  },

  updateSize: (deviceId, size) => {
    const width = Math.max(280, Math.min(2560, Math.round(size.width)));
    const height = Math.max(200, Math.min(2000, Math.round(size.height)));
    const updated = get().active.map((p) =>
      p.deviceId === deviceId ? { ...p, customSize: { width, height } } : p,
    );
    set({ active: updated });
    persist({ active: updated, url: get().url });
  },

  toggleCollapse: (deviceId) => {
    const updated = get().active.map((p) =>
      p.deviceId === deviceId ? { ...p, collapsed: !p.collapsed } : p,
    );
    set({ active: updated });
    persist({ active: updated, url: get().url });
  },

  togglePicker: () => set((s) => ({ pickerOpen: !s.pickerOpen })),
  closePicker: () => set({ pickerOpen: false }),

  closeAll: () => {
    set({ active: [], pickerOpen: false });
    persist({ active: [], url: get().url });
  },
}));
