import React, { useState } from "react";
import useAllProducts from "../../hooks/useAllProducts";
import SectionTitle from "../../components/SectionTitle";
import UpdateStockModal from "./UpdateStockModal";
import InventoryLogsModal from "./InventoryLogsModal";
import { Logs } from "lucide-react";
import { FiEdit2, FiEdit3 } from "react-icons/fi";

const Inventory = () => {
  const [products, isLoading] = useAllProducts();

  const [updateModal, setUpdateModal] = useState({ isOpen: false, sku: null });
  const [logsModal, setLogsModal] = useState({ isOpen: false, sku: null });

  const openUpdateModal = (sku) => setUpdateModal({ isOpen: true, sku });
  const closeUpdateModal = () => setUpdateModal({ isOpen: false, sku: null });

  const openLogsModal = (sku) => setLogsModal({ isOpen: true, sku });
  const closeLogsModal = () => setLogsModal({ isOpen: false, sku: null });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <SectionTitle heading="Inventory Management" />
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Variant Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock Q</th>
              <th>Stock Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) =>
              product.variants.map((variant) => (
                <tr key={variant.sku || product.sku}>
                  <td>
                    {typeof product.name === "object"
                      ? product.name.en
                      : product.name}
                  </td>
                  <td>{variant.name || "N/A"}</td>
                  <td>{variant.sku || product.sku || "N/A"}</td>
                  <td>{variant.price}</td>
                  <td>{variant.stock_quantity}</td>
                  <td>{variant.stock_quantity * variant.price}</td>
                  <td>
                    <button
                      onClick={() =>
                        openUpdateModal(variant.sku || product.sku)
                      }
                      className="btn btn-sm btn-primary mr-2"
                    >
                      <FiEdit3 className="mr-1" />
                    </button>
                    <button
                      onClick={() => openLogsModal(variant.sku || product.sku)}
                      className="btn btn-sm btn-secondary"
                    >
                      <Logs className="ml-1" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {updateModal.isOpen && (
        <UpdateStockModal sku={updateModal.sku} onClose={closeUpdateModal} />
      )}

      {logsModal.isOpen && (
        <InventoryLogsModal sku={logsModal.sku} onClose={closeLogsModal} />
      )}
    </div>
  );
};

export default Inventory;
