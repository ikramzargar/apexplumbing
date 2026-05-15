import { jsPDF } from 'jspdf';
import { formatCurrency } from './formatCurrency.js';
import { formatDate } from './formatDate.js';

export const generateInvoicePDF = (invoice) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('HANSIF GROUP', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Water Tanks, Pipes & Fittings', 105, 28, { align: 'center' });
  doc.text('Kashmir, Jammu & Kashmir', 105, 34, { align: 'center' });

  doc.setDrawColor(0, 51, 102);
  doc.line(20, 40, 190, 40);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice: ${invoice.invoice_number}`, 20, 50);
  doc.text(`Date: ${formatDate(invoice.createdAt)}`, 20, 58);
  doc.text(`Type: ${invoice.invoice_type === 'STOCK_TRANSFER' ? 'STOCK TRANSFER' : invoice.invoice_type}`, 20, 66);

  let yPos = 80;

  if (invoice.invoice_type === 'STOCK_TRANSFER') {
    // From Admin
    doc.text('From:', 20, yPos);
    doc.text(invoice.created_by?.name || 'Admin', 45, yPos);
    yPos += 8;

    // To Distributor
    doc.text('To:', 20, yPos);
    const distName = invoice.distributor?.business_name || invoice.distributor_name || '';
    doc.text(distName, 45, yPos);
    yPos += 8;
    const distPhone = invoice.distributor?.phone || invoice.distributor_phone || '';
    if (distPhone) {
      doc.text(distPhone, 45, yPos);
      yPos += 8;
    }
    const distAddr = invoice.distributor?.address || invoice.distributor_address || '';
    if (distAddr) {
      doc.text(distAddr.substring(0, 40), 45, yPos);
      yPos += 8;
    }

    yPos += 12;
    doc.line(20, yPos, 190, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text('Product', 20, yPos);
    doc.text('Qty', 110, yPos);
    doc.text('Unit Price', 135, yPos);
    doc.text('Total', 170, yPos);

    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    invoice.items.forEach((item) => {
      doc.text(item.product_name?.substring(0, 35) || '', 20, yPos);
      doc.text(item.quantity.toString(), 110, yPos);
      doc.text(formatCurrency(item.unit_price), 135, yPos);
      doc.text(formatCurrency(item.line_total || (item.quantity * item.unit_price)), 170, yPos);
      yPos += 8;
    });

    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, yPos);

    yPos += 15;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('This is a stock transfer invoice.', 105, yPos, { align: 'center' });
  } else if (invoice.invoice_type === 'RETAIL') {
    doc.text(`Customer: ${invoice.customer_name || 'Walk-in Customer'}`, 20, yPos);
    if (invoice.customer_phone) {
      yPos += 8;
      doc.text(`Phone: ${invoice.customer_phone}`, 20, yPos);
    }
  } else if (invoice.distributor) {
    doc.text(`Distributor: ${invoice.distributor.business_name || ''}`, 20, yPos);
    yPos += 8;
    doc.text(`Owner: ${invoice.distributor.owner_name || ''}`, 20, yPos);
  }

  if (invoice.plumber_ref) {
    yPos += 16;
    doc.text(`Referred by: ${invoice.plumber_ref.full_name || ''}`, 20, yPos);
  }

  yPos += 20;
  doc.line(20, yPos, 190, yPos);

  yPos += 10;
  doc.setFontSize(10);
  doc.text('Product', 20, yPos);
  doc.text('Qty', 100, yPos);
  doc.text('Price', 120, yPos);
  doc.text('Total', 160, yPos);

  yPos += 5;
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  invoice.items.forEach((item) => {
    doc.text(item.product_name?.substring(0, 30) || '', 20, yPos);
    doc.text(item.quantity.toString(), 100, yPos);
    doc.text(formatCurrency(item.unit_price), 120, yPos);
    doc.text(formatCurrency(item.line_total), 160, yPos);
    yPos += 8;
  });

  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 10;

  doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, 140, yPos);
  yPos += 8;
  if (invoice.tax > 0) {
    doc.text(`Tax: ${formatCurrency(invoice.tax)}`, 140, yPos);
    yPos += 8;
  }
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(invoice.total)}`, 140, yPos);

  yPos += 15;
  doc.setFontSize(10);
  doc.text(`Payment Status: ${invoice.payment_status}`, 20, yPos);
  yPos += 8;
  doc.text(`Amount Paid: ${formatCurrency(invoice.amount_paid)}`, 20, yPos);
  yPos += 8;
  doc.text(`Balance Due: ${formatCurrency(invoice.balance_due)}`, 20, yPos);

  yPos = 270;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your business!', 105, yPos, { align: 'center' });
  doc.text('HANSIF GROUP - Quality PVC Products from Kashmir', 105, yPos + 5, { align: 'center' });

  return doc;
};

export const downloadInvoicePDF = (invoice) => {
  const doc = generateInvoicePDF(invoice);
  doc.save(`Invoice-${invoice.invoice_number}.pdf`);
};