/* eslint-disable no-empty */
import React, { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

function BarcodeScanner({ onScan, onClose }) {
  const scannerId = "barcode-scanner-div";
  const html5QrCodeRef = useRef(null);
  const scannerInitializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    if (scannerInitializedRef.current) {
      console.log("[BarcodeScanner] Scanner already initialized, skipping.");
      return;
    }
    scannerInitializedRef.current = true;
    const config = {
      fps: 10,
      qrbox: 250,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A,
      ],
    };
    console.log("[BarcodeScanner] Initializing Html5Qrcode...");
    html5QrCodeRef.current = new Html5Qrcode(scannerId);
    html5QrCodeRef.current
      .start({ facingMode: "environment" }, config, (decodedText) => {
        if (isMounted) {
          console.log("[BarcodeScanner] Barcode scanned:", decodedText);
          const state = html5QrCodeRef.current.getState();
          if (state === 2 || state === 3) {
            html5QrCodeRef.current.stop().then(() => {
              onScan(decodedText);
            });
          } else {
            onScan(decodedText);
          }
        }
      })
      .then(() => {
        console.log("[BarcodeScanner] Camera started successfully.");
      })
      .catch((err) => {
        console.error("[BarcodeScanner] Camera start failed:", err);
        alert("Camera error: " + err);
        onClose();
      });
    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          const state = html5QrCodeRef.current.getState();
          if (state === 2 || state === 3) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current.clear();
        } catch {}
      }
      scannerInitializedRef.current = false;
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
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
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={async () => {
            if (html5QrCodeRef.current) {
              try {
                const state = html5QrCodeRef.current.getState();
                if (state === 2 || state === 3) {
                  await html5QrCodeRef.current.stop();
                }
                await html5QrCodeRef.current.clear();
              } catch {}
            }
            onClose();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default BarcodeScanner;
