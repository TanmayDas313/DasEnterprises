/* DAS ENTERPRISE — Protected Admin Dashboard Logic (Supabase Auth Integration) */

let supabaseAdmin = null;
let allEnquiries = [];

document.addEventListener('DOMContentLoaded', () => {
  initSupabaseAdmin();
});

function initSupabaseAdmin() {
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey || config.url === 'YOUR_SUPABASE_PROJECT_URL') {
    console.warn('Supabase credentials pending configuration in js/supabase-config.js');
    showLoginError('Supabase credentials not configured. Please check js/supabase-config.js.');
    return;
  }

  if (window.supabase) {
    try {
      supabaseAdmin = window.supabase.createClient(config.url, config.anonKey);
      
      // Subscribe to Auth state changes
      supabaseAdmin.auth.onAuthStateChange((event, session) => {
        if (session) {
          showDashboardView(session.user.email);
        } else {
          showLoginView();
        }
      });
    } catch (err) {
      console.error('Failed to initialize Supabase Admin client:', err);
    }
  }

  checkAdminSession();
  bindAdminEvents();
}

async function checkAdminSession() {
  if (!supabaseAdmin) {
    showLoginView();
    return;
  }

  try {
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    if (session && session.user) {
      showDashboardView(session.user.email);
    } else {
      showLoginView();
    }
  } catch (err) {
    console.error('Session check failed:', err);
    showLoginView();
  }
}

function showLoginView() {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const userBar = document.getElementById('admin-user-bar');

  if (loginSection) loginSection.classList.remove('hidden');
  if (dashboardSection) dashboardSection.classList.add('hidden');
  if (userBar) userBar.classList.add('hidden');
}

function showDashboardView(userEmail) {
  const loginSection = document.getElementById('admin-login-section');
  const dashboardSection = document.getElementById('admin-dashboard-section');
  const userBar = document.getElementById('admin-user-bar');
  const userEmailDisplay = document.getElementById('admin-email-display');

  if (loginSection) loginSection.classList.add('hidden');
  if (dashboardSection) dashboardSection.classList.remove('hidden');
  if (userBar) userBar.classList.remove('hidden');
  if (userEmailDisplay) userEmailDisplay.textContent = userEmail || 'Admin User';

  loadEnquiries();
}

function bindAdminEvents() {
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');
  const refreshBtn = document.getElementById('refresh-enquiries-btn');
  const searchInput = document.getElementById('admin-search-input');
  const sourceFilter = document.getElementById('admin-source-filter');
  const sortFilter = document.getElementById('admin-sort-filter');
  const closeDetailBtn = document.getElementById('close-detail-modal');
  const closeFooterBtn = document.getElementById('close-modal-footer-btn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-login-email').value.trim();
      const password = document.getElementById('admin-login-password').value.trim();
      const submitBtn = document.getElementById('admin-login-submit');

      hideLoginError();

      if (!email || !password) {
        showLoginError('Please enter both your email address and password.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Authenticating...</span>';
      }

      if (!supabaseAdmin) {
        showLoginError('Supabase client not initialized. Check js/supabase-config.js.');
        resetLoginSubmitBtn(submitBtn);
        return;
      }

      try {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
        
        if (error) {
          console.error('Supabase Auth Sign-In Error:', error);
          if (error.message.includes('Invalid login credentials')) {
            showLoginError('Invalid email or password. Please verify your admin account exists in Supabase Dashboard -> Authentication -> Users.');
          } else {
            showLoginError(error.message || 'Authentication failed. Please try again.');
          }
          resetLoginSubmitBtn(submitBtn);
          return;
        }

        if (data && data.user) {
          showDashboardView(data.user.email);
        }
      } catch (err) {
        console.error('Login Exception:', err);
        showLoginError('An unexpected authentication error occurred.');
      } finally {
        resetLoginSubmitBtn(submitBtn);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (supabaseAdmin) {
        await supabaseAdmin.auth.signOut();
      }
      showLoginView();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadEnquiries();
    });
  }

  if (searchInput) searchInput.addEventListener('input', renderTable);
  if (sourceFilter) sourceFilter.addEventListener('change', renderTable);
  if (sortFilter) sortFilter.addEventListener('change', renderTable);

  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
      document.getElementById('enquiry-detail-modal').classList.add('hidden');
    });
  }
  if (closeFooterBtn) {
    closeFooterBtn.addEventListener('click', () => {
      document.getElementById('enquiry-detail-modal').classList.add('hidden');
    });
  }
}

function resetLoginSubmitBtn(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.textContent = 'Sign In to Dashboard';
}

function showLoginError(msg) {
  const errorDiv = document.getElementById('admin-login-error');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.remove('hidden');
  }
}

function hideLoginError() {
  const errorDiv = document.getElementById('admin-login-error');
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

async function loadEnquiries() {
  const tbody = document.getElementById('enquiries-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-slate-400">Fetching customer enquiries...</td></tr>';

  if (!supabaseAdmin) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-amber-600 font-semibold">Supabase client not initialized.</td></tr>';
    return;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('customer_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-red-600 font-semibold">Error loading enquiries: ${error.message}</td></tr>`;
      return;
    }

    allEnquiries = data || [];
    renderTable();
  } catch (err) {
    console.error('Load enquiries exception:', err);
    if (tbody) tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-red-600 font-semibold">Failed to fetch database records.</td></tr>';
  }
}

function renderTable() {
  const tbody = document.getElementById('enquiries-table-body');
  const countDisplay = document.getElementById('total-enquiries-count');
  const searchVal = (document.getElementById('admin-search-input')?.value || '').toLowerCase();
  const sourceVal = document.getElementById('admin-source-filter')?.value || 'all';
  const sortVal = document.getElementById('admin-sort-filter')?.value || 'newest';

  if (!tbody) return;

  let filtered = allEnquiries.filter(item => {
    const matchesSearch = 
      (item.name || '').toLowerCase().includes(searchVal) ||
      (item.email || '').toLowerCase().includes(searchVal) ||
      (item.business_name || '').toLowerCase().includes(searchVal) ||
      (item.phone || '').toLowerCase().includes(searchVal) ||
      (item.product || '').toLowerCase().includes(searchVal) ||
      (item.industry || '').toLowerCase().includes(searchVal);

    const matchesSource = (sourceVal === 'all') || (item.source === sourceVal);

    return matchesSearch && matchesSource;
  });

  if (sortVal === 'newest') {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else {
    filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  if (countDisplay) countDisplay.textContent = filtered.length;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="p-8 text-center text-slate-400">No matching customer enquiries found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const formattedDate = new Date(item.created_at).toLocaleString();
    return `
      <tr class="hover:bg-slate-50 border-b border-slate-100 transition-colors">
        <td class="p-3.5 font-mono text-[11px] text-slate-500">${formattedDate}</td>
        <td class="p-3.5 font-bold text-navy-900">${escapeHtml(item.name)}</td>
        <td class="p-3.5 font-medium text-slate-700">${escapeHtml(item.business_name || '—')}</td>
        <td class="p-3.5 text-teal-700 font-semibold">${escapeHtml(item.email)}</td>
        <td class="p-3.5 font-mono text-[11px]">${escapeHtml(item.phone)}</td>
        <td class="p-3.5 font-semibold text-amber-800">${escapeHtml(item.product || 'General')}</td>
        <td class="p-3.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getSourceBadgeClass(item.source)}">${item.source}</span></td>
        <td class="p-3.5 text-center">
          <button onclick="viewEnquiryDetail('${item.id}')" class="px-2.5 py-1 bg-navy-900 hover:bg-navy-800 text-white rounded text-[11px] font-bold transition-all">
            View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function getSourceBadgeClass(src) {
  switch (src) {
    case 'contact': return 'bg-teal-100 text-teal-800';
    case 'free_demo': return 'bg-amber-100 text-amber-800';
    case 'get_started': return 'bg-blue-100 text-blue-800';
    case 'product_enquiry': return 'bg-purple-100 text-purple-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

window.viewEnquiryDetail = function(id) {
  const item = allEnquiries.find(e => e.id == id);
  if (!item) return;

  document.getElementById('modal-detail-date').textContent = new Date(item.created_at).toLocaleString();
  document.getElementById('modal-detail-name').textContent = item.name;
  document.getElementById('modal-detail-business').textContent = item.business_name || 'Not specified';
  
  const emailElem = document.getElementById('modal-detail-email');
  emailElem.textContent = item.email;
  emailElem.href = `mailto:${item.email}`;

  const phoneElem = document.getElementById('modal-detail-phone');
  phoneElem.textContent = item.phone;
  phoneElem.href = `tel:${item.phone}`;

  document.getElementById('modal-detail-industry').textContent = item.industry || 'Not specified';
  document.getElementById('modal-detail-product').textContent = item.product || 'General Solution';
  document.getElementById('modal-detail-source').textContent = item.source;
  document.getElementById('modal-detail-message').textContent = item.message || 'No additional message provided.';

  document.getElementById('enquiry-detail-modal').classList.remove('hidden');
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
