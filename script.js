// Format currency
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
};

// Language switcher functionality
const setLang = (lang) => {
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('sigma_lang', lang);
  window.dispatchEvent(new Event('langChanged'));
};

// DOM Content Loaded Init
document.addEventListener('DOMContentLoaded', () => {
  // Initialize language
  const savedLang = localStorage.getItem('sigma_lang') || 'id'; // default to id (Indonesian)
  setLang(savedLang);

  // Add event listener to any elements requiring dynamic scroll fade-in
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(element => {
    observer.observe(element);
  });
});
