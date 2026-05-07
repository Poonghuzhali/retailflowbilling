let customers = [];
let editingCustomerId = null;

async function initializeCustomer() {
  await loadCustomersFromJSON();
  renderCustomersTable(customers);
  setupCustomerListeners();
}

async function loadCustomersFromJSON() {
  const stored = localStorage.getItem('customerChanges');
  if (stored) {
    const changes = JSON.parse(stored);
    try {
      const response = await fetch('./assets/js/customer.json');
      const data = await response.json();
      customers = data.customers;
      customers = customers.filter(c => !changes.deleted.includes(c.id));
      changes.edited.forEach(edited => {
        const idx = customers.findIndex(c => c.id === edited.id);
        if (idx !== -1) customers[idx] = edited;
      });
      changes.added.forEach(added => customers.push(added));
    } catch (e) {
      customers = [];
    }
    localStorage.setItem('customers', JSON.stringify(customers));
    return;
  }
  try {
    const response = await fetch('./assets/js/customer.json');
    const data = await response.json();
    customers = data.customers;
  } catch (error) {
    console.error('Error loading customers:', error);
    const fallback = localStorage.getItem('customers');
    customers = fallback ? JSON.parse(fallback) : [];
    return;
  }
  localStorage.setItem('customers', JSON.stringify(customers));
}

function renderCustomersTable(list) {
  const tbody = document.querySelector('#customerTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400">No customers found</td></tr>';
    return;
  }
  list.forEach(c => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50/50 transition-colors';
    row.innerHTML = `
      <td class="px-6 py-5 font-medium text-gray-800">${c.name}</td>
      <td class="px-6 py-5 text-gray-600">${c.phone}</td>
      <td class="px-6 py-5 text-gray-500">${c.email}</td>
      <td class="px-6 py-5 font-bold text-gray-800">₹${(c.totalPurchases || 0).toLocaleString()}</td>
      <td class="px-6 py-5">
        <div class="flex items-center justify-center gap-4">
          <button class="text-green-600 hover:bg-green-50 p-2 rounded-lg transition edit-btn" data-id="${c.id}">✎</button>
          <button class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition delete-btn" data-id="${c.id}">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  attachCustomerButtonListeners();
}

function setupCustomerListeners() {
  const searchInput = document.querySelector('input[placeholder*="Search customer"]');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        renderCustomersTable(customers);
        return;
      }
      const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
      renderCustomersTable(filtered);
    });
  }
}

function attachCustomerButtonListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const customer = customers.find(c => c.id === id);
      if (customer) {
        populateCustomerForm(customer);
        editingCustomerId = id;
        document.getElementById('customerModalTitle').textContent = 'Edit Customer';
        openCustomerModal();
      }
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      if (confirm('Are you sure you want to delete this customer?')) {
        deleteCustomer(id);
      }
    });
  });
}

function populateCustomerForm(customer) {
  document.querySelector('#customerForm input[placeholder="Enter customer name"]').value = customer.name;
  document.querySelector('#customerForm input[placeholder="Enter phone number"]').value = customer.phone;
  document.querySelector('#customerForm input[placeholder="Enter email address"]').value = customer.email;
}

function getCustomerFormData() {
  return {
    name: document.querySelector('#customerForm input[placeholder="Enter customer name"]')?.value || '',
    phone: document.querySelector('#customerForm input[placeholder="Enter phone number"]')?.value || '',
    email: document.querySelector('#customerForm input[placeholder="Enter email address"]')?.value || ''
  };
}

function resetCustomerForm() {
  editingCustomerId = null;
  document.querySelector('#customerForm input[placeholder="Enter customer name"]').value = '';
  document.querySelector('#customerForm input[placeholder="Enter phone number"]').value = '';
  document.querySelector('#customerForm input[placeholder="Enter email address"]').value = '';
}

function saveCustomer() {
  const data = getCustomerFormData();
  if (!data.name || !data.phone) {
    alert('Please fill in customer name and phone number');
    return;
  }
  const changes = JSON.parse(localStorage.getItem('customerChanges') || '{"edited":[],"deleted":[],"added":[]}');
  if (editingCustomerId) {
    const idx = customers.findIndex(c => c.id === editingCustomerId);
    if (idx !== -1) {
      customers[idx] = { ...customers[idx], ...data };
      const ei = changes.edited.findIndex(e => e.id === editingCustomerId);
      if (ei !== -1) changes.edited[ei] = customers[idx];
      else changes.edited.push(customers[idx]);
      changes.deleted = changes.deleted.filter(id => id !== editingCustomerId);
    }
    editingCustomerId = null;
  } else {
    const newC = { id: Date.now(), ...data, totalPurchases: 0 };
    customers.push(newC);
    changes.added.push(newC);
  }
  localStorage.setItem('customerChanges', JSON.stringify(changes));
  localStorage.setItem('customers', JSON.stringify(customers));
  renderCustomersTable(customers);
  resetCustomerForm();
  closeCustomerModal();
}

function deleteCustomer(id) {
  const changes = JSON.parse(localStorage.getItem('customerChanges') || '{"edited":[],"deleted":[],"added":[]}');
  changes.added = changes.added.filter(c => c.id !== id);
  changes.edited = changes.edited.filter(e => e.id !== id);
  if (!changes.deleted.includes(id)) changes.deleted.push(id);
  customers = customers.filter(c => c.id !== id);
  localStorage.setItem('customerChanges', JSON.stringify(changes));
  localStorage.setItem('customers', JSON.stringify(customers));
  renderCustomersTable(customers);
}

function openCustomerModal() {
  const overlay = document.querySelector('.customer-modal-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
  }
}

function closeCustomerModal() {
  const overlay = document.querySelector('.customer-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  document.getElementById('customerModalTitle').textContent = 'Add Customer';
}

document.addEventListener('DOMContentLoaded', initializeCustomer);
