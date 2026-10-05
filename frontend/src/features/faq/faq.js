/* Accordions: homepage FAQ, virtual office FAQ and coworking FAQ. */

export function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (!item) return;
  const wasOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item').forEach((i) => {
    if (i !== item) {
      i.classList.remove('open');
      const ans = i.querySelector('.faq-item__answer');
      if (ans) ans.style.maxHeight = null;
    }
  });

  const answer = item.querySelector('.faq-item__answer');
  if (wasOpen) {
    item.classList.remove('open');
    if (answer) answer.style.maxHeight = null;
  } else {
    item.classList.add('open');
    if (answer) answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
  }
}

export function toggleVoFaq(btn) {
  if (!btn) return;
  const item = btn.closest('.vo-faq-item');
  if (!item) return;

  const isActive = item.classList.contains('active');

  document.querySelectorAll('.vo-faq-item').forEach((el) => {
    el.classList.remove('active');
    el.querySelector('.vo-faq-trigger')?.setAttribute('aria-expanded', 'false');
  });

  if (!isActive) {
    item.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
  }
}

export function toggleCwFaq(btn) {
  const item = btn.closest('.cw-faq-item');
  if (!item) return;

  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !isExpanded);
  item.classList.toggle('active', !isExpanded);
}
