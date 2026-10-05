import { switchAdminTab } from '@/features/admin/adminSuite.js';
import { seedSampleLeads } from '@/features/admin/leadActions.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';

/** Admin operations suite dialog. */
export default function AdminSuiteModal() {
  return (
    <div
      className="modal-overlay"
      id="adminSuiteModal"
      onClick={(event) => closeModalOnBackdrop(event, 'adminSuiteModal')}
      aria-hidden="true"
    >
      <div className="modal-card modal-card--full-admin" role="dialog" aria-modal="true">
        <div className="admin-top-bar">
          <div className="admin-top-brand">
            <i className="ph-bold ph-gear-six" style={{ color: 'var(--vd-gold-primary)', fontSize: '1.4rem' }} />
            <div>
              <h3 style={{ margin: '0', fontSize: '1.25rem', color: '#fff' }}>
                V-DESK Centralized Operations & CRM Platform
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Enterprise Operations Console • Role: Super Admin
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn--outline btn--sm" onClick={() => seedSampleLeads()}>
              <i className="ph-bold ph-arrows-clockwise" />
              Reset Demo Data
            </button>
            <button
              className="modal-card__close"
              onClick={() => closeModal('adminSuiteModal')}
              style={{ color: '#fff' }}
            >
              ×
            </button>
          </div>
        </div>
        <div className="admin-nav-tabs">
          <button
            type="button"
            className="admin-tab active"
            onClick={() => switchAdminTab('dashboard')}
            data-tab="dashboard"
          >
            <i className="ph-bold ph-gauge" />
            Executive Dashboard
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('pipeline')} data-tab="pipeline">
            <i className="ph-bold ph-kanban" />
            Leads Pipeline (CRM)
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('customers')} data-tab="customers">
            <i className="ph-bold ph-users" />
            Customers
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('inventory')} data-tab="inventory">
            <i className="ph-bold ph-buildings" />
            Locations & Inventory
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('pricing')} data-tab="pricing">
            <i className="ph-bold ph-currency-inr" />
            Pricing Rules Engine
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('kyc')} data-tab="kyc">
            <i className="ph-bold ph-fingerprint" />
            KYC Verification Desk
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('cms')} data-tab="cms">
            <i className="ph-bold ph-browser" />
            CMS & Search Controls
          </button>
          <button type="button" className="admin-tab" onClick={() => switchAdminTab('telemetry')} data-tab="telemetry">
            <i className="ph-bold ph-chart-line-up" />
            Search Analytics
          </button>
        </div>
        <div
          className="admin-tab-body"
          id="adminTabBody"
          style={{ padding: '24px', maxHeight: 'calc(88vh - 120px)', overflowY: 'auto' }}
        />
      </div>
    </div>
  );
}
