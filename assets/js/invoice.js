function initializeInvoices() {
  renderInvoices();
}

function getInvoices() {
  return JSON.parse(localStorage.getItem('invoices') || '[]');
}

function renderInvoices() {
  const tbody = document.querySelector('#invoiceTable tbody');
  if (!tbody) return;
  const invoices = getInvoices();
  tbody.innerHTML = '';

  if (invoices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-8 py-12 text-center text-gray-400 text-lg">No invoices yet</td></tr>';
    return;
  }

  invoices.forEach(inv => {
    const statusClass = inv.status === 'Paid' ? 'text-green-500' : inv.status === 'Pending' ? 'text-orange-400' : 'text-red-500';
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    row.innerHTML = `
      <td class="px-8 py-6 font-medium text-gray-600">${inv.id}</td>
      <td class="px-8 py-6 font-semibold">${inv.customerName}</td>
      <td class="px-8 py-6 font-bold">₹${(inv.grandTotal || 0).toLocaleString()}</td>
      <td class="px-8 py-6 text-gray-500">${inv.date}</td>
      <td class="px-8 py-6"><span class="${statusClass} font-bold">${inv.status}</span></td>
      <td class="px-8 py-6 text-center">
        <button onclick="viewInvoice('${inv.id}')" class="flex flex-col items-center mx-auto group">
          <span class="text-green-600 text-xl group-hover:scale-110 transition">👁</span>
          <span class="text-[10px] font-bold text-gray-400 uppercase">View</span>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function getSettings() {
  return JSON.parse(localStorage.getItem('retailflow_settings') || '{}');
}

function viewInvoice(id) {
  const invoices = getInvoices();
  const inv = invoices.find(i => i.id === id);
  if (!inv) return;

  const s = getSettings();
  const shopNameEl = document.getElementById('printShopName');
  shopNameEl.innerHTML = s.shopName ? s.shopName : 'Retail<span class="text-[#4FA03D]">Flow</span>';
  document.getElementById('printShopAddress').textContent = s.address || 'Smart retail billing';
  document.getElementById('printShopGst').textContent = s.gst ? 'GST: ' + s.gst : '';
  if (s.logo) {
    document.getElementById('printShopLogo').classList.remove('hidden');
    document.getElementById('printShopLogoImg').src = s.logo;
  } else {
    document.getElementById('printShopLogo').classList.add('hidden');
  }

  document.getElementById('printInvoiceId').textContent = inv.id;
  document.getElementById('printDate').textContent = inv.date;
  document.getElementById('printCustomer').textContent = inv.customerName;
  const statusEl = document.getElementById('printStatus');
  statusEl.textContent = inv.status;
  statusEl.className = 'font-bold ' + (inv.status === 'Paid' ? 'text-green-500' : inv.status === 'Pending' ? 'text-orange-400' : 'text-red-500');

  const itemsBody = document.getElementById('printItemsBody');
  itemsBody.innerHTML = inv.items.map(item => `
    <tr class="border-b border-gray-100">
      <td class="py-3 text-gray-800">${item.productName} (${item.unit})</td>
      <td class="py-3 text-center text-gray-600">${item.quantity}</td>
      <td class="py-3 text-right text-gray-600">₹${item.sellingPrice}</td>
      <td class="py-3 text-right font-semibold text-gray-800">₹${(item.sellingPrice * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  document.getElementById('printSubtotal').textContent = '₹' + inv.subtotal.toFixed(2);
  document.getElementById('printGst').textContent = '₹' + inv.gst.toFixed(2);
  document.getElementById('printGrandTotal').textContent = '₹' + inv.grandTotal.toFixed(2);

  document.getElementById('invoiceModal').classList.remove('hidden');
  document.getElementById('invoiceModal').style.display = 'flex';
}

function printInvoice() {
  window.print();
}

function closeInvoiceModal() {
  document.getElementById('invoiceModal').style.display = 'none';
  document.getElementById('invoiceModal').classList.add('hidden');
}

function downloadInvoice() {
  const s = getSettings();
  const shopName = s.shopName || 'RetailFlow';
  const shopAddr = s.address || 'Smart retail billing';
  const shopGst = s.gst ? 'GST: ' + s.gst : '';
  const logoHtml = s.logo ? `<img src="${s.logo}" style="max-height:50px;margin-bottom:8px">` : '';

  const invId = document.getElementById('printInvoiceId').textContent;
  const date = document.getElementById('printDate').textContent;
  const customer = document.getElementById('printCustomer').textContent;
  const status = document.getElementById('printStatus').textContent;
  const subtotal = document.getElementById('printSubtotal').textContent;
  const gst = document.getElementById('printGst').textContent;
  const grandTotal = document.getElementById('printGrandTotal').textContent;

  const rows = document.querySelectorAll('#printItemsBody tr');
  let itemsHtml = '';
  rows.forEach(row => {
    const tds = row.querySelectorAll('td');
    if (tds.length === 4) {
      itemsHtml += `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;color:#333">${tds[0].textContent}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;color:#666">${tds[1].textContent}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#666">${tds[2].textContent}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#333">${tds[3].textContent}</td>
      </tr>`;
    }
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${invId}</title>
<style>
  body { font-family: 'Inter', Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #333; }
  .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px; }
  .brand { font-size: 24px; font-weight: 800; } .brand span { color: #4FA03D; }
  .id { font-size: 20px; font-weight: 700; } .muted { color: #999; font-size: 13px; }
  .info { display: flex; justify-content: space-between; background: #f8f9fa; padding: 16px 20px; border-radius: 12px; margin-bottom: 30px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; color: #999; font-weight: 700; padding-bottom: 10px; border-bottom: 2px solid #eee; text-transform: uppercase; font-size: 11px; }
  th:nth-child(2) { text-align: center; } th:nth-child(3) { text-align: right; } th:nth-child(4) { text-align: right; }
  .totals { width: 280px; margin-left: auto; margin-top: 20px; padding-top: 16px; border-top: 2px solid #eee; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; color: #666; }
  .totals .grand { font-size: 18px; font-weight: 700; color: #111; padding-top: 12px; border-top: 2px solid #eee; margin-top: 8px; }
  .footer { text-align: center; margin-top: 40px; color: #ccc; font-size: 12px; }
</style></head>
<body>
  <div class="header">
    <div>${logoHtml}<div class="brand">${shopName}</div><div class="muted">${shopAddr}</div>${shopGst ? '<div class="muted" style="margin-top:2px">' + shopGst + '</div>' : ''}</div>
    <div style="text-align:right"><div class="id">${invId}</div><div class="muted">${date}</div></div>
  </div>
  <div class="info">
    <div><div class="muted" style="text-transform:uppercase;font-weight:700;margin-bottom:4px">Customer</div><div style="font-weight:600;font-size:16px">${customer}</div></div>
    <div style="text-align:right"><div class="muted" style="text-transform:uppercase;font-weight:700;margin-bottom:4px">Status</div><div style="font-weight:700;color:${status === 'Paid' ? '#22c55e' : status === 'Pending' ? '#f97316' : '#ef4444'}">${status}</div></div>
  </div>
  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal:</span><span>${subtotal}</span></div>
    <div><span>GST:</span><span>${gst}</span></div>
    <div class="grand"><span>Grand Total:</span><span>${grandTotal}</span></div>
  </div>
  <div class="footer">${invId} &bull; Generated by RetailFlow</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = invId + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function searchInvoices() {
  const q = document.getElementById('invoiceSearch')?.value.toLowerCase().trim();
  const tbody = document.querySelector('#invoiceTable tbody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  if (!q) {
    rows.forEach(r => r.style.display = '');
    return;
  }
  rows.forEach(r => {
    const text = r.textContent.toLowerCase();
    r.style.display = text.includes(q) ? '' : 'none';
  });
}

document.addEventListener('DOMContentLoaded', initializeInvoices);
