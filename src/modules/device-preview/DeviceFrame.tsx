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
  isDragging?: boolean;
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
  isDragging,
  onPointerDown,
  onReload,
  onClose,
  onToggleCollapse,
  onResize,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSpenPopped, setIsSpenPopped] = useState(false);

  const isPhone = device.category === "phone";
  const isTablet = device.category === "tablet";
  const isLaptop = device.category === "laptop";
  const isResponsive = device.category === "responsive";

  const isIphone17Pro = device.id === "iphone-17-pro";
  const isHuaweiPura = device.id === "huawei-pura-80-ultra";
  const isGalaxyS26 = device.id === "galaxy-s26-ultra";
  const isIphone16Pro = device.id === "iphone-16-pro";

  const effectiveWidth = customSize?.width ?? device.screenWidth;
  const effectiveHeight = customSize?.height ?? device.screenHeight;

  // Exact real-device bezel thickness calibration:
  // Modern flagship smartphones have razor-thin ~1.5mm uniform bezels (4px in CSS)
  const bezelPad = isPhone
    ? Math.max(3, 4 * scale)
    : isResponsive
      ? 6
      : isLaptop
        ? 8
        : isTablet
          ? 10
          : 4;

  const topBezel = isPhone
    ? bezelPad
    : isResponsive
      ? 26
      : isLaptop
        ? 18
        : isTablet
          ? 16
          : bezelPad;

  const bottomBezel = isPhone
    ? bezelPad
    : isResponsive
      ? 14
      : isLaptop
        ? 16
        : isTablet
          ? 16
          : bezelPad;

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

  // Determine frame gradient based on device finish
  const frameBackground = isIphone17Pro
    ? "linear-gradient(135deg, #d9692e 0%, #b8501f 40%, #943a11 100%)"
    : isHuaweiPura
      ? "linear-gradient(135deg, #2b2e36 0%, #1a1c21 50%, #111215 100%)"
      : isGalaxyS26
        ? "linear-gradient(145deg, #f7f1e6 0%, #ede5d6 50%, #ddd3c0 100%)"
        : device.color;

  return (
    <div
      className={`dp-device-frame dp-device-${device.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: frameWidth,
        height: frameHeight,
        borderRadius: device.bezelRadius * scale,
        background: frameBackground,
        position: "relative",
        overflow: "visible",
        userSelect: "none",
        transition: isResizing || isDragging ? "none" : "box-shadow 0.2s ease",
      }}
    >
      {/* Floating Glass Controls Header for Phones */}
      <div
        className="dp-floating-header"
        style={{
          position: "absolute",
          top: -34,
          left: "50%",
          transform: "translateX(-50%)",
          height: 28,
          padding: "0 8px 0 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(18, 18, 24, 0.92)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 14,
          boxShadow: "0 8px 28px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.4)",
          opacity: hovered || isResizing || isDragging ? 1 : 0.25,
          transition: "opacity 0.2s ease",
          zIndex: 60,
          whiteSpace: "nowrap",
          color: "rgba(255, 255, 255, 0.9)",
          fontFamily: "var(--font-sans, system-ui)",
        }}
      >
        {/* Dedicated Grab Handle with Grip Dots */}
        <div
          onPointerDown={onPointerDown}
          onDoubleClick={onToggleCollapse}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: isDragging ? "grabbing" : "grab",
            padding: "2px 4px",
            borderRadius: 4,
          }}
          title="Drag to move"
        >
          <svg
            width="6"
            height="12"
            viewBox="0 0 6 12"
            fill="rgba(255,255,255,0.4)"
            style={{ flexShrink: 0 }}
          >
            <circle cx="1.5" cy="2" r="1" />
            <circle cx="4.5" cy="2" r="1" />
            <circle cx="1.5" cy="6" r="1" />
            <circle cx="4.5" cy="6" r="1" />
            <circle cx="1.5" cy="10" r="1" />
            <circle cx="4.5" cy="10" r="1" />
          </svg>
          <span style={{ fontSize: 11, fontWeight: 550, color: "#fff" }}>
            {device.name}
          </span>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: "var(--font-mono, monospace)" }}>
            {effectiveWidth}x{effectiveHeight}
          </span>
        </div>

        <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.15)" }} />

        {/* Actions in floating header */}
        <div className="dp-no-drag" style={{ display: "flex", alignItems: "center", gap: 3 }}>
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

      {/* S-Pen Stylus Accessory for Galaxy S26 Ultra */}
      {isGalaxyS26 && (
        <div
          className="dp-spen-accessory dp-no-drag"
          onClick={() => setIsSpenPopped((v) => !v)}
          title={isSpenPopped ? "Click to dock S-Pen" : "Click to eject S-Pen"}
          style={{
            position: "absolute",
            left: -18 * scale,
            bottom: isSpenPopped ? 40 * scale : 20 * scale,
            width: 7 * scale,
            height: 180 * scale,
            borderRadius: `${3 * scale}px ${3 * scale}px ${1 * scale}px ${1 * scale}px`,
            background: "linear-gradient(90deg, #faf7f2, #ece4d4)",
            boxShadow: "-3px 6px 16px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(0,0,0,0.15)",
            zIndex: 40,
            cursor: "pointer",
            transform: isSpenPopped ? "rotate(-12deg) translateY(-20px)" : "rotate(-3deg)",
            transformOrigin: "bottom center",
            transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${2 * scale}px 0`,
          }}
        >
          {/* Clicky Top Button */}
          <div
            style={{
              width: 5 * scale,
              height: 10 * scale,
              borderRadius: `${1.5 * scale}px ${1.5 * scale}px 0 0`,
              background: "#dcd1bd",
              borderBottom: "1px solid rgba(0,0,0,0.2)",
            }}
          />
          {/* Stylus Side Click Button */}
          <div
            style={{
              width: 3 * scale,
              height: 24 * scale,
              borderRadius: 1.5 * scale,
              background: "#ded4c2",
              boxShadow: "inset 0 1px 1px rgba(0,0,0,0.2)",
            }}
          />
          {/* Fine Cone Tip */}
          <div
            style={{
              width: 3 * scale,
              height: 8 * scale,
              borderRadius: "0 0 50% 50%",
              background: "#2b2b2b",
            }}
          />
        </div>
      )}

      {/* Side Hardware: iPhone 17 Pro */}
      {isIphone17Pro && (
        <>
          {/* Action Button (left top) */}
          <div
            style={{
              position: "absolute",
              left: -3,
              top: 76 * scale,
              width: 3.5,
              height: 24 * scale,
              borderRadius: "2px 0 0 2px",
              backgroundColor: "#732c0b",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,160,0.3)",
            }}
          />
          {/* Volume Up */}
          <div
            style={{
              position: "absolute",
              left: -3,
              top: 114 * scale,
              width: 3.5,
              height: 42 * scale,
              borderRadius: "2px 0 0 2px",
              backgroundColor: "#732c0b",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,160,0.3)",
            }}
          />
          {/* Volume Down */}
          <div
            style={{
              position: "absolute",
              left: -3,
              top: 168 * scale,
              width: 3.5,
              height: 42 * scale,
              borderRadius: "2px 0 0 2px",
              backgroundColor: "#732c0b",
              boxShadow: "-1px 0 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,160,0.3)",
            }}
          />
          {/* Power / Siri Button (right top) */}
          <div
            style={{
              position: "absolute",
              right: -3,
              top: 130 * scale,
              width: 3.5,
              height: 58 * scale,
              borderRadius: "0 2px 2px 0",
              backgroundColor: "#732c0b",
              boxShadow: "1px 0 2px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,200,160,0.3)",
            }}
          />
          {/* Camera Control / Capture Button (right bottom) */}
          <div
            style={{
              position: "absolute",
              right: -3,
              top: 480 * scale,
              width: 3.5,
              height: 48 * scale,
              borderRadius: "0 1.5px 1.5px 0",
              backgroundColor: "#5a2107",
              border: "0.5px solid rgba(255, 180, 130, 0.4)",
              borderLeft: "none",
              boxShadow: "1px 0 3px rgba(0,0,0,0.6)",
            }}
            title="iPhone 17 Pro Camera Control Button"
          />
        </>
      )}

      {/* Side Hardware: Huawei Pura 80 Ultra */}
      {isHuaweiPura && (
        <>
          {/* Volume Rocker Bar (right) */}
          <div
            style={{
              position: "absolute",
              right: -2.5,
              top: 120 * scale,
              width: 3,
              height: 68 * scale,
              borderRadius: "0 2px 2px 0",
              backgroundColor: "#2c2f37",
              boxShadow: "1px 0 2px rgba(0,0,0,0.6)",
            }}
          />
          {/* Power Button with Red Signature Accent Line */}
          <div
            style={{
              position: "absolute",
              right: -2.5,
              top: 204 * scale,
              width: 3,
              height: 36 * scale,
              borderRadius: "0 2px 2px 0",
              backgroundColor: "#2c2f37",
              boxShadow: "1px 0 2px rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 1.5,
                height: 12 * scale,
                backgroundColor: "#e11d48",
                borderRadius: 1,
              }}
            />
          </div>
        </>
      )}

      {/* Side Hardware: Samsung Galaxy S26 Ultra */}
      {isGalaxyS26 && (
        <>
          {/* Volume Rocker (right) */}
          <div
            style={{
              position: "absolute",
              right: -2.5,
              top: 130 * scale,
              width: 3,
              height: 66 * scale,
              borderRadius: "0 2px 2px 0",
              backgroundColor: "#d5cabb",
              boxShadow: "1px 0 2px rgba(0,0,0,0.3)",
            }}
          />
          {/* Power Button (right) */}
          <div
            style={{
              position: "absolute",
              right: -2.5,
              top: 216 * scale,
              width: 3,
              height: 38 * scale,
              borderRadius: "0 2px 2px 0",
              backgroundColor: "#d5cabb",
              boxShadow: "1px 0 2px rgba(0,0,0,0.3)",
            }}
          />
        </>
      )}

      {/* Side button accents for iPhone 16 Pro */}
      {isIphone16Pro && (
        <>
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

      {/* Outer Titanium Bezel Drag Handle */}
      <div
        onPointerDown={onPointerDown}
        onDoubleClick={onToggleCollapse}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          cursor: isDragging ? "grabbing" : "grab",
          pointerEvents: "auto",
          zIndex: 1,
        }}
      />

      {/* Screen Viewport */}
      <div
        className="dp-screen-wrapper"
        style={{
          position: "relative",
          width: effectiveWidth * scale,
          height: effectiveHeight * scale,
          margin: `${topBezel}px ${bezelPad}px ${bottomBezel}px`,
          zIndex: 2,
          borderRadius: isPhone
            ? Math.max(0, (device.bezelRadius - bezelPad) * scale)
            : isTablet
              ? Math.max(0, (device.bezelRadius - bezelPad + 2) * scale)
              : isResponsive
                ? 8 * scale
                : 2,
          overflow: "hidden",
          background: "#fff",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
        }}
      >
        {/* Realistic iPhone 17 Pro Dynamic Island & Speaker */}
        {isIphone17Pro && (
          <>
            <div
              style={{
                position: "absolute",
                top: 1.5 * scale,
                left: "50%",
                transform: "translateX(-50%)",
                width: 48 * scale,
                height: 2 * scale,
                borderRadius: 1 * scale,
                backgroundColor: "#110905",
                border: "0.5px solid rgba(255,255,255,0.1)",
                pointerEvents: "none",
                zIndex: 12,
              }}
            />
            <div
              className="dp-dynamic-island"
              style={{
                position: "absolute",
                top: 8 * scale,
                left: "50%",
                transform: "translateX(-50%)",
                width: 96 * scale,
                height: 25 * scale,
                borderRadius: 13 * scale,
                backgroundColor: "#000",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.7)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `0 ${10 * scale}px`,
                zIndex: 12,
              }}
            >
              <div
                style={{
                  width: 7 * scale,
                  height: 7 * scale,
                  borderRadius: "50%",
                  backgroundColor: "#0a0a0c",
                  border: "1px solid #1a1a24",
                }}
              />
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
                  className="dp-lens-glint-active"
                  style={{
                    position: "absolute",
                    top: "20%",
                    left: "20%",
                    width: 3 * scale,
                    height: 3 * scale,
                    borderRadius: "50%",
                    backgroundColor: "rgba(56, 189, 248, 0.6)",
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Realistic iPhone 16 Pro Dynamic Island */}
        {isIphone16Pro && (
          <div
            className="dp-dynamic-island"
            style={{
              position: "absolute",
              top: 8 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 92 * scale,
              height: 24 * scale,
              borderRadius: 12 * scale,
              backgroundColor: "#000",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingRight: 10 * scale,
              zIndex: 12,
            }}
          >
            <div
              style={{
                width: 9 * scale,
                height: 9 * scale,
                borderRadius: "50%",
                backgroundColor: "#050711",
                border: "1px solid #111a2e",
              }}
            />
          </div>
        )}

        {/* Huawei Pura 80 Ultra Punch hole */}
        {isHuaweiPura && (
          <div
            style={{
              position: "absolute",
              top: 8 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 9 * scale,
              height: 9 * scale,
              borderRadius: "50%",
              backgroundColor: "#000",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.7)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 12,
            }}
          >
            <div
              style={{
                width: 3 * scale,
                height: 3 * scale,
                borderRadius: "50%",
                backgroundColor: "rgba(45, 212, 191, 0.6)",
              }}
            />
          </div>
        )}

        {/* Samsung Galaxy S26 Ultra Infinity-O Punch hole */}
        {isGalaxyS26 && (
          <div
            style={{
              position: "absolute",
              top: 8 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 8 * scale,
              height: 8 * scale,
              borderRadius: "50%",
              backgroundColor: "#000",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 12,
            }}
          >
            <div
              style={{
                width: 2.5 * scale,
                height: 2.5 * scale,
                borderRadius: "50%",
                backgroundColor: "rgba(96, 165, 250, 0.5)",
              }}
            />
          </div>
        )}

        {/* Home indicator bar inside the display */}
        {isPhone && device.id !== "iphone-se" && (
          <div
            className="dp-home-indicator"
            style={{
              position: "absolute",
              bottom: 6 * scale,
              left: "50%",
              transform: "translateX(-50%)",
              width: 104 * scale,
              height: 4 * scale,
              borderRadius: 2 * scale,
              backgroundColor: "rgba(0, 0, 0, 0.35)",
              boxShadow: "0 0 1px rgba(255,255,255,0.4)",
              pointerEvents: "none",
              zIndex: 12,
            }}
          />
        )}

        {/* Quad-curved micro 2.5D glass effect for Huawei */}
        {isHuaweiPura && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.35)",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        )}

        {/* Subtle glass reflection overlay */}
        <div
          className="dp-screen-reflection"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.02) 100%)",
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
