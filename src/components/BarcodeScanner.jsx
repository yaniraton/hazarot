/* eslint-disable no-empty */
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: 250,
  formatsToSupport: [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
  ],
};

function getFriendlyErrorMessage(err) {
  const message = err?.name || err?.message || String(err);
  const lower = message.toLowerCase();

  if (!window.isSecureContext) {
    return "המצלמה זמינה רק בחיבור מאובטח (HTTPS). פתחו את האתר בכתובת https.";
  }

  if (
    lower.includes("notallowed") ||
    lower.includes("permission") ||
    lower.includes("denied")
  ) {
    return "אין גישה למצלמה. אשרו הרשאת מצלמה לאתר בהגדרות הדפדפן, ואם פתחתם מתוך וואטסאפ — פתחו את הקישור ב-Safari.";
  }

  if (lower.includes("notfound") || lower.includes("overconstrained")) {
    return "לא נמצאה מצלמה מתאימה במכשיר.";
  }

  if (lower.includes("notreadable") || lower.includes("trackstart")) {
    return "המצלמה תפוסה על ידי אפליקציה אחרת. סגרו אותה ונסו שוב.";
  }

  return "שגיאת מצלמה: " + message;
}

async function requestCameraPermission() {
  if (!window.isSecureContext) {
    throw new Error("INSECURE_CONTEXT");
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera API not available in this browser.");
  }

  // Call getUserMedia directly inside the user-gesture handler.
  // html5-qrcode does async DOM work before its own getUserMedia call,
  // which breaks iOS Safari's transient activation window and causes
  // NotAllowedError without showing a permission prompt.
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: "environment" } },
  });
  stream.getTracks().forEach((track) => track.stop());
}

async function startWithFallback(scanner, onSuccess) {
  try {
    await scanner.start(
      { facingMode: "environment" },
      SCANNER_CONFIG,
      onSuccess
    );
    return;
  } catch (facingModeError) {
    console.warn(
      "[BarcodeScanner] facingMode start failed, trying camera list:",
      facingModeError
    );
  }

  const cameras = await Html5Qrcode.getCameras();
  if (!cameras || cameras.length === 0) {
    throw new Error("NotFoundError: no cameras found");
  }

  const backCamera =
    cameras.find((cam) => /back|rear|environment/i.test(cam.label)) ||
    cameras[cameras.length - 1];

  await scanner.start(backCamera.id, SCANNER_CONFIG, onSuccess);
}

function BarcodeScanner({ onScan, onClose }) {
  const scannerId = "barcode-scanner-div";
  const html5QrCodeRef = useRef(null);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  const [status, setStatus] = useState("idle"); // idle | starting | scanning | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    return () => {
      const scanner = html5QrCodeRef.current;
      if (!scanner) return;
      try {
        const state = scanner.getState();
        if (state === 2 || state === 3) {
          scanner.stop().catch(() => {});
        }
        scanner.clear();
      } catch {}
      html5QrCodeRef.current = null;
    };
  }, []);

  const handleStartCamera = async () => {
    if (status === "starting" || status === "scanning") return;

    setStatus("starting");
    setErrorMessage("");

    try {
      await requestCameraPermission();

      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerId);
      }

      await startWithFallback(html5QrCodeRef.current, (decodedText) => {
        console.log("[BarcodeScanner] Barcode scanned:", decodedText);
        const scanner = html5QrCodeRef.current;
        if (!scanner) {
          onScanRef.current(decodedText);
          return;
        }

        const state = scanner.getState();
        if (state === 2 || state === 3) {
          scanner
            .stop()
            .catch(() => {})
            .finally(() => onScanRef.current(decodedText));
        } else {
          onScanRef.current(decodedText);
        }
      });

      console.log("[BarcodeScanner] Camera started successfully.");
      setStatus("scanning");
    } catch (err) {
      console.error("[BarcodeScanner] Camera start failed:", err);
      setStatus("error");
      setErrorMessage(getFriendlyErrorMessage(err));
    }
  };

  const handleClose = async () => {
    const scanner = html5QrCodeRef.current;
    if (scanner) {
      try {
        const state = scanner.getState();
        if (state === 2 || state === 3) {
          await scanner.stop();
        }
        await scanner.clear();
      } catch {}
      html5QrCodeRef.current = null;
    }
    onCloseRef.current();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50"
      dir="rtl"
    >
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-xs flex flex-col items-center">
        <div
          id={scannerId}
          style={{
            width: 250,
            height: 250,
            minHeight: 250,
            background: "#222",
          }}
        />

        {status !== "scanning" && (
          <div className="mt-3 w-full text-center space-y-2">
            {errorMessage ? (
              <p className="text-sm text-red-600 leading-relaxed">
                {errorMessage}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                לחצו כדי לאשר גישה למצלמה ולהתחיל בסריקה
              </p>
            )}
            <button
              type="button"
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
              onClick={handleStartCamera}
              disabled={status === "starting"}
            >
              {status === "starting"
                ? "פותח מצלמה..."
                : errorMessage
                  ? "נסו שוב"
                  : "הפעלת מצלמה"}
            </button>
          </div>
        )}

        <button
          type="button"
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleClose}
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

export default BarcodeScanner;
