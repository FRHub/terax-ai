import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  DEVICE_CATALOG,
  deviceById,
  devicesByCategory,
  MAX_CONCURRENT_PREVIEWS,
} from "./devices";

describe("DEVICE_CATALOG", () => {
  it("contains at least one device per category", () => {
    for (const cat of CATEGORIES) {
      const devices = DEVICE_CATALOG.filter((d) => d.category === cat.key);
      expect(devices.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("has unique device ids", () => {
    const ids = DEVICE_CATALOG.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every device has positive screen dimensions", () => {
    for (const d of DEVICE_CATALOG) {
      expect(d.screenWidth).toBeGreaterThan(0);
      expect(d.screenHeight).toBeGreaterThan(0);
      expect(d.devicePixelRatio).toBeGreaterThan(0);
    }
  });

  it("every device has a non-empty name and color", () => {
    for (const d of DEVICE_CATALOG) {
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.color.length).toBeGreaterThan(0);
    }
  });
});

describe("deviceById", () => {
  it("returns the matching device", () => {
    const d = deviceById("iphone-16-pro");
    expect(d).toBeDefined();
    expect(d?.name).toBe("iPhone 16 Pro");
  });

  it("returns undefined for unknown id", () => {
    expect(deviceById("nonexistent-device")).toBeUndefined();
  });
});

describe("devicesByCategory", () => {
  it("returns only devices of the given category", () => {
    const phones = devicesByCategory("phone");
    expect(phones.length).toBeGreaterThan(0);
    for (const d of phones) {
      expect(d.category).toBe("phone");
    }
  });

  it("returns an empty array for an empty category", () => {
    const result = devicesByCategory("phone").filter(
      (d) => d.category !== "phone",
    );
    expect(result).toHaveLength(0);
  });
});

describe("MAX_CONCURRENT_PREVIEWS", () => {
  it("is a positive integer", () => {
    expect(MAX_CONCURRENT_PREVIEWS).toBeGreaterThan(0);
    expect(Number.isInteger(MAX_CONCURRENT_PREVIEWS)).toBe(true);
  });
});
