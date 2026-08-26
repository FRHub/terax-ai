import {
  Cancel01Icon,
  Minimize02Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useRef, useState } from "react";
import type { DeviceProfile } from "./lib/devices";

type Props = {
  device: DeviceProfile;
  url: string;
  scale: number;
  nonce: number;
  customSize?: { width: number; height: number };
  onPointerDown: (e: React.PointerEvent) => void;
  onReload: () => void;
  onClose: () => void;
  onToggleCollapse: () => void;
  onResize?: (size: { width: number; height: number }) => void;
};

export function DeviceFrame({
  device,
  url,
  scale,
  nonce,
  customSize,
  onPointerDown,
  onReload,
  onClose,
  onToggleCollapse,
  onResize,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const isPhone = device.category === "phone";
  const isTablet = device.category === "tablet";
  const isLaptop = device.category === "laptop";
  const isResponsive = device.category === "responsive";

  const effectiveWidth = customSize?.width ?? device.screenWidth;
  const effectiveHeight = customSize?.height ?? device.screenHeight;

  const bezelPad = isResponsive ? 6 : isLaptop ? 8 : isTablet ? 14 : 16;
  const topBezel = isResponsive ? 28 : isPhone ? 44 : isTablet ? 24 : 32;
  const bottomBezel = isResponsive
    ? 14
    : isPhone
      ? 28
      : isTablet
        ? 22
        : isLaptop
          ? 16
          : 18;

  const frameWidth = effectiveWidth * scale + bezelPad * 2;
  const frameHeight = effectiveHeight * scale + topBezel + bottomBezel;

  const resizeState = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const handleResizeStart = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 || !onResize) return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: effectiveWidth,
        startH: effectiveHeight,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [effectiveWidth, effectiveHeight, onResize],
  );

  const handleResizeMove = useCallback(
    (e: React.PointerEvent) => {
      const s = resizeState.current;
      if (!s || !onResize) return;
      const dw = (e.clientX - s.startX) / scale;
      const dh = (e.clientY - s.startY) / scale;
      onResize({
        width: s.startW + dw,
        height: s.startH + dh,
      });
    },
    [scale, onResize],
  );

  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    resizeState.current = null;
    setIsResizing(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const scalePct = `${Math.round(scale * 100)}%`;

  return (
    <div
      className={`dp-device-frame dp-device-${device.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: frameWidth,
        height: frameHeight,
        borderRadius: device.bezelRadius * scale,
        backgroundColor: device.color,
        position: "relative",
        overflow: isResponsive ? "visible" : "hidden",
        boxShadow: isPhone
          ? "0 28px 80px -12px rgba(0,0,0,0.7), 0 12px 28px -6px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.2)"
          : isLaptop
            ? "0 32px 90px -15px rgba(0,0,0,0.8), 0 12px 32px -8px rgba(0,0,0,0.6), 0 0 0 1.5px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.15)"
            : "0 24px 70px -10px rgba(0,0,0,0.65), 0 10px 24px -5px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.16)",
        userSelect: "none",
        transition: isResizing ? "none" : "box-shadow 0.2s ease",
      }}
    >
      {/* Side button accents for iPhone 16 Pro */}
      {device.id === "iphone-16-pro" && (
        <>
          {/* Action button (left top) */}
          <div
            style={{
              position: "absolute",
              left: -2.5,
              top: 80 * scale,
              width: 3,
              height: 24 * scale,
              borderRadius: "2px 0 0 2px",
              backgroundColor: "#3a3937",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.5)",
            }}
          />
          {/* Volume up (left) */}
          <div
            style={{
              position: "absolute",
              left: -2.5,
              top: 120 * scale,
              width: 3,
              height: 42 * scale,
              borderRadius: "2px 0 0 2px",
              backgroundColor: "#3a3937",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.5)",
            }}
          />
          {/* Volume down (left) */}
          <div
            style={{
              position: "absolute",
              left: -2.5,
              top: 172 * scale,
              width: 3,
              height: 42 * scale,
              borderRadius: "2px 0 0 2px",
              backgroundColor: "#3a3937",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.5)",
            }}
          />
          {/* Power button (right) */}
          <div
            style={{
              position: "absolute",
              right: -2.5,
              top: 140 * scale,
              width: 3,
              height: 60 * scale,
              borderRadius: "0 2px 2px 0",
              backgroundColor: "#3a3937",
              boxShadow: "1px 0 2px rgba(0,0,0,0.5)",
            }}
          />
        </>
      )}

      {/* Top Bezel & Drag Handle */}
      <div
        className="dp-bezel-top"
        onPointerDown={onPointerDown}
        onDoubleClick={onToggleCollapse}
        style={{
          height: topBezel,
          position: "relative",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${Math.max(10, bezelPad * scale)}px`,
        }}
      >
        {/* Device specs label & quick snap (fades in on hover) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: hovered || isResizing ? 0.95 : 0.4,
            transition: "opacity 0.15s ease",
            fontSize: Math.max(9, Math.min(11, 10 * scale)),
            fontFamily: "var(--font-sans, system-ui)",
            color: "rgba(255,255,255,0.85)",
            zIndex: 10,
          }}
        >
          <span style={{ fontWeight: 600 }}>{device.name}</span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9em" }}>
            {effectiveWidth}x{effectiveHeight} · {scalePct}
          </span>
        </div>

        {/* Realistic iPhone 16 Pro Dynamic Island & Speaker */}
        {device.id === "iphone-16-pro" && (
          <>
            {/* Speaker receiver ear-slit */}
            <div
              style={{
                position: "absolute",
                top: 4 * scale,
                left: "50%",
                transform: "translateX(-50%)",
                width: 48 * scale,
                height: 2.5 * scale,
                borderRadius: 2 * scale,
                backgroundColor: "#0d0d0e",
                border: "0.5px solid rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />
            {/* Dynamic Island capsule with camera optics */}
            <div
              className="dp-dynamic-island"
              style={{
                position: "absolute",
                top: 10 * scale,
                left: "50%",
                transform: "translateX(-50%)",
                width: 92 * scale,
                height: 25 * scale,
                borderRadius: 14 * scale,
                backgroundColor: "#000",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                paddingRight: 10 * scale,
              }}
            >
              {/* Front Camera with optical glint */}
              <div
                style={{
                  width: 9 * scale,
                  height: 9 * scale,
                  borderRadius: "50%",
                  backgroundColor: "#050711",
                  border: "1px solid #111a2e",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "20%",
                    width: 3 * scale,
                    height: 3 * scale,
                    borderRadius: "50%",
                    backgroundColor: "rgba(56, 189, 248, 0.4)",
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* iPhone SE Top Speaker & Camera */}
        {device.id === "iphone-se" && (
          <div
            style={{
              position: "absolute",
              top: 14 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 8 * scale,
              pointerEvents: "none",
            }}
          >
            {/* Camera */}
            <div
              style={{
                width: 6 * scale,
                height: 6 * scale,
                borderRadius: "50%",
                backgroundColor: "#080808",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            {/* Speaker bar */}
            <div
              style={{
                width: 46 * scale,
                height: 3 * scale,
                borderRadius: 2 * scale,
                backgroundColor: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>
        )}

        {/* Pixel 9 & Galaxy Punch hole camera */}
        {(device.id === "pixel-9" || device.id === "galaxy-s24") && (
          <div
            style={{
              position: "absolute",
              top: 10 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 10 * scale,
              height: 10 * scale,
              borderRadius: "50%",
              backgroundColor: "#000",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* iPad Top FaceTime Camera */}
        {isTablet && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 6 * scale,
              height: 6 * scale,
              borderRadius: "50%",
              backgroundColor: "#080808",
              border: "1px solid rgba(255,255,255,0.08)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* MacBook Air 13" Notch & Camera */}
        {isLaptop && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 72 * scale,
              height: 14 * scale,
              borderRadius: `0 0 ${4 * scale}px ${4 * scale}px`,
              backgroundColor: "#000",
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: 5 * scale,
                height: 5 * scale,
                borderRadius: "50%",
                backgroundColor: "#080808",
                border: "0.5px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
        )}

        {/* Micro Action Buttons (Top Right) */}
        <div
          className="dp-no-drag"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: hovered ? 1 : 0.6,
            transition: "opacity 0.15s ease",
            zIndex: 20,
          }}
        >
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onReload();
            }}
            className="dp-bezel-btn"
            title="Reload preview"
          >
            <HugeiconsIcon
              icon={Refresh01Icon}
              size={12}
              color="rgba(255,255,255,0.9)"
            />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className="dp-bezel-btn"
            title="Minimize"
          >
            <HugeiconsIcon
              icon={Minimize02Icon}
              size={12}
              color="rgba(255,255,255,0.9)"
            />
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="dp-bezel-btn dp-bezel-close"
            title="Close"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={12}
              color="rgba(255,255,255,0.95)"
            />
          </button>
        </div>
      </div>

      {/* Screen viewport */}
      <div
        className="dp-screen"
        style={{
          width: effectiveWidth * scale,
          height: effectiveHeight * scale,
          margin: `0 ${bezelPad}px`,
          position: "relative",
          overflow: "hidden",
          borderRadius: isPhone
            ? Math.max(0, (device.bezelRadius - bezelPad) * scale)
            : isTablet
              ? Math.max(0, (device.bezelRadius - bezelPad + 2) * scale)
              : isResponsive
                ? 8 * scale
                : 2,
          background: "#fff",
        }}
      >
        {/* Subtle glass reflection overlay */}
        <div
          className="dp-screen-reflection"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.02) 100%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {url ? (
          <iframe
            key={`${device.id}-${nonce}`}
            src={url}
            title={`${device.name} preview`}
            style={{
              width: effectiveWidth,
              height: effectiveHeight,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              display: "block",
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              color: "rgba(0,0,0,0.3)",
              fontSize: 12 * scale,
              fontFamily: "var(--font-sans, system-ui)",
            }}
          >
            No URL
          </div>
        )}
      </div>

      {/* Bottom bezel (Home indicator / MacBook lip / iPhone SE home button) */}
      <div
        className="dp-bezel-bottom"
        onPointerDown={onPointerDown}
        onDoubleClick={onToggleCollapse}
        style={{
          height: bottomBezel,
          position: "relative",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Modern Home Indicator Bar for iPhone 16 / Pixel */}
        {isPhone && device.id !== "iphone-se" && (
          <div
            className="dp-home-indicator"
            style={{
              width: 104 * scale,
              height: 4 * scale,
              borderRadius: 2 * scale,
              backgroundColor: "rgba(255,255,255,0.22)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* iPhone SE Touch ID Home Button */}
        {device.id === "iphone-se" && (
          <div
            style={{
              width: 18 * scale,
              height: 18 * scale,
              borderRadius: "50%",
              border: "1.5px solid rgba(255,255,255,0.18)",
              backgroundColor: "#161618",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* MacBook Open Notch Recess */}
        {isLaptop && (
          <div
            style={{
              width: 60 * scale,
              height: 4 * scale,
              borderRadius: `0 0 ${3 * scale}px ${3 * scale}px`,
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Free Resize Handle for Responsive Device */}
      {isResponsive && onResize && (
        <div
          className="dp-resize-handle"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          title="Drag to resize viewport"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 20,
            height: 20,
            cursor: "nwse-resize",
            zIndex: 30,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            padding: "0 3px 3px 0",
          }}
        >
          {/* Resize corner grip lines */}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            style={{ opacity: hovered || isResizing ? 0.9 : 0.4 }}
          >
            <path
              d="M9 1L1 9M9 5L5 9M9 8L8 9"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
