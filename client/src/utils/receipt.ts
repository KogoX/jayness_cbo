export interface ReceiptPayload {
  checkoutRequestID: string;
  receiptNumber: string;
  amount: number;
  phoneNumber: string;
  transactionDate: string;
  status: string;
  payerName: string;
  payerEmail?: string | null;
  programTitle: string;
  issuedAt: string;
}

const formatDateTime = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
};

export const downloadReceiptPdf = async (receipt: ReceiptPayload) => {
  const jsPdfModule = await import('jspdf');
  const doc = new jsPdfModule.jsPDF();

  doc.setFontSize(18);
  doc.text('Jayness Foundation Payment Receipt', 14, 20);

  doc.setFontSize(11);
  doc.text(`Receipt No: ${receipt.receiptNumber || 'N/A'}`, 14, 35);
  doc.text(`Checkout ID: ${receipt.checkoutRequestID}`, 14, 43);
  doc.text(`Status: ${receipt.status}`, 14, 51);
  doc.text(`Amount: Ksh ${Number(receipt.amount).toLocaleString()}`, 14, 59);
  doc.text(`Phone: ${receipt.phoneNumber}`, 14, 67);
  doc.text(`Payer: ${receipt.payerName}`, 14, 75);
  doc.text(`Email: ${receipt.payerEmail || 'N/A'}`, 14, 83);
  doc.text(`Program: ${receipt.programTitle}`, 14, 91);
  doc.text(`Paid On: ${formatDateTime(receipt.transactionDate)}`, 14, 99);
  doc.text(`Issued On: ${formatDateTime(receipt.issuedAt)}`, 14, 107);

  doc.setFontSize(10);
  doc.text('This receipt is generated after confirmed M-Pesa payment.', 14, 122);

  doc.save(`receipt-${receipt.checkoutRequestID}.pdf`);
};

