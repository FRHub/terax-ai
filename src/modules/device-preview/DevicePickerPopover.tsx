import {
  Cancel01Icon,
  Delete02Icon,
  Globe02Icon,
  LaptopIcon,
  SmartPhone01Icon,
  Tablet01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import {
  CATEGORIES,
  type DeviceProfile,
  devicesByCategory,
  MAX_CONCURRENT_PREVIEWS,
} from "./lib/devices";
import { useDevicePreviewStore } from "./lib/useDevicePreviewStore";

type Props = {
  anchor: { x: number; y: number };
};

const CATEGORY_ICONS = {
  responsive: Globe02Icon,
  phone: SmartPhone01Icon,
  tablet: Tablet01Icon,
  laptop: LaptopIcon,
};

export function DevicePickerPopover({ anchor }: Props) {
  const active = useDevicePreviewStore((s) => s.active);
  const url = useDevicePreviewStore((s) => s.url);
  const setUrl = useDevicePreviewStore((s) => s.setUrl);
  const addDevice = useDevicePreviewStore((s) => s.addDevice);
  const removeDevice = useDevicePreviewStore((s) => s.removeDevice);
  const closePicker = useDevicePreviewStore((s) => s.closePicker);
  const closeAll = useDevicePreviewStore((s) => s.closeAll);

  const [urlInput, setUrlInput] = useState(url);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeIds = new Set(active.map((a) => a.deviceId));
  const atLimit = active.length >= MAX_CONCURRENT_PREVIEWS;

  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = urlInput.trim();
      if (trimmed) setUrl(trimmed);
    },
    [urlInput, setUrl],
  );

  const toggleDevice = useCallback(
    (device: DeviceProfile) => {
      if (activeIds.has(device.id)) {
        removeDevice(device.id);
      } else if (!atLimit) {
        if (urlInput.trim() && urlInput.trim() !== url) {
          setUrl(urlInput.trim());
        }
        addDevice(device.id);
      }
    },
    [activeIds, atLimit, addDevice, removeDevice, urlInput, url, setUrl],
  );

  return (
    <div
      className="dp-picker-backdrop"
      onClick={closePicker}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
      }}
    >
      <div
        className="dp-picker"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          bottom: anchor.y + 8,
          right: window.innerWidth - anchor.x,
          width: 340,
          background: "rgba(18, 18, 22, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)",
          overflow: "hidden",
          animation: "dp-picker-enter 0.15s ease-out",
          fontFamily: "var(--font-sans, system-ui)",
          color: "rgba(255,255,255,0.85)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px 8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
            Device Preview
          </span>
          <button
            type="button"
            onClick={closePicker}
            className="dp-picker-close"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={13} />
          </button>
        </div>

        {/* url input */}
        <form
          onSubmit={handleUrlSubmit}
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="http://localhost:3000"
            spellCheck={false}
            style={{
              width: "100%",
              height: 30,
              padding: "0 8px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 11,
              fontFamily: "var(--font-mono, monospace)",
              outline: "none",
            }}
          />
        </form>

        {/* device grid by category */}
        <div
          style={{
            padding: "4px 0",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {CATEGORIES.map((cat) => {
            const devices = devicesByCategory(cat.key);
            const catIcon = CATEGORY_ICONS[cat.key];
            return (
              <div key={cat.key}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "8px 12px 4px",
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  <HugeiconsIcon icon={catIcon} size={11} />
                  {cat.label}
                </div>
                {devices.map((device) => {
                  const isActive = activeIds.has(device.id);
                  const disabled = !isActive && atLimit;
                  return (
                    <button
                      key={device.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleDevice(device)}
                      className="dp-device-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "6px 12px",
                        border: "none",
                        background: isActive
                          ? "rgba(99, 102, 241, 0.12)"
                          : "transparent",
                        color: disabled
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(255,255,255,0.8)",
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontSize: 12,
                        fontFamily: "inherit",
                        textAlign: "left",
                        borderRadius: 0,
                      }}
                    >
                      {/* active indicator */}
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 4,
                          border: isActive
                            ? "none"
                            : "1.5px solid rgba(255,255,255,0.15)",
                          background: isActive
                            ? "linear-gradient(135deg, #818cf8, #6366f1)"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: 9,
                          color: "#fff",
                        }}
                      >
                        {isActive && "\u2713"}
                      </div>

                      <span style={{ flex: 1, fontWeight: 450 }}>
                        {device.name}
                      </span>

                      <span
                        style={{
                          fontSize: 10,
                          color: "rgba(255,255,255,0.3)",
                          fontFamily: "var(--font-mono, monospace)",
                        }}
                      >
                        {device.screenWidth}x{device.screenHeight}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* footer */}
        {active.length > 0 && (
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
              {active.length}/{MAX_CONCURRENT_PREVIEWS} active
            </span>
            <button
              type="button"
              onClick={closeAll}
              className="dp-close-all-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.08)",
                color: "rgba(239,68,68,0.8)",
                fontSize: 10,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} size={11} />
              Close All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
