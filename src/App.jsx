import { useState } from "react";
import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import Product from "./components/Product";
import React from "react";
import BarcodeScanner from "./components/BarcodeScanner";

import "./fonts/NotoSansHebrew-normal";

// Helper to reverse Hebrew text for jsPDF
function reverseHebrew(str) {
  // Only reverse if contains Hebrew (basic check)
  if (/[\u0590-\u05FF]/.test(str)) {
    return str.split("").reverse().join("");
  }
  return str;
}

function App() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    quantity: "",
  });
  const [showScanner, setShowScanner] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (formData.barcode && formData.name && formData.quantity) {
      setProducts((prev) => [
        ...prev,
        {
          id: Date.now(),
          barcode: formData.barcode,
          name: formData.name,
          quantity: parseInt(formData.quantity),
        },
      ]);
      setFormData({ barcode: "", name: "", quantity: "" });
    }
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity >= 1) {
      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, quantity: newQuantity } : product
        )
      );
    }
  };

  const handleExportToPDF = () => {
    try {
      applyPlugin(jsPDF);
      const doc = new jsPDF();

      // Add title (example in Hebrew)
      doc.setFont("NotoSansHebrew", "normal");
      doc.setFontSize(20);
      doc.text(reverseHebrew("רשימת מוצרים"), 200, 22, { align: "right" });

      // Prepare table data (reverse Hebrew fields)
      const tableData = products.map((product) => [
        reverseHebrew(product.barcode),
        reverseHebrew(product.name),
        product.quantity.toString(),
      ]);

      // Add table using autoTable
      doc.autoTable({
        head: [
          [
            reverseHebrew("ברקוד"),
            reverseHebrew("שם מוצר"),
            reverseHebrew("כמות"),
          ],
        ],
        body: tableData,
        startY: 30,
        styles: {
          fontSize: 12,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          font: "NotoSansHebrew",
          halign: "right",
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          halign: "right",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          halign: "right",
        },
        margin: { top: 30 },
      });

      // Save the PDF with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      doc.save(`product-list-${timestamp}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  };

  const handleScanBarcode = (code) => {
    setFormData((prev) => ({ ...prev, barcode: code }));
    setShowScanner(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col" dir="rtl" lang="he">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            מנהל מוצרים
          </h1>
          <p className="text-gray-600 text-sm">הוסיפו מוצרים וייצאו ל-PDF</p>
        </div>
      </header>

      {/* Add Product Section - Always Visible */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          הוספת מוצר חדש
        </h2>
        <form onSubmit={handleAddProduct} className="space-y-3">
          <div className="space-y-3">
            <div>
              <label
                htmlFor="barcode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ברקוד
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="הכניסו ברקוד"
                  required
                />
                <button
                  type="button"
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => setShowScanner(true)}
                  title="סרקו ברקוד"
                >
                  📷
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                שם מוצר
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="הכניסו שם מוצר"
                required
              />
            </div>
            <div>
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                כמות
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                placeholder="הכניסו כמות"
                min="1"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors duration-200 text-base"
          >
            הוסף מוצר
          </button>
        </form>
        {showScanner && (
          <BarcodeScanner
            onScan={handleScanBarcode}
            onClose={() => setShowScanner(false)}
          />
        )}
      </div>

      {/* Product List Section - Scrollable */}
      <div className="flex-1 bg-white flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            רשימת מוצרים ({products.length} פריטים)
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-3">📦</div>
              <p className="text-gray-500 text-base">לא נוספו מוצרים</p>
              <p className="text-gray-400 text-sm">
                הוסיפו את המוצר הראשון למעלה
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            {/* Mobile-friendly layout */}
            <div className="block sm:hidden">
              {products.map((product) => (
                <Product
                  key={product.id}
                  product={product}
                  onDelete={handleDeleteProduct}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>

            {/* Table layout for larger screens */}
            <div className="hidden sm:block">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ברקוד
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      שם מוצר
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      כמות
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <Product
                      key={product.id}
                      product={product}
                      onDelete={handleDeleteProduct}
                      onUpdateQuantity={handleUpdateQuantity}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Export Button */}
      <footer className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <button
          onClick={handleExportToPDF}
          disabled={products.length === 0}
          className={`w-full py-3 rounded-md font-medium transition-colors duration-200 text-base ${
            products.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {products.length === 0
            ? "אין מוצרים לייצוא"
            : `ייצוא ${products.length} מוצרים ל-PDF`}
        </button>
      </footer>
    </div>
  );
}

export default App;
