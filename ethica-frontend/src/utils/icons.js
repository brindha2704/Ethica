export const icons = {
  Menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  X: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  LogOut: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>`,
  LayoutDashboard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  Users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  FileText: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`,
  CheckSquare: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  Settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h1.56a1.5 1.5 0 0 1 1.5 1.5v.42a2 2 0 0 0 1.11 1.79l.11.05a2 2 0 0 0 2.1-.35l.38-.34a1.5 1.5 0 0 1 2.12 2.12l-.34.38a2 2 0 0 0-.35 2.1l.05.11a2 2 0 0 0 1.79 1.11h.42a1.5 1.5 0 0 1 1.5 1.5v1.56a1.5 1.5 0 0 1-1.5 1.5h-.42a2 2 0 0 0-1.79 1.11l-.05.11a2 2 0 0 0 .35 2.1l.34.38a1.5 1.5 0 0 1-2.12 2.12l-.38-.34a2 2 0 0 0-2.1-.35l-.11.05a2 2 0 0 0-1.11 1.79v.42a1.5 1.5 0 0 1-1.5 1.5h-1.56a1.5 1.5 0 0 1-1.5-1.5v-.42a2 2 0 0 0-1.11-1.79l-.11-.05a2 2 0 0 0-2.1.35l-.38.34a1.5 1.5 0 0 1-2.12-2.12l.34-.38a2 2 0 0 0 .35-2.1l-.05-.11a2 2 0 0 0-1.79-1.11h-.42a1.5 1.5 0 0 1-1.5-1.5v-1.56a1.5 1.5 0 0 1 1.5-1.5h.42a2 2 0 0 0 1.79-1.11l.05-.11a2 2 0 0 0-.35-2.1l-.34-.38a1.5 1.5 0 0 1 2.12-2.12l.38.34a2 2 0 0 0 2.1.35l.11-.05a2 2 0 0 0 1.11-1.79v-.42A1.5 1.5 0 0 1 12.22 2Z"/><circle cx="12" cy="12" r="3"/></svg>`
};

export function createIcons({ icons: selectedIcons }) {
  document.querySelectorAll('[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    // Map data-lucide attribute to our icons object
    // Handle kebab-case (data-lucide="layout-dashboard") to camelCase (LayoutDashboard)
    const camelIconName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const svg = icons[camelIconName] || icons[iconName];
    if (svg) {
      el.innerHTML = svg;
    }
  });
}
