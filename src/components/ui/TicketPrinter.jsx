
import React, { useEffect, useRef } from 'react';

const formatGuaraniesForTicket = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Gs. 0';
  }
  const formatted = new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted.replace('PYG', 'Gs.');
};

const TicketPrinter = ({ order, branch, onPrinted }) => {
  const ticketRef = useRef(null);

  useEffect(() => {
    if (order && ticketRef.current) {
      window.print();
      if (onPrinted) {
        onPrinted(); 
      }
    }
  }, [order, onPrinted]);

  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('es-PY')} ${date.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const generateItemLine = (text, price) => {
    const maxLength = 48; 
    const priceStr = price ? formatGuaraniesForTicket(price) : "";
    const availableSpaceForText = maxLength - priceStr.length - 1; 
    const truncatedText = text.length > availableSpaceForText ? text.substring(0, availableSpaceForText - 3) + "..." : text;
    const spaces = " ".repeat(Math.max(0, availableSpaceForText - truncatedText.length));
    return `${truncatedText}${spaces} ${priceStr}`;
  };
  
  const generateCenteredText = (text) => {
    const maxLength = 48;
    const padding = Math.max(0, Math.floor((maxLength - text.length) / 2));
    return " ".repeat(padding) + text;
  }

  return (
    <div ref={ticketRef} className="ticket-printer">
      <div className="ticket-content">
        <p className="ticket-header">{generateCenteredText("LOMI-TERO")}</p>
        {branch && <p className="ticket-subheader">{generateCenteredText(branch.name)}</p>}
        <p>{generateCenteredText("------------------------------------------------")}</p>
        <p>Pedido #: {order.id.substring(0, 12)}...</p>
        <p>Fecha: {formatDate(order.created_at)}</p>
        {order.customer_name && <p>Cliente: {order.customer_name}</p>}
        {(order.users && !order.customer_name) && <p>Cliente: {order.users.name}</p>}
        <p>{generateCenteredText("------------------------------------------------")}</p>
        <p className="ticket-bold">DETALLE DEL PEDIDO:</p>
        {order.order_items?.map((item, index) => (
          <div key={item.id || index} className="ticket-item">
            <p>{generateItemLine(`${item.quantity}x ${item.products?.name || item.name || 'Producto Desc.'}`, item.unit_price * item.quantity)}</p>
            {item.notes && <p className="ticket-notes">  Nota: {item.notes.length > 38 ? item.notes.substring(0,35) + "..." : item.notes}</p>}
          </div>
        ))}
        <p>{generateCenteredText("------------------------------------------------")}</p>
        <p className="ticket-total">{generateItemLine("TOTAL:", order.total_amount)}</p>
        <p>{generateCenteredText("------------------------------------------------")}</p>
        <p className="ticket-footer">{generateCenteredText("¡Gracias por su preferencia!")}</p>
        <p className="ticket-footer">{generateCenteredText("Lomi-Tero App")}</p>
      </div>
    </div>
  );
};

export default TicketPrinter;
