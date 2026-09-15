css_to_append = """

/* ==========================================================================
   PRD V2.0 MODAL MASTER REFINEMENTS & CONTRAST ELEVATION
   ========================================================================== */

/* Universal Modal Backdrop & Card Core */
.modal-overlay {
  z-index: 99999 !important;
  background: rgba(5, 19, 43, 0.75) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
}

.modal-card {
  max-height: 92vh !important;
  border-radius: 16px !important;
  box-shadow: 0 30px 80px rgba(5, 19, 43, 0.45) !important;
  overflow-y: auto !important;
}

/* Sizing Modifiers */
.modal-card--room-booking {
  max-width: 720px !important;
  width: 100% !important;
  background: #FFFFFF !important;
  border: 1px solid rgba(197, 146, 57, 0.25) !important;
}

.modal-card--customer-portal {
  max-width: 1060px !important;
  width: 95vw !important;
  background: #FFFFFF !important;
  border: 1px solid rgba(197, 146, 57, 0.25) !important;
}

.modal-card--full-admin {
  max-width: 1260px !important;
  width: 96vw !important;
  background: #05132B !important;
  border: 1px solid rgba(197, 146, 57, 0.3) !important;
  color: #FFFFFF !important;
}

.modal-card--full-explorer {
  max-width: 1260px !important;
  width: 96vw !important;
  background: #FFFFFF !important;
  border: 1px solid rgba(197, 146, 57, 0.25) !important;
}

.modal-card--kyc {
  max-width: 700px !important;
  width: 100% !important;
  background: #FFFFFF !important;
}

/* Header Contrast Fixes: White on Navy */
.modal-card--full-explorer .modal-card__header,
.modal-card--customer-portal .modal-card__header {
  background: linear-gradient(135deg, #05132B 0%, #081D40 100%) !important;
  padding: 1.25rem 1.75rem !important;
  border-bottom: 2px solid #C59239 !important;
  border-radius: 16px 16px 0 0 !important;
}

.modal-card--full-explorer .modal-card__title,
.modal-card--customer-portal .modal-card__title,
.modal-card--full-admin .modal-card__title {
  color: #FFFFFF !important;
  font-size: 1.25rem !important;
  font-weight: 700 !important;
}

.modal-card--full-explorer .explorer-badge,
.modal-card--customer-portal .portal-badge {
  color: #C59239 !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  letter-spacing: 0.05em !important;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.modal-card--full-explorer .modal-card__close,
.modal-card--customer-portal .modal-card__close,
.modal-card--full-admin .modal-card__close {
  color: #FFFFFF !important;
  opacity: 0.8;
  font-size: 1.75rem;
  transition: opacity 0.2s;
  background: transparent;
  border: none;
  cursor: pointer;
}

.modal-card--full-explorer .modal-card__close:hover,
.modal-card--customer-portal .modal-card__close:hover,
.modal-card--full-admin .modal-card__close:hover {
  opacity: 1;
}

/* Admin Suite Contrast */
.modal-card--full-admin .admin-modal-brand h3 {
  color: #FFFFFF !important;
}

.modal-card--full-admin .admin-modal-brand p {
  color: rgba(255, 255, 255, 0.7) !important;
}

.modal-card--full-admin .admin-tab-btn {
  color: rgba(255, 255, 255, 0.75) !important;
  border-bottom: 2px solid transparent !important;
}

.modal-card--full-admin .admin-tab-btn:hover {
  color: #FFFFFF !important;
}

.modal-card--full-admin .admin-tab-btn.active {
  color: #C59239 !important;
  border-bottom-color: #C59239 !important;
}

/* Booking State Stepper */
.booking-state-stepper {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: #F8FAFC !important;
  border: 1px solid #E2E8F0 !important;
  border-radius: 12px !important;
  padding: 0.75rem 1.25rem !important;
  margin: 1.25rem 0 !important;
  gap: 0.5rem !important;
}

.state-step {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  color: #64748B !important;
  white-space: nowrap !important;
}

.state-step span {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  background: #E2E8F0 !important;
  color: #475569 !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
}

.state-step.active {
  color: #081D40 !important;
  font-weight: 700 !important;
}

.state-step.active span {
  background: #081D40 !important;
  color: #FFFFFF !important;
}

.state-step.completed {
  color: #10B981 !important;
}

.state-step.completed span {
  background: #10B981 !important;
  color: #FFFFFF !important;
}

.state-step-arrow {
  color: #CBD5E1 !important;
  font-weight: 700 !important;
  font-size: 0.9rem !important;
}

/* Hold Timer Card */
.hold-timer-card {
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 16px;
  margin: 1.5rem 0;
}

.hold-timer-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #F59E0B;
  background: #FFFFFF;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
  margin-bottom: 1.25rem;
}

.hold-timer-circle span {
  font-size: 1.8rem;
  font-weight: 800;
  color: #B45309;
  font-family: monospace;
}

.hold-timer-circle small {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #92400E;
  letter-spacing: 0.05em;
  font-weight: 700;
}

/* KYC Dropzone */
.kyc-upload-box {
  border: 2px dashed #CBD5E1;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  background: #F8FAFC;
  cursor: pointer;
  transition: all 0.2s ease;
}

.kyc-upload-box:hover {
  border-color: #00A896;
  background: #F0FDF4;
}

.kyc-doc-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.kyc-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.kyc-status-badge.verified {
  background: #DCFCE7;
  color: #15803D;
}

.kyc-status-badge.pending {
  background: #FEF3C7;
  color: #B45309;
}
"""

with open('styles.css', 'a', encoding='utf-8') as f:
    f.write(css_to_append)

print('Appended modal master refinements to styles.css successfully.')
