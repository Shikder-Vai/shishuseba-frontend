import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const InventoryLogsModal = ({ sku, onClose }) => {
  const [filterReason, setFilterReason] = useState("All");
  const axiosSecure = useAxiosSecure();
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["inventoryLogs", sku],
    queryFn: async () => {
      const res = await axiosSecure.get(`/inventory/logs/${sku}`);
      return res.data;
    },
  });

  const filteredLogs = logs.filter((log) => {
    if (filterReason === "All") {
      return true;
    }
    return log.reason === filterReason;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Inventory Logs for {sku}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Filter by Reason
          </label>
          <select
            value={filterReason}
            onChange={(e) => setFilterReason(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            <option>All</option>
            <option>sale</option>
            <option>Stock In</option>
            <option>Adjustment</option>
            <option>Return</option>
            <option>Damage</option>
          </select>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Change</th>
                <th>New Quantity</th>
                <th>Reason</th>
                <th>Order ID</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.change_quantity}</td>
                    <td>{log.new_quantity}</td>
                    <td>{log.reason}</td>
                    <td>{log.orderId || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryLogsModal;
