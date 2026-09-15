import { filterAdminLeads } from '@/features/admin/adminLeadsTable.js';
import { exportLeadsToCSV, seedSampleLeads } from '@/features/admin/leadActions.js';
import { closeModal, closeModalOnBackdrop } from '@/features/modals/modalManager.js';

/** Quick admin CRM lead table dialog. */
export default function AdminModal() {
  return (
    <div className="modal-overlay" id="adminModal" onClick={(event) => closeModalOnBackdrop(event, 'adminModal')}>
      <div className="modal-card modal-card--wide">
        <div className="modal-card__header">
          <h3 className="modal-card__title">V-DESK Lead CRM Pipeline</h3>
          <button className="modal-card__close" onClick={() => closeModal('adminModal')}>
            ×
          </button>
        </div>
        <p className="modal-card__subtitle">In-memory & localStorage Lead Pipeline Management System.</p>
        <div className="admin-metrics-row">
          <div className="admin-metric-card">
            <span className="admin-metric-lbl">Total Inquiries</span>{' '}
            <strong className="admin-metric-val" id="totalLeadsMetric">
              0
            </strong>
          </div>
          <div className="admin-metric-card">
            <span className="admin-metric-lbl">New Leads</span>{' '}
            <strong className="admin-metric-val" id="newLeadsMetric">
              0
            </strong>
          </div>
          <div className="admin-metric-card">
            <span className="admin-metric-lbl">Qualified</span>{' '}
            <strong className="admin-metric-val" id="qualifiedLeadsMetric">
              0
            </strong>
          </div>
          <div className="admin-metric-card">
            <span className="admin-metric-lbl">Converted</span>{' '}
            <strong className="admin-metric-val" id="convertedLeadsMetric">
              0
            </strong>
          </div>
        </div>
        <div className="admin-controls-row">
          <input
            type="text"
            id="adminSearchInput"
            className="form-input"
            placeholder="Search by name, phone or city..."
            onInput={() => filterAdminLeads()}
          />{' '}
          <select id="adminStatusFilter" className="form-select" onChange={() => filterAdminLeads()}>
            <option value="all">All Statuses</option>
            <option value="NEW">New Inquiries</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>{' '}
          <button className="btn btn--outline btn--sm" onClick={() => exportLeadsToCSV()}>
            <i className="ph-bold ph-download-simple" />
            Export CSV
          </button>{' '}
          <button className="btn btn--secondary btn--sm" onClick={() => seedSampleLeads()}>
            <i className="ph-bold ph-arrows-clockwise" />
            Seed Demo Data
          </button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>City</th>
                <th>Service</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="adminLeadsTableBody" />
          </table>
        </div>
      </div>
    </div>
  );
}
