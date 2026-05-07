function loadDashboard() {
  const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');

  const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const todayInvs = invoices.filter(inv => inv.date === todayStr);
  const todaySales = todayInvs.reduce((sum, inv) => sum + inv.grandTotal, 0);

  document.getElementById('todaySales').textContent = '₹' + todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  document.getElementById('totalInvoices').textContent = invoices.length;
  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalCustomers').textContent = customers.length;

  // Dynamic badges
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const yesterdaySales = invoices.filter(inv => inv.date === yesterdayStr).reduce((sum, inv) => sum + inv.grandTotal, 0);
  const salesChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(1) : (todaySales > 0 ? 100 : 0);
  const salesBadge = document.getElementById('salesBadge');
  if (salesBadge) {
    salesBadge.textContent = (salesChange >= 0 ? '+' : '') + salesChange + '%';
    salesBadge.className = 'text-xs font-bold px-2 py-1 rounded-full ' + (salesChange >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50');
  }

  const lastWeekInvs = invoices.filter(inv => {
    const d = new Date(inv.date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo && d < new Date();
  }).length;
  const prevWeekInvs = invoices.filter(inv => {
    const d = new Date(inv.date);
    const twoWeeksAgo = new Date(); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= twoWeeksAgo && d < weekAgo;
  }).length;
  const invChange = prevWeekInvs > 0 ? ((lastWeekInvs - prevWeekInvs) / prevWeekInvs * 100).toFixed(1) : (lastWeekInvs > 0 ? 100 : 0);
  const invoicesBadge = document.getElementById('invoicesBadge');
  if (invoicesBadge) {
    invoicesBadge.textContent = (invChange >= 0 ? '+' : '') + invChange + '%';
    invoicesBadge.className = 'text-xs font-bold px-2 py-1 rounded-full ' + (invChange >= 0 ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50');
  }

  const productsBadge = document.getElementById('productsBadge');
  if (productsBadge) productsBadge.textContent = products.length;

  const customersBadge = document.getElementById('customersBadge');
  if (customersBadge) customersBadge.textContent = customers.length;

  renderWeeklyChart(invoices);
  renderTopProducts(invoices);
}

function renderWeeklyChart(invoices) {
  const container = document.getElementById('weeklyChart');
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      total: 0
    });
  }

  invoices.forEach(inv => {
    const match = days.find(d => d.dateStr === inv.date);
    if (match) match.total += inv.grandTotal;
  });

  const max = Math.max(...days.map(d => d.total), 1);

  container.innerHTML = `
    <div class="flex items-end justify-between gap-2" style="height: 160px">
      ${days.map(d => {
        const h = (d.total / max) * 160;
        return `
          <div class="flex-1 flex flex-col items-center justify-end" style="height: 160px">
            <div class="w-full bg-[#4FA03D] rounded-t-md transition-all duration-500" style="height: ${h}px" title="₹${d.total.toLocaleString('en-IN')}"></div>
            <span class="text-[10px] text-gray-500 font-bold mt-2">${d.label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderTopProducts(invoices) {
  const container = document.getElementById('topProducts');
  const agg = {};

  invoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const name = item.productName + (item.unit ? ' (' + item.unit + ')' : '');
      agg[name] = (agg[name] || 0) + item.quantity;
    });
  });

  const sorted = Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxQty = sorted.length ? sorted[0][1] : 1;

  if (!sorted.length) {
    container.innerHTML = '<p class="text-gray-400 text-sm py-4 text-center">No sales yet</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, qty]) => {
    const w = (qty / maxQty) * 100;
    return `
      <div class="flex items-center gap-4">
        <span class="text-xs font-bold w-24 text-gray-500 truncate">${name}</span>
        <div class="flex-1 bg-orange-100 h-6 rounded-full overflow-hidden">
          <div class="bg-orange-400 h-full rounded-full transition-all duration-500" style="width: ${w}%"></div>
        </div>
        <span class="text-xs font-bold text-gray-600 w-8 text-right">${qty}</span>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', loadDashboard);
