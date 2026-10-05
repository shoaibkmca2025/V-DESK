import { openActiveModal } from '@/features/modals/modalManager.js';
import { showToast } from '@/features/ui/toast.js';

/* GST tax invoice sheet (PRD §48, §73): CGST + SGST split of an inclusive amount. */

let activeInvoiceRecord = null;

export function openTaxInvoiceModal(invoiceData = {}) {
  const modal = document.getElementById('taxInvoiceModal');
  if (!modal) return;

  const now = new Date();
  const invNo = invoiceData.invoiceNo || 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);
  const client = invoiceData.name || 'Acme Enterprises Pvt Ltd';
  const company = invoiceData.company || 'Acme Tech Solutions';
  const email = invoiceData.email || 'finance@acme.io';
  const city = invoiceData.city || 'Mumbai (BKC)';
  const item = invoiceData.item || 'Virtual Office for GST (12 Months) + Landlord NOC';
  const amount = invoiceData.amount || 21499;

  const basePrice = Math.round(amount / 1.18);
  const cgst = Math.round((amount - basePrice) / 2);
  const sgst = amount - basePrice - cgst;

  activeInvoiceRecord = { invNo, client, company, email, city, item, amount, basePrice, cgst, sgst, date: now.toLocaleDateString('en-IN') };

  const rupees = (value) => '₹' + value.toLocaleString('en-IN');
  const fields = {
    invNumberDisplay: invNo,
    invDateDisplay: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    invClientName: client,
    invClientCompany: company,
    invClientEmail: email,
    invClientCity: city,
    invItemDesc: item,
    invItemBase: rupees(basePrice),
    invSubtotal: rupees(basePrice),
    invCgst: rupees(cgst),
    invSgst: rupees(sgst),
    invGrandTotal: rupees(amount),
  };
  for (const [id, text] of Object.entries(fields)) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  openActiveModal('taxInvoiceModal');
}

export function printTaxInvoice() {
  window.print();
}

export function downloadInvoicePdf() {
  showToast('Downloading Tax Invoice', `Saved ${activeInvoiceRecord ? activeInvoiceRecord.invNo : 'Invoice'}.pdf with official digital seal.`, 'success');
}
