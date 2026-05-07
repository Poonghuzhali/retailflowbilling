function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function getThemeFromSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('retailflow_settings') || '{}');
    return s.theme || 'light';
  } catch { return 'light'; }
}

document.addEventListener('DOMContentLoaded', function () {
  applyTheme(getThemeFromSettings());
});
