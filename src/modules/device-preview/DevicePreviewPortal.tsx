import { Cancel01Icon, Maximize02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DeviceFrame } from "./DeviceFrame";
import { deviceById } from "./lib/devices";
import {
  type ActivePreview,
  useDevicePreviewStore,
} from "./lib/useDevicePreviewStore";

type Props = {
  preview: ActivePreview;
  url: string;
};

export function DevicePreviewPortal({ preview, url }: Props) {
  const device = deviceById(preview.deviceId);
  const removeDevice = useDevicePreviewStore((s) => s.removeDevice);
  const updatePosition = useDevicePreviewStore((s) => s.updatePosition);
  const updateScale = useDevicePreviewStore((s) => s.updateScale);
  const updateSize = useDevicePreviewStore((s) => s.updateSize);
  const toggleCollapse = useDevicePreviewStore((s) => s.toggleCollapse);

  const [nonce, setNonce] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, .dp-no-drag, .dp-resize-handle, input, iframe")) return;

      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        originX: preview.position.x,
        originY: preview.position.y,
      };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const s = dragState.current;
        if (!s) return;
        const dx = moveEvent.clientX - s.startX;
        const dy = moveEvent.clientY - s.startY;
        updatePosition(preview.deviceId, {
          x: Math.max(0, s.originX + dx),
          y: Math.max(0, s.originY + dy),
        });
      };

      const handlePointerUp = () => {
        dragState.current = null;
        setIsDragging(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);
    },
    [preview.position, preview.deviceId, updatePosition],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      updateScale(preview.deviceId, preview.scale + delta);
    },
    [preview.deviceId, preview.scale, updateScale],
  );

  const handleResize = useCallback(
    (size: { width: number; height: number }) => {
      updateSize(preview.deviceId, size);
    },
    [preview.deviceId, updateSize],
  );

  if (!device) return null;

  const panel = (
    <>
      {/* Full-screen transparent overlay while dragging so iframes never steal pointer events */}
      {isDragging && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000000,
            cursor: "grabbing",
            userSelect: "none",
          }}
        />
      )}

      <div
        className="dp-portal-panel"
        data-device-id={preview.deviceId}
        style={{
          position: "fixed",
          top: preview.position.y,
          left: preview.position.x,
          zIndex: 99999,
          display: "inline-flex",
          animation: "dp-panel-enter 0.2s ease-out",
        }}
        onWheel={handleWheel}
      >
        {preview.collapsed ? (
          <div
            className="dp-collapsed-pill"
            onPointerDown={handleDragStart}
            onDoubleClick={() => toggleCollapse(preview.deviceId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 8px 0 10px",
              background: "rgba(22, 22, 28, 0.9)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3)",
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              color: "rgba(255,255,255,0.9)",
              fontSize: 11,
              fontFamily: "var(--font-sans, system-ui)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor:
                  device.category === "responsive"
                    ? "#a855f7"
                    : device.category === "phone"
                      ? "#4ade80"
                      : device.category === "tablet"
                        ? "#60a5fa"
                        : "#f472b6",
                flexShrink: 0,
              }}
            />
            <span style={{ fontWeight: 500 }}>{device.name}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
              {preview.customSize?.width ?? device.screenWidth}x
              {preview.customSize?.height ?? device.screenHeight}
            </span>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(preview.deviceId);
              }}
              className="dp-bezel-btn"
              title="Expand"
            >
              <HugeiconsIcon
                icon={Maximize02Icon}
                size={12}
                color="rgba(255,255,255,0.8)"
              />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeDevice(preview.deviceId);
              }}
              className="dp-bezel-btn dp-bezel-close"
              title="Close"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={12}
                color="rgba(255,255,255,0.8)"
              />
            </button>
          </div>
        ) : (
          <DeviceFrame
            device={device}
            url={url}
            scale={preview.scale}
            nonce={nonce}
            customSize={preview.customSize}
            isDragging={isDragging}
            onPointerDown={handleDragStart}
            onReload={() => setNonce((n) => n + 1)}
            onClose={() => removeDevice(preview.deviceId)}
            onToggleCollapse={() => toggleCollapse(preview.deviceId)}
            onResize={device.isResizable ? handleResize : undefined}
          />
        )}
      </div>
    </>
  );

  return createPortal(panel, document.body);
}
