import { useEffect } from "react";
import { DevicePickerPopover } from "./DevicePickerPopover";
import { DevicePreviewPortal } from "./DevicePreviewPortal";
import { useDevicePreviewStore } from "./lib/useDevicePreviewStore";
import "./device-preview.css";

type Props = {
  previewUrl?: string;
};

export function DevicePreviewManager({ previewUrl }: Props) {
  const active = useDevicePreviewStore((s) => s.active);
  const pickerOpen = useDevicePreviewStore((s) => s.pickerOpen);
  const url = useDevicePreviewStore((s) => s.url);
  const setUrl = useDevicePreviewStore((s) => s.setUrl);

  useEffect(() => {
    if (previewUrl && previewUrl !== url) {
      setUrl(previewUrl);
    }
  }, [previewUrl, url, setUrl]);

  const effectiveUrl = url || previewUrl || "";

  return (
    <>
      {pickerOpen && <DevicePickerPopover />}

      {active.map((preview) => (
        <DevicePreviewPortal
          key={preview.deviceId}
          preview={preview}
          url={effectiveUrl}
        />
      ))}
    </>
  );
}
