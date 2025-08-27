import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { FiX, FiPrinter } from "react-icons/fi";
import InvoiceTemplate from "./InvoiceTemplate";

const PrintModal = ({ orders, onClose }) => {
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: componentRef, // ✅ new API for v3
    documentTitle: "Invoices",
    bodyClass: "print-body",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 relative">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-xl font-semibold">
            Print Preview ({orders.length} Invoices)
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="bg-brand-teal-base hover:bg-brand-teal-300 text-white px-4 py-2 rounded-lg shadow-soft transition-colors flex items-center gap-2"
            >
              <FiPrinter /> Print Now
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* ✅ Attach ref here */}
        <div ref={componentRef} className="printable-area p-4 bg-gray-200">
          {orders.map((order, index) => (
            <InvoiceTemplate
              key={order._id}
              order={order}
              isLastInvoice={index === orders.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
