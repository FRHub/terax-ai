export type DeviceCategory = "phone" | "tablet" | "laptop" | "responsive";

export type DeviceProfile = {
  id: string;
  name: string;
  category: DeviceCategory;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  bezelRadius: number;
  color: string;
  isResizable?: boolean;
  accentColor?: string;
  subtitle?: string;
  tag?: string;
};

export const DEVICE_CATALOG: DeviceProfile[] = [
  {
    id: "responsive",
    name: "Responsive (Free Resize)",
    category: "responsive",
    screenWidth: 800,
    screenHeight: 600,
    devicePixelRatio: 1,
    bezelRadius: 14,
    color: "#18181f",
    isResizable: true,
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    category: "phone",
    screenWidth: 402,
    screenHeight: 874,
    devicePixelRatio: 3,
    bezelRadius: 52,
    color: "#c25e2e",
    accentColor: "#d97736",
    subtitle: "Cosmic Orange Titanium",
    tag: "New",
  },
  {
    id: "huawei-pura-80-ultra",
    name: "Huawei Pura 80 Ultra",
    category: "phone",
    screenWidth: 420,
    screenHeight: 936,
    devicePixelRatio: 3,
    bezelRadius: 44,
    color: "#1a1c20",
    accentColor: "#d4af37",
    subtitle: "Graphite · Gold XMAGE",
    tag: "New",
  },
  {
    id: "galaxy-s26-ultra",
    name: "Galaxy S26 Ultra",
    category: "phone",
    screenWidth: 412,
    screenHeight: 915,
    devicePixelRatio: 3,
    bezelRadius: 28,
    color: "#ede5d6",
    accentColor: "#d4af37",
    subtitle: "Titanium Warm Cream · S-Pen",
    tag: "New",
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "phone",
    screenWidth: 393,
    screenHeight: 852,
    devicePixelRatio: 3,
    bezelRadius: 48,
    color: "#282725",
  },
  {
    id: "iphone-se",
    name: "iPhone SE",
    category: "phone",
    screenWidth: 375,
    screenHeight: 667,
    devicePixelRatio: 2,
    bezelRadius: 24,
    color: "#242426",
  },
  {
    id: "pixel-9",
    name: "Pixel 9",
    category: "phone",
    screenWidth: 412,
    screenHeight: 915,
    devicePixelRatio: 2.6,
    bezelRadius: 42,
    color: "#1f2022",
  },
  {
    id: "galaxy-s24",
    name: "Galaxy S24",
    category: "phone",
    screenWidth: 360,
    screenHeight: 780,
    devicePixelRatio: 3,
    bezelRadius: 36,
    color: "#1c1d21",
  },
  {
    id: "ipad-air",
    name: "iPad Air",
    category: "tablet",
    screenWidth: 820,
    screenHeight: 1180,
    devicePixelRatio: 2,
    bezelRadius: 20,
    color: "#222328",
  },
  {
    id: "ipad-mini",
    name: "iPad Mini",
    category: "tablet",
    screenWidth: 768,
    screenHeight: 1024,
    devicePixelRatio: 2,
    bezelRadius: 18,
    color: "#26272c",
  },
  {
    id: "macbook-air-13",
    name: 'MacBook Air 13"',
    category: "laptop",
    screenWidth: 1280,
    screenHeight: 800,
    devicePixelRatio: 2,
    bezelRadius: 10,
    color: "#1e1e22",
  },
  {
    id: "generic-1080p",
    name: "Generic 1080p",
    category: "laptop",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1,
    bezelRadius: 6,
    color: "#141416",
  },
];

export const CATEGORIES: { key: DeviceCategory; label: string }[] = [
  { key: "responsive", label: "Responsive" },
  { key: "phone", label: "Phones" },
  { key: "tablet", label: "Tablets" },
  { key: "laptop", label: "Laptops" },
];

export function deviceById(id: string): DeviceProfile | undefined {
  return DEVICE_CATALOG.find((d) => d.id === id);
}

export function devicesByCategory(cat: DeviceCategory): DeviceProfile[] {
  return DEVICE_CATALOG.filter((d) => d.category === cat);
}

export const MAX_CONCURRENT_PREVIEWS = 4;
