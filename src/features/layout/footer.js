import { addLead } from '@/features/crm/leadStore.js';
import { showToast } from '@/features/ui/toast.js';
import { listen } from '@/lib/pageScope.js';

const HEADER_OFFSET = 80;

/** "VIP rate desk" form in the footer: captures the mobile number as a lead. */
export function handleFooterRateRequest(e) {
  e.preventDefault();
  const form = e.currentTarget ?? e.target;
  const input = form.querySelector('.footer__rate-input');
  const btn = form.querySelector('.footer__rate-submit-btn');
  if (!input || !input.value) return;
  const mobile = input.value.trim();

  const originalHtml = btn.innerHTML;
  btn.innerHTML = '<span>Dispatching...</span> <i class="ph-bold ph-spinner ph-spin"></i>';
  btn.disabled = true;

  setTimeout(() => {
    addLead({
      name: 'Enterprise Client',
      mobile,
      email: 'rate-matrix@vdesk.in',
      city: 'All Metros',
      service: '2026 Commercial Tariff & NOC Package',
      company: 'Confidential Enterprise',
      source: 'Footer VIP Rate Desk',
    });

    input.value = '';
    btn.innerHTML = '<span>Dispatched ✓</span> <i class="ph-bold ph-check-circle"></i>';
    btn.style.background = '#22c55e';
    btn.style.borderColor = '#16a34a';
    btn.style.color = '#FFFFFF';

    showToast(`✓ 2026 Commercial Rate Card & NOC Checklist dispatched to ${mobile} via WhatsApp.`);

    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.disabled = false;
    }, 4000);
  }, 650);
}

/** Footer anchor scrolling and 3D tilt on the trust pills / logo card. */
export function initFooterInteractions() {
  document.querySelectorAll('.site-footer a[href^="#"]').forEach((link) => {
    listen(link, 'click', function onFooterAnchorClick(e) {
      const href = this.getAttribute('href');
      if (!href) return;
      if (href === '#top' || href === '#') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.footer-trust-pill, .footer-logo-card').forEach((card) => {
    listen(card, 'mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    listen(card, 'mouseleave', () => {
      card.style.transform = '';
    });
  });
}
