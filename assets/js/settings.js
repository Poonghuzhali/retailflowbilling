const SETTINGS_KEY = 'retailflow_settings';

function getSettings() {
  const defaults = {
    shopName: 'RetailFlow',
    ownerName: '',
    phone: '+91 6756489302',
    email: 'shop@example.com',
    address: '',
    gst: '22AAAAA0000A1Z5',
    logo: '',
    defaultGst: 5,
    invoicePrefix: 'INV',
    invoiceTemplate: 'classic',
    voiceBilling: true,
    autoSave: true,
    theme: 'light'
  };
  return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') };
}

function saveSettingsToStorage(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function loadSettings() {
  const s = getSettings();
  gid('shopName').value = s.shopName;
  gid('ownerName').value = s.ownerName;
  gid('shopPhone').value = s.phone;
  gid('shopEmail').value = s.email;
  gid('shopAddress').value = s.address;
  gid('shopGst').value = s.gst;
  gid('defaultGst').value = s.defaultGst;
  gid('invoicePrefix').value = s.invoicePrefix;

  if (s.logo) {
    gid('logoPreview').src = s.logo;
    gid('logoPreview').classList.remove('hidden');
    gid('logoPlaceholder').classList.add('hidden');
  }
  const classicBtn = gid('templateClassic').querySelector('button');
  const modernBtn = gid('templateModern').querySelector('button');
  if (s.invoiceTemplate === 'modern') {
    gid('templateModern').classList.add('border-[#4FA03D]', 'bg-green-50');
    gid('templateClassic').classList.remove('border-[#4FA03D]', 'bg-green-50');
    if (modernBtn) { modernBtn.textContent = 'Active'; modernBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all bg-[#4FA03D] text-white'; }
    if (classicBtn) { classicBtn.textContent = 'Available'; classicBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all border border-[#4FA03D] text-[#4FA03D]'; }
  } else {
    gid('templateClassic').classList.add('border-[#4FA03D]', 'bg-green-50');
    gid('templateModern').classList.remove('border-[#4FA03D]', 'bg-green-50');
    if (classicBtn) { classicBtn.textContent = 'Active'; classicBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all bg-[#4FA03D] text-white'; }
    if (modernBtn) { modernBtn.textContent = 'Available'; modernBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all border border-[#4FA03D] text-[#4FA03D]'; }
  }
  if (s.theme === 'dark') {
    gid('themeDark').classList.add('border-[#4FA03D]');
    gid('themeLight').classList.remove('border-[#4FA03D]');
    gid('themeDarkDot').classList.remove('hidden');
    gid('themeLightDot').classList.add('hidden');
  } else {
    gid('themeLight').classList.add('border-[#4FA03D]');
    gid('themeDark').classList.remove('border-[#4FA03D]');
    gid('themeLightDot').classList.remove('hidden');
    gid('themeDarkDot').classList.add('hidden');
  }
  gid('voiceBilling').checked = s.voiceBilling;
  gid('autoSave').checked = s.autoSave;
}

function saveSettings() {
  const s = {
    ...getSettings(),
    shopName: gid('shopName').value.trim(),
    ownerName: gid('ownerName').value.trim(),
    phone: gid('shopPhone').value.trim(),
    email: gid('shopEmail').value.trim(),
    address: gid('shopAddress').value.trim(),
    gst: gid('shopGst').value.trim(),
    defaultGst: parseFloat(gid('defaultGst').value) || 5,
    invoicePrefix: gid('invoicePrefix').value.trim() || 'INV',
    theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    voiceBilling: gid('voiceBilling').checked,
    autoSave: gid('autoSave').checked
  };
  saveSettingsToStorage(s);
  showToast('Settings saved successfully!');
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('File too large. Max 2MB.'); return; }
  const reader = new FileReader();
  reader.onload = function (ev) {
    const dataUrl = ev.target.result;
    const s = getSettings();
    s.logo = dataUrl;
    saveSettingsToStorage(s);
    gid('logoPreview').src = dataUrl;
    gid('logoPreview').classList.remove('hidden');
    gid('logoPlaceholder').classList.add('hidden');
    showToast('Logo uploaded! Save settings to confirm.');
  };
  reader.readAsDataURL(file);
}

function selectTheme(mode) {
  const s = getSettings();
  s.theme = mode;
  saveSettingsToStorage(s);
  applyTheme(mode);
  loadSettings();
}

function selectTemplate(tpl) {
  const s = getSettings();
  s.invoiceTemplate = tpl;
  saveSettingsToStorage(s);
  loadSettings();
  const classicBtn = gid('templateClassic').querySelector('button');
  const modernBtn = gid('templateModern').querySelector('button');
  if (tpl === 'classic') {
    classicBtn.textContent = 'Active'; classicBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all bg-[#4FA03D] text-white';
    modernBtn.textContent = 'Available'; modernBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all border border-[#4FA03D] text-[#4FA03D]';
  } else {
    modernBtn.textContent = 'Active'; modernBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all bg-[#4FA03D] text-white';
    classicBtn.textContent = 'Available'; classicBtn.className = 'px-6 py-2 rounded-xl text-sm font-bold transition-all border border-[#4FA03D] text-[#4FA03D]';
  }
}

function gid(id) { return document.getElementById(id); }

function showToast(msg) {
  const existing = document.querySelector('.settings-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'settings-toast fixed bottom-6 right-6 bg-[#4FA03D] text-white px-8 py-4 rounded-2xl shadow-2xl font-bold z-[100] animate-bounce-in';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

document.addEventListener('DOMContentLoaded', loadSettings);
