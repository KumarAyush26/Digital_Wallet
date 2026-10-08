import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { formatCurrency, formatDate } from '../utils/formatters';

export const exportService = {
  /**
   * Export transactions to CSV
   */
  exportToCsv: (transactions, filename = 'payflow_statement.csv') => {
    if (!transactions || transactions.length === 0) return;

    const data = transactions.map((t) => ({
      'Transaction ID': t.transactionId,
      'Date & Time': formatDate(t.createdAt),
      'Type': t.type,
      'Category': t.category || 'General',
      'Amount (INR)': t.amount,
      'Status': t.status,
      'Description': t.description,
      'Sender / Payee': t.sender?.name || 'Self / Top-up',
      'Recipient': t.receiver?.name || 'N/A',
      'Note': t.note || ''
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export transactions to PDF statement
   */
  exportToPdf: (transactions, user, wallet) => {
    if (!transactions) return;

    const doc = new jsPDF();

    // Brand Header
    doc.setFillColor(79, 70, 229); // #4f46e5 Indigo
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYFLOW DIGITAL WALLET', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Digital Account Statement', 14, 26);

    const generatedDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    doc.text(`Generated: ${generatedDate}`, 155, 26);

    // Account Summary Section
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Holder Summary', 14, 44);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user?.name || 'Valued Customer'}`, 14, 52);
    doc.text(`UPI ID: ${user?.upiId || 'N/A'}`, 14, 58);
    doc.text(`Email: ${user?.email || 'N/A'}`, 14, 64);

    doc.text(`Account No: ${wallet?.accountNumber || 'N/A'}`, 120, 52);
    doc.text(`Current Balance: ${formatCurrency(wallet?.balance || 0)}`, 120, 58);
    doc.text(`Statement Records: ${transactions.length} entries`, 120, 64);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 70, 196, 70);

    // Table Data
    const tableRows = transactions.map((t) => [
      t.transactionId,
      new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      t.description || `${t.type} - ${t.category}`,
      t.category || 'General',
      t.type,
      t.status,
      `₹${t.amount.toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Txn ID', 'Date', 'Description', 'Category', 'Type', 'Status', 'Amount']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    doc.save(`PayFlow_Statement_${new Date().toISOString().slice(0, 10)}.pdf`);
  },

  /**
   * Export single transaction receipt PDF
   */
  exportReceiptPdf: (transaction, user) => {
    if (!transaction) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [148, 210] // A5 Receipt format
    });

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 148, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 12, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('PayFlow Digital Wallet Systems', 12, 21);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Details', 12, 38);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const details = [
      ['Transaction ID:', transaction.transactionId],
      ['Date & Time:', formatDate(transaction.createdAt)],
      ['Payment Type:', transaction.type],
      ['Category:', transaction.category || 'General Transfer'],
      ['Status:', transaction.status],
      ['Description:', transaction.description || 'Transfer'],
      ['Sender:', transaction.sender?.name || user?.name || 'Self'],
      ['Receiver:', transaction.receiver?.name || 'N/A'],
      ['Note / Reference:', transaction.note || 'None']
    ];

    let y = 46;
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 12, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 55, y);
      y += 8;
    });

    doc.setDrawColor(226, 232, 240);
    doc.line(12, y + 2, 136, y + 2);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount Paid:', 12, y + 14);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(`₹${transaction.amount.toLocaleString('en-IN')}`, 95, y + 14);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.text('This is an authorized computer-generated electronic payment receipt.', 12, y + 26);

    doc.save(`Receipt_${transaction.transactionId}.pdf`);
  }
};
