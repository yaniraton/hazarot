# Hazarot - Product Manager

A mobile-first React app for managing a product list, scanning barcodes, and exporting to PDF (with full Hebrew/RTL support).

## Features

- 📦 Add, edit, and delete products (barcode, name, quantity)
- 📷 Barcode scanning using your device camera (html5-qrcode)
- 📝 Scrollable, responsive product list
- 🖨️ Export product list to PDF (RTL, Hebrew, custom font)
- 🚀 Deploy to GitHub Pages with a single script
- 🇮🇱 Full Hebrew UI and PDF support

## Demo
[Live on GitHub Pages](https://yaniraton.github.io/hazarot/)

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/yaniraton/hazarot.git
   cd hazarot
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Run locally:**
   ```sh
   npm run dev
   ```
4. **Build for production:**
   ```sh
   npm run build
   ```
5. **Deploy to GitHub Pages:**
   ```powershell
   ./deploy.ps1 -Message "Your commit message"
   ```

## Project Structure

- `src/` — React source code
- `src/components/` — UI components (Product, ProductList, ProductForm, BarcodeScanner)
- `src/fonts/` — Custom font for Hebrew PDF export
- `public/` — Static assets
- `deploy.ps1` — PowerShell deploy script

## Barcode Scanning
- Uses [html5-qrcode](https://github.com/mebjas/html5-qrcode) for camera-based scanning
- Works on most modern mobile and desktop browsers

## PDF Export
- Uses [jsPDF](https://github.com/parallax/jsPDF) and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- Hebrew/RTL support with custom font

## License
MIT

---

Made with ❤️ by [yaniraton](https://github.com/yaniraton)
