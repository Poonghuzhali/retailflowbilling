// Billing Management System
let availableProducts = [];
let invoiceItems = [];
let selectedCustomerId = null;

function initializeBilling() {
  loadAvailableProducts();
  loadInvoiceItems();
  renderAvailableProducts(availableProducts);
  renderInvoiceItems();
  setupCustomerSearch();
}

function loadAvailableProducts() {
  const stored = localStorage.getItem('products');
  availableProducts = stored ? JSON.parse(stored) : [];
}

function setupCustomerSearch() {
  const input = document.getElementById('customerSearch');
  const dropdown = document.getElementById('customerDropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    dropdown.innerHTML = '';
    dropdown.classList.add('hidden');
    selectedCustomerId = null;

    if (!q) return;

    const stored = localStorage.getItem('customers');
    if (!stored) return;
    const customers = JSON.parse(stored);
    const matches = customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );

    if (matches.length === 0) return;

    matches.forEach(c => {
      const div = document.createElement('div');
      div.className = 'px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0';
      div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-[#D9E9D5] flex items-center justify-center text-sm font-bold text-[#4FA03D]">${c.name.charAt(0)}</div>
        <div>
          <p class="font-semibold text-gray-800 text-sm">${c.name}</p>
          <p class="text-xs text-gray-400">${c.phone}</p>
        </div>
      `;
      div.onclick = function() {
        input.value = c.name;
        selectedCustomerId = c.id;
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
      };
      dropdown.appendChild(div);
    });
    dropdown.classList.remove('hidden');
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

function loadInvoiceItems() {
  const stored = localStorage.getItem('invoiceItems');
  invoiceItems = stored ? JSON.parse(stored) : [];
}

function saveInvoiceItems() {
  localStorage.setItem('invoiceItems', JSON.stringify(invoiceItems));
}

function renderAvailableProducts(products) {
  const container = document.getElementById('availableProducts');
  if (!container) return;
  if (products.length === 0) {
    container.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">No products found</div>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-[#4FA03D] transition-colors cursor-pointer" onclick="addToInvoice(${p.id})">
      <div>
        <p class="font-bold text-gray-800">${p.productName} (${p.unit})</p>
        <p class="text-[10px] text-gray-400 uppercase font-bold">GST ${p.gst}%</p>
      </div>
      <span class="font-bold text-lg text-gray-800">₹${p.sellingPrice}</span>
    </div>
  `).join('');
}

function renderInvoiceItems() {
  const tbody = document.getElementById('invoiceItemsBody');
  const countEl = document.getElementById('invoiceItemsCount');
  if (!tbody) return;
  if (invoiceItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="py-8 text-center text-gray-400 text-sm">No items added</td></tr>';
    if (countEl) countEl.textContent = '0 items';
    renderTotals();
    return;
  }
  if (countEl) countEl.textContent = invoiceItems.length + ' items';
  tbody.innerHTML = invoiceItems.map(item => `
    <tr class="border-b last:border-0">
      <td class="py-4 font-bold text-gray-800">${item.productName} (${item.unit})</td>
      <td class="py-4">
        <div class="flex items-center justify-center gap-2">
          <button class="w-6 h-6 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100" onclick="updateQuantity(${item.productId}, -1)">-</button>
          <span class="w-6 text-center font-medium">${item.quantity}</span>
          <button class="w-6 h-6 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100" onclick="updateQuantity(${item.productId}, 1)">+</button>
        </div>
      </td>
      <td class="py-4 text-right text-gray-600">₹${item.sellingPrice}</td>
      <td class="py-4 text-right font-bold text-gray-800">₹${(item.sellingPrice * item.quantity).toFixed(2)}</td>
      <td class="py-4 text-right pl-2">
        <button class="text-red-500 hover:text-red-700 text-lg" onclick="removeFromInvoice(${item.productId})">🗑</button>
      </td>
    </tr>
  `).join('');
  renderTotals();
}

function renderTotals() {
  const subtotalEl = document.getElementById('subtotal');
  const gstEl = document.getElementById('gstAmount');
  const grandTotalEl = document.getElementById('grandTotal');
  if (!subtotalEl) return;
  const subtotal = invoiceItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const gstAmount = invoiceItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity * item.gst / 100, 0);
  const grandTotal = subtotal + gstAmount;
  subtotalEl.textContent = '₹' + subtotal.toFixed(2);
  if (gstEl) gstEl.textContent = '₹' + gstAmount.toFixed(2);
  if (grandTotalEl) grandTotalEl.textContent = '₹' + grandTotal.toFixed(2);
}

function addToInvoice(productId) {
  const product = availableProducts.find(p => p.id === productId);
  if (!product) return;
  const existing = invoiceItems.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    invoiceItems.push({
      productId: product.id,
      productName: product.productName,
      unit: product.unit,
      sellingPrice: product.sellingPrice,
      gst: product.gst,
      quantity: 1
    });
  }
  saveInvoiceItems();
  renderInvoiceItems();
}

function updateQuantity(productId, delta) {
  const item = invoiceItems.find(i => i.productId === productId);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveInvoiceItems();
  renderInvoiceItems();
}

function removeFromInvoice(productId) {
  invoiceItems = invoiceItems.filter(i => i.productId !== productId);
  saveInvoiceItems();
  renderInvoiceItems();
}

function saveInvoice(status) {
  if (invoiceItems.length === 0) {
    alert('Add at least one product to the invoice');
    return;
  }
  const nextId = parseInt(localStorage.getItem('invoiceCounter') || '0') + 1;
  localStorage.setItem('invoiceCounter', nextId.toString());
  const id = 'INV-2026-' + String(nextId).padStart(3, '0');

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const gstAmount = invoiceItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity * item.gst / 100, 0);

  const customerInput = document.getElementById('customerSearch');
  const customerName = customerInput ? customerInput.value.trim() : '';

  const invoice = {
    id,
    customerName: customerName || 'Walk-in Customer',
    customerId: selectedCustomerId,
    items: [...invoiceItems],
    subtotal: Math.round(subtotal * 100) / 100,
    gst: Math.round(gstAmount * 100) / 100,
    grandTotal: Math.round((subtotal + gstAmount) * 100) / 100,
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    status
  };

  const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
  invoices.unshift(invoice);
  localStorage.setItem('invoices', JSON.stringify(invoices));

  invoiceItems = [];
  selectedCustomerId = null;
  saveInvoiceItems();
  renderInvoiceItems();
  if (customerInput) customerInput.value = '';
  alert('Invoice ' + id + ' saved as ' + status);
}

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  if (!query) {
    renderAvailableProducts(availableProducts);
    return;
  }
  const filtered = availableProducts.filter(p =>
    p.productName.toLowerCase().includes(query) ||
    p.sku.toLowerCase().includes(query)
  );
  renderAvailableProducts(filtered);
}

document.addEventListener('DOMContentLoaded', initializeBilling);
