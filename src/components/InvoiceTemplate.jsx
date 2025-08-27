import React, { forwardRef } from "react";

const InvoiceTemplate = forwardRef(({ order, isLastInvoice }, ref) => {
  const styles = {
    page: {
      width: "210mm",
      padding: "20mm",
      minHeight: "265mm",
      margin: "10mm auto",
      border: "1px #D3D3D3 solid",
      borderRadius: "5px",
      background: "white",
      boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      borderBottom: "2px solid #eee",
      paddingBottom: "10px",
      marginBottom: "20px",
    },
    invoiceColumn: { width: "48%" },
    billedToColumn: { width: "48%", textAlign: "right" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
    },
    th: {
      border: "1px solid #ddd",
      padding: "8px",
      textAlign: "left",
      background: "#f2f2f2",
    },
    td: { border: "1px solid #ddd", padding: "8px" },
    summary: { marginTop: "20px", textAlign: "right" },
  };

  return (
    <div
      ref={ref}
      style={{
        ...styles.page,
        pageBreakAfter: isLastInvoice ? "avoid" : "always",
      }}
      className="invoice-page"
    >
      <div style={styles.header}>
        <div style={styles.invoiceColumn}>
          <h2>Invoice</h2>
          <p>
            <strong>Shishu Seba</strong>
          </p>
          <p>
            <strong>Address:</strong> Savar, Dhaka, Bangladesh
          </p>
          <p>
            <strong>Order ID:</strong> {order.orderId}
          </p>
          <p>
            <strong>Date:</strong> {order.user?.orderDate}
          </p>
        </div>
        <div style={styles.billedToColumn}>
          <h4 className="font-bold">Billed To:</h4>
          <p>{order.user?.name}</p>
          <p>
            {order.user?.address}, {order.user?.district}
          </p>
          <p>{order.user?.mobile}</p>
        </div>
      </div>

      <h4>Order Items</h4>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Product</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item) => (
            <tr key={item._id}>
              <td style={styles.td}>{item.name}</td>
              <td style={styles.td}>{item.price} BDT</td>
              <td style={styles.td}>{item.quantity}</td>
              <td style={styles.td}>
                {(item.price * item.quantity).toFixed(2)} BDT
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={styles.summary}>
        <p>Subtotal: {order.subtotal?.toFixed(2)} BDT</p>
        <p>Shipping Cost: {order.shippingCost?.toFixed(2)} BDT</p>
        <hr />
        <h4>
          <strong>Total: {order.total?.toFixed(2)} BDT</strong>
        </h4>
      </div>
    </div>
  );
});

export default InvoiceTemplate;
