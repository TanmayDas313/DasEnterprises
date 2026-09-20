/* DAS ENTERPRISE — Interactive Frontend & Supabase Integration Controller */

let supabaseClient = null;

document.addEventListener('DOMContentLoaded', () => {
  initSupabaseClient();
  initHeader();
  initMobileMenu();
  initProductCarousel();
  initPricingTabs();
  initFAQAccordion();
  initForms();
  highlightActiveNav();
});

/* Initialize Supabase JS SDK Client with Single Unified Project Credentials */
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey || config.url === 'YOUR_SUPABASE_PROJECT_URL') {
    console.warn('Supabase credentials pending configuration in js/supabase-config.js');
    return null;
  }

  if (window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(config.url, config.anonKey);
      console.log('Connected to single unified Supabase project:', config.url);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
    }
  }
  return supabaseClient;
}

function initSupabaseClient() {
  getSupabaseClient();
}

/* 1. Header Sticky Effect */
function initHeader() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-md', 'py-2');
      header.classList.remove('py-4');
    } else {
      header.classList.remove('shadow-md', 'py-2');
      header.classList.add('py-4');
    }
  });
}

/* 2. Mobile Menu Toggle */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('close-mobile-menu');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }
}

/* 3. Product Carousel Controller (12 Products) */
function initProductCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');
  
  if (!track) return;

  const slides = track.children;
  if (slides.length === 0) return;

  let currentIndex = 0;
  let autoplayTimer = null;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('button');
      dot.className = `w-3 h-3 rounded-full transition-all duration-300 ${i === 0 ? 'bg-teal-400 w-8' : 'bg-slate-700'}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.children;
    for (let i = 0; i < dots.length; i++) {
      if (i === currentIndex) {
        dots[i].className = 'w-8 h-3 rounded-full bg-teal-400 transition-all duration-300';
      } else {
        dots[i].className = 'w-3 h-3 rounded-full bg-slate-700 hover:bg-slate-500 transition-all duration-300';
      }
    }
  }

  function goToSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateDots();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(currentIndex - 1);
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(currentIndex + 1);
      resetAutoplay();
    });
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 4500);
  }

  function resetAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    startAutoplay();
  }

  track.parentElement.addEventListener('mouseenter', () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  });

  track.parentElement.addEventListener('mouseleave', () => {
    startAutoplay();
  });

  startAutoplay();
}

/* 4. Pricing Category Filter Tabs */
function initPricingTabs() {
  const tabBtns = document.querySelectorAll('.pricing-tab-btn');
  const categories = document.querySelectorAll('.pricing-category-section');

  if (tabBtns.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const categoryId = btn.getAttribute('data-category');

      tabBtns.forEach(b => {
        b.classList.remove('bg-navy-900', 'text-white', 'shadow-md');
        b.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      });
      btn.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100');
      btn.classList.add('bg-navy-900', 'text-white', 'shadow-md');

      if (categoryId === 'all') {
        categories.forEach(cat => cat.classList.remove('hidden'));
      } else {
        categories.forEach(cat => {
          if (cat.id === categoryId) {
            cat.classList.remove('hidden');
            cat.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            cat.classList.add('hidden');
          }
        });
      }
    });
  });
}

/* 5. FAQ Accordions */
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (header && content) {
      header.addEventListener('click', () => {
        const isOpen = !content.classList.contains('hidden');
        
        faqItems.forEach(otherItem => {
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-icon');
          if (otherContent) otherContent.classList.add('hidden');
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
        });

        if (!isOpen) {
          content.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });
}

/* 6. Form Validation & Secure Supabase Database Submission */
function initForms() {
  const forms = document.querySelectorAll('.enquiry-form');

  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const name = form.querySelector('[name="name"]')?.value.trim() || '';
      const businessName = form.querySelector('[name="business"]')?.value.trim() || '';
      const email = form.querySelector('[name="email"]')?.value.trim() || '';
      const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
      const industry = form.querySelector('[name="industry"]')?.value || '';
      const message = form.querySelector('[name="message"]')?.value.trim() || '';
      const product = form.getAttribute('data-product') || getUrlParam('product') || '';

      let source = 'contact';
      if (product === 'Free Demo') source = 'free_demo';
      else if (product) source = 'product_enquiry';
      else if (form.id === 'hero-demo-form' || form.closest('#get-started')) source = 'free_demo';
      else if (window.location.pathname.includes('contact')) source = 'contact';

      let hasError = false;

      if (!name) {
        showFieldError(form, 'name', 'Please enter your full name');
        hasError = true;
      } else {
        clearFieldError(form, 'name');
      }

      if (!email || !validateEmail(email)) {
        showFieldError(form, 'email', 'Please enter a valid email address');
        hasError = true;
      } else {
        clearFieldError(form, 'email');
      }

      if (!phone || phone.length < 8) {
        showFieldError(form, 'phone', 'Please enter a valid phone number');
        hasError = true;
      } else {
        clearFieldError(form, 'phone');
      }

      if (hasError) return;

      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Submit';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending to Supabase...</span>';
      }

      clearGlobalFormError(form);

      const payload = {
        name,
        business_name: businessName,
        email,
        phone,
        industry,
        product: product || (source === 'free_demo' ? 'Free Demo' : ''),
        message,
        source
      };

      try {
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from('customer_enquiries')
            .insert([payload]);

          if (error) {
            console.error('Supabase Error:', error);
            let userMsg = 'Something went wrong. Please try again.';
            if (error.code === 'PGRST205' || (error.message && error.message.includes('customer_enquiries'))) {
              userMsg = 'Database setup required: Please run supabase_schema.sql in your Supabase SQL Editor to create the "customer_enquiries" table.';
            } else if (error.message) {
              userMsg = `Error: ${error.message}`;
            }
            showGlobalFormError(form, userMsg);
            resetSubmitBtn(submitBtn, originalBtnText);
            return;
          }

          // Successful Database Insertion
          showSuccessModal(name);
          form.reset();
          closeProductEnquiryModal();
        } else {
          showGlobalFormError(form, 'Supabase client not connected. Please check js/supabase-config.js.');
        }
      } catch (err) {
        console.error('Submission Exception:', err);
        showGlobalFormError(form, 'Something went wrong. Please try again.');
      } finally {
        resetSubmitBtn(submitBtn, originalBtnText);
      }
    });
  });
}

function resetSubmitBtn(btn, originalHtml) {
  if (!btn) return;
  btn.disabled = false;
  btn.innerHTML = originalHtml;
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(form, fieldName, msg) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  field.classList.add('border-red-500', 'focus:ring-red-500');
  
  let errText = field.parentElement.querySelector('.error-msg');
  if (!errText) {
    errText = document.createElement('p');
    errText.className = 'error-msg text-xs text-red-600 mt-1';
    field.parentElement.appendChild(errText);
  }
  errText.textContent = msg;
}

function clearFieldError(form, fieldName) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  field.classList.remove('border-red-500', 'focus:ring-red-500');
  const errText = field.parentElement.querySelector('.error-msg');
  if (errText) errText.remove();
}

function showGlobalFormError(form, msg) {
  let errBanner = form.querySelector('.global-form-error');
  if (!errBanner) {
    errBanner = document.createElement('div');
    errBanner.className = 'global-form-error p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl mt-3 text-center';
    form.appendChild(errBanner);
  }
  errBanner.textContent = msg;
}

function clearGlobalFormError(form) {
  const errBanner = form.querySelector('.global-form-error');
  if (errBanner) errBanner.remove();
}

function showSuccessModal(name) {
  let modal = document.getElementById('success-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'success-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-100">
        <div class="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h3 class="text-2xl font-bold text-navy-900 mb-2">Thank You, <span id="modal-user-name"></span>!</h3>
        <p class="text-slate-600 text-sm mb-6">Your enquiry has been recorded in Supabase. A DAS ENTERPRISE TALLY PRIME specialist will contact you shortly.</p>
        <button id="close-modal-btn" class="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 px-6 rounded-xl transition-all">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('modal-user-name').textContent = name || 'Valued Customer';
  modal.classList.remove('hidden');

  document.getElementById('close-modal-btn').onclick = () => {
    modal.classList.add('hidden');
  };
}

/* 7. Product Enquiry Modal Helper Connected to Single Supabase Database */
window.openProductEnquiry = function(productName) {
  let modal = document.getElementById('product-enquiry-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'product-enquiry-modal';
    modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Product Enquiry</span>
            <h3 class="text-xl font-bold text-navy-900 mt-1" id="modal-product-title">Product Name</h3>
          </div>
          <button onclick="closeProductEnquiryModal()" class="p-1 text-slate-400 hover:text-slate-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form id="modal-product-form" class="enquiry-form space-y-3 mt-4" data-product="">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name *</label>
            <input type="text" name="name" required placeholder="Your Name" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Business Name *</label>
            <input type="text" name="business" placeholder="Company Name" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Email *</label>
              <input type="email" name="email" required placeholder="you@domain.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Phone *</label>
              <input type="tel" name="phone" required placeholder="9879005133" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Message / Questions</label>
            <textarea name="message" rows="2" placeholder="Tell us your questions about this solution..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600"></textarea>
          </div>

          <button type="submit" class="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs rounded-xl transition-all shadow-md">
            Submit Product Enquiry
          </button>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
    initForms(); // Bind form listener to newly created modal form
  }

  document.getElementById('modal-product-title').textContent = productName;
  const modalForm = document.getElementById('modal-product-form');
  if (modalForm) modalForm.setAttribute('data-product', productName);
  modal.classList.remove('hidden');
};

window.closeProductEnquiryModal = function() {
  const modal = document.getElementById('product-enquiry-modal');
  if (modal) modal.classList.add('hidden');
};

/* 8. Highlight Active Navigation Link */
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* Modal trigger helpers */
window.openDemoModal = function() {
  const demoSection = document.getElementById('get-started');
  if (demoSection) {
    demoSection.scrollIntoView({ behavior: 'smooth' });
  } else if (typeof openProductEnquiry === 'function') {
    openProductEnquiry('Free Demo');
  } else {
    window.location.href = 'contact.html';
  }
};
