// Product Management System
let products = [];
let editingProductId = null;

// Initialize the app
async function initializeApp() {
  await loadProductsFromJSON();
  renderProductsTable();
  setupEventListeners();
}

// Load products from product.json, then apply any user changes on top
async function loadProductsFromJSON() {
  try {
    const response = await fetch('./assets/js/product.json');
    const data = await response.json();
    products = data.products;
  } catch (error) {
    console.error('Error loading products from JSON:', error);
    const stored = localStorage.getItem('products');
    products = stored ? JSON.parse(stored) : [];
    return;
  }

  // Apply user changes (adds, edits, deletes) on top of fresh JSON data
  const changes = JSON.parse(localStorage.getItem('productChanges') || '{"edited":[],"deleted":[],"added":[]}');

  // Remove deleted products
  products = products.filter(p => !changes.deleted.includes(p.id));

  // Apply edits to JSON-original products
  changes.edited.forEach(edited => {
    const idx = products.findIndex(p => p.id === edited.id);
    if (idx !== -1) products[idx] = edited;
  });

  // Add user-created products
  changes.added.forEach(added => products.push(added));

  localStorage.setItem('products', JSON.stringify(products));
}

// Render products in table
function renderProductsTable() {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';

  products.forEach((product) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    row.innerHTML = `
      <td class="px-6 py-4 font-medium">${product.productName} (${product.unit})</td>
      <td class="px-6 py-4 text-gray-600">${product.sku}</td>
      <td class="px-6 py-4 font-semibold">₹${product.sellingPrice}</td>
      <td class="px-6 py-4">${product.currentStock}</td>
      <td class="px-6 py-4">${product.gst}%</td>
      <td class="px-6 py-4">
        <div class="flex items-center justify-center gap-4">
          <button class="text-green-600 hover:text-green-800 edit-btn" data-id="${product.id}" title="Edit">✎</button>
          <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${product.id}" title="Delete">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach event listeners to buttons
  attachButtonListeners();
}

// Render filtered products in table
function renderFilteredProductsTable(filteredProducts) {
  const tbody = document.querySelector('tbody');
  tbody.innerHTML = '';

  if (filteredProducts.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="6" class="px-6 py-4 text-center text-gray-500">No products found</td>';
    tbody.appendChild(row);
    return;
  }

  filteredProducts.forEach((product) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition-colors';
    row.innerHTML = `
      <td class="px-6 py-4 font-medium">${product.productName} (${product.unit})</td>
      <td class="px-6 py-4 text-gray-600">${product.sku}</td>
      <td class="px-6 py-4 font-semibold">₹${product.sellingPrice}</td>
      <td class="px-6 py-4">${product.currentStock}</td>
      <td class="px-6 py-4">${product.gst}%</td>
      <td class="px-6 py-4">
        <div class="flex items-center justify-center gap-4">
          <button class="text-green-600 hover:text-green-800 edit-btn" data-id="${product.id}" title="Edit">✎</button>
          <button class="text-red-500 hover:text-red-700 delete-btn" data-id="${product.id}" title="Delete">🗑</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  // Attach event listeners to buttons
  attachButtonListeners();
}

// Setup event listeners
function setupEventListeners() {
  // Add search functionality
  const searchInput = document.querySelector('input[placeholder*="Search product"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filteredProducts = products.filter(p => 
        p.productName.toLowerCase().includes(searchTerm) ||
        p.sku.toLowerCase().includes(searchTerm)
      );
      renderFilteredProductsTable(filteredProducts);
    });
  }
}

// Attach edit/delete button listeners
function attachButtonListeners() {
  // Edit buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = parseInt(btn.dataset.id);
      const product = products.find(p => p.id === productId);
      if (product) {
        populateFormWithProduct(product);
        editingProductId = productId;
        setTimeout(window.openModal, 50);
      }
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = parseInt(e.target.dataset.id);
      if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(productId);
      }
    });
  });
}

// Populate form with product data for editing
function populateFormWithProduct(product) {
  const inputs = {
    productName: document.querySelector('input[placeholder="Enter product name"]'),
    category: document.querySelector('select'),
    sku: document.querySelectorAll('input[placeholder*="SKU"]')[0],
    unit: document.querySelectorAll('select')[1],
    sellingPrice: document.querySelectorAll('input[type="number"]')[0],
    purchasePrice: document.querySelectorAll('input[type="number"]')[1],
    initialStock: document.querySelectorAll('input[type="number"]')[2],
    gst: document.querySelectorAll('input[type="number"]')[3]
  };

  if (inputs.productName) inputs.productName.value = product.productName;
  if (inputs.category) inputs.category.value = product.category;
  if (inputs.sku) inputs.sku.value = product.sku;
  if (inputs.unit) inputs.unit.value = product.unit;
  if (inputs.sellingPrice) inputs.sellingPrice.value = product.sellingPrice;
  if (inputs.purchasePrice) inputs.purchasePrice.value = product.purchasePrice;
  if (inputs.initialStock) inputs.initialStock.value = product.initialStock;
  if (inputs.gst) inputs.gst.value = product.gst;
}

// Get form data
function getFormData() {
  const productName = document.querySelector('input[placeholder="Enter product name"]')?.value;
  const category = document.querySelector('select')?.value;
  const sku = document.querySelectorAll('input[placeholder*="SKU"]')[0]?.value;
  const unit = document.querySelectorAll('select')[1]?.value;
  const sellingPrice = parseFloat(document.querySelectorAll('input[type="number"]')[0]?.value) || 0;
  const purchasePrice = parseFloat(document.querySelectorAll('input[type="number"]')[1]?.value) || 0;
  const initialStock = parseInt(document.querySelectorAll('input[type="number"]')[2]?.value) || 0;
  const gst = parseFloat(document.querySelectorAll('input[type="number"]')[3]?.value) || 5;

  return {
    productName,
    category,
    sku,
    unit,
    sellingPrice,
    purchasePrice,
    initialStock,
    gst
  };
}

// Save product
function saveProduct() {
  const formData = getFormData();

  // Validate required fields
  if (!formData.productName || !formData.category || !formData.sku || !formData.unit || !formData.sellingPrice) {
    alert('Please fill all required fields');
    return;
  }

  const changes = JSON.parse(localStorage.getItem('productChanges') || '{"edited":[],"deleted":[],"added":[]}');

  if (editingProductId) {
    // Update existing product
    const productIndex = products.findIndex(p => p.id === editingProductId);
    if (productIndex !== -1) {
      products[productIndex] = { ...products[productIndex], ...formData };

      // Track the edit
      const existingEditIdx = changes.edited.findIndex(e => e.id === editingProductId);
      if (existingEditIdx !== -1) {
        changes.edited[existingEditIdx] = products[productIndex];
      } else {
        changes.edited.push(products[productIndex]);
      }
      // If it was previously deleted, restore it
      changes.deleted = changes.deleted.filter(id => id !== editingProductId);
    }
    editingProductId = null;
  } else {
    // Create new product (use timestamp for unique ID)
    const newProduct = {
      id: Date.now(),
      ...formData,
      currentStock: formData.initialStock
    };
    products.push(newProduct);
    changes.added.push(newProduct);
  }

  localStorage.setItem('productChanges', JSON.stringify(changes));
  localStorage.setItem('products', JSON.stringify(products));

  renderProductsTable();
  resetForm();
  closeModal();
}

// Delete product
function deleteProduct(productId) {
  const changes = JSON.parse(localStorage.getItem('productChanges') || '{"edited":[],"deleted":[],"added":[]}');

  // Remove from added list if it was user-created
  changes.added = changes.added.filter(p => p.id !== productId);
  // Remove from edited list
  changes.edited = changes.edited.filter(e => e.id !== productId);
  // Track deletion (for JSON-original products)
  if (!changes.deleted.includes(productId)) {
    changes.deleted.push(productId);
  }

  products = products.filter(p => p.id !== productId);

  localStorage.setItem('productChanges', JSON.stringify(changes));
  localStorage.setItem('products', JSON.stringify(products));
  renderProductsTable();
}

// Reset form
function resetForm() {
  editingProductId = null;
  document.querySelector('input[placeholder="Enter product name"]').value = '';
  document.querySelector('select').value = 'Select Category';
  document.querySelectorAll('input[placeholder*="SKU"]')[0].value = '';
  document.querySelectorAll('select')[1].value = 'kg';
  document.querySelectorAll('input[type="number"]')[0].value = '';
  document.querySelectorAll('input[type="number"]')[1].value = '';
  document.querySelectorAll('input[type="number"]')[2].value = '';
  document.querySelectorAll('input[type="number"]')[3].value = '5';
}

// Close modal
function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
