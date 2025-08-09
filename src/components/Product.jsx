import React from "react";

function Product({ product, onDelete, onUpdateQuantity }) {
  const handleIncreaseQuantity = () => {
    onUpdateQuantity(product.id, product.quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    if (product.quantity > 1) {
      onUpdateQuantity(product.id, product.quantity - 1);
    }
  };

  return (
    <>
      {/* Mobile-friendly card layout for phones */}
      <div className="block sm:hidden">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">{product.name}</p>
              <p className="text-sm font-mono text-gray-600 mb-2">
                Barcode: {product.barcode}
              </p>

              {/* Quantity controls for mobile */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDecreaseQuantity}
                    disabled={product.quantity <= 1}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${
                      product.quantity <= 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold min-w-[2rem] text-center">
                    {product.quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQuantity}
                    className="w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center text-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => onDelete(product.id)}
              className="text-red-600 hover:text-red-800 font-medium text-sm ml-4"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Table row layout for larger screens */}
      <tr className="hidden sm:table-row bg-white">
        <td className="px-4 py-3 text-sm font-mono text-gray-900">
          {product.barcode}
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
        <td className="px-4 py-3 text-sm text-gray-900">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecreaseQuantity}
              disabled={product.quantity <= 1}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                product.quantity <= 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              -
            </button>
            <span className="text-sm font-semibold min-w-[2rem] text-center">
              {product.quantity}
            </span>
            <button
              onClick={handleIncreaseQuantity}
              className="w-6 h-6 rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center justify-center text-sm font-bold"
            >
              +
            </button>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-900">
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Delete
          </button>
        </td>
      </tr>
    </>
  );
}

export default Product;
