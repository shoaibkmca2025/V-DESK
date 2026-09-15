import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';
import { switchPortalTab } from '@/features/portal/customerPortal.js';

/** Customer self-service portal dialog. */
export default function CustomerPortalModal() {
  return (
    <div
      className="modal-overlay"
      id="customerPortalModal"
      onClick={(event) => closeModalOnBackdrop(event, 'customerPortalModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--customer-portal" role="dialog" aria-modal="true">
        <div className="portal-header">
          <div className="portal-user-badge">
            <div className="user-avatar">
              <i className="ph-bold ph-buildings" />
            </div>
            <div className="user-info">
              <h3 className="user-company" id="portalCompanyName">
                Zenith D2C Brands Pvt Ltd
              </h3>
              <span className="user-director">
                Director: Priya Kulkarni • Account: <strong>VD-AC-8921</strong>
              </span>
            </div>
          </div>
          <button className="modal-card__close" onClick={() => closeModal('customerPortalModal')}>
            ×
          </button>
        </div>
        <div className="portal-tabs">
          <button
            type="button"
            className="portal-tab-btn active"
            onClick={() => switchPortalTab('activeServices')}
            data-tab="activeServices"
          >
            <i className="ph-bold ph-check-circle" />
            Active Services
          </button>
          <button
            type="button"
            className="portal-tab-btn"
            onClick={() => switchPortalTab('bookings')}
            data-tab="bookings"
          >
            <i className="ph-bold ph-presentation" />
            Bookings
          </button>
          <button
            type="button"
            className="portal-tab-btn"
            onClick={() => switchPortalTab('documents')}
            data-tab="documents"
          >
            <i className="ph-bold ph-files" />
            Documents & KYC
          </button>
          <button
            type="button"
            className="portal-tab-btn"
            onClick={() => switchPortalTab('invoices')}
            data-tab="invoices"
          >
            <i className="ph-bold ph-receipt" />
            Invoices
          </button>
          <button
            type="button"
            className="portal-tab-btn"
            onClick={() => switchPortalTab('renewals')}
            data-tab="renewals"
          >
            <i className="ph-bold ph-arrows-clockwise" />
            Renewals
          </button>
          <button
            type="button"
            className="portal-tab-btn"
            onClick={() => switchPortalTab('support')}
            data-tab="support"
          >
            <i className="ph-bold ph-headset" />
            Support Desk
          </button>
        </div>
        <div className="portal-tab-content" id="portalTabContent" />
      </div>
    </div>
  );
}
