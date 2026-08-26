import { SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef } from "react";
import { useDevicePreviewStore } from "./lib/useDevicePreviewStore";

export function DevicePreviewFab() {
  const activeCount = useDevicePreviewStore((s) => s.active.length);
  const togglePicker = useDevicePreviewStore((s) => s.togglePicker);
  const pickerOpen = useDevicePreviewStore((s) => s.pickerOpen);
  const fabRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    togglePicker();
  }, [togglePicker]);

  return (
    <button
      ref={fabRef}
      type="button"
      onClick={handleClick}
      id="device-preview-fab"
      title="Device Preview"
      className={`dp-fab ${activeCount > 0 ? "dp-fab-active" : ""} ${pickerOpen ? "dp-fab-open" : ""}`}
      style={{
        position: "fixed",
        bottom: 48,
        right: 16,
        zIndex: 9997,
        width: 40,
        height: 40,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        background:
          activeCount > 0
            ? "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(129,140,248,0.85))"
            : "rgba(28, 28, 34, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:
          activeCount > 0
            ? "0 4px 16px rgba(99,102,241,0.3), 0 2px 6px rgba(0,0,0,0.3)"
            : "0 4px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      <HugeiconsIcon icon={SmartPhone01Icon} size={18} />

      {/* badge */}
      {activeCount > 0 && (
        <div
          className="dp-fab-badge"
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: "#ef4444",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            fontFamily: "var(--font-sans, system-ui)",
          }}
        >
          {activeCount}
        </div>
      )}
    </button>
  );
}
