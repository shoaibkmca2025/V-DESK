/** Shared open/close helpers for `.modal-overlay` dialogs. */

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open', 'active');
  }
  document.body.style.overflow = '';
}

/** Closes the dialog only when the click landed on the overlay itself. */
export function closeModalOnBackdrop(e, id) {
  if (e.target.id === id) closeModal(id);
}

/** Opens an overlay that uses the `.active` + `body.modal-open` convention. */
export function openActiveModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return null;
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  return modal;
}
