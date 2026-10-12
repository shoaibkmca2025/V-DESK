/**
 * Subscriptions mapper — shapes subscriptions, agreements and renewals for API responses.
 * Never included: Mongo `_id`, version counters. Staff-only: the owner id, reasons, who acted, the status history.
 */

function mapAgreement(doc, { staff }) {
  return {
    ref: doc.ref,
    period: doc.period,
    periodStart: doc.periodStart,
    periodEnd: doc.periodEnd,
    status: doc.status,
    signedAt: doc.signedAt,
    signatureMethod: doc.signatureMethod,
    ...(staff && { signedRecordedBy: doc.signedRecordedBy }),
  };
}

export function mapRenewal(doc, { staff = false } = {}) {
  return {
    ref: doc.ref,
    forPeriod: doc.forPeriod,
    status: doc.status,
    termMonths: doc.termMonths,
    total_paise: doc.price.total_paise,
    currency: doc.price.currency,
    pricing: doc.price.breakdown,
    dueBy: doc.dueBy,
    appliedAt: doc.appliedAt,
    ...(staff && { orderRef: doc.orderRef, appliedBy: doc.appliedBy }),
    createdAt: doc.createdAt,
  };
}

export function mapAgreementView(doc, { staff = false } = {}) {
  return mapAgreement(doc, { staff });
}

/** A subscription; `agreements` / `renewals` are included when given. */
export function mapSubscription(doc, { agreements, renewals, staff = false } = {}) {
  return {
    ref: doc.ref,
    status: doc.status,
    product: doc.product,
    tenure: doc.tenure,
    termMonths: doc.termMonths,
    total_paise: doc.price.total_paise,
    currency: doc.price.currency,
    orderRef: doc.orderRef,
    kycRef: doc.kycRef,
    period: doc.period,
    currentPeriodStart: doc.currentPeriodStart,
    currentPeriodEnd: doc.currentPeriodEnd,
    graceDays: doc.graceDays,
    graceEndsAt: doc.graceEndsAt,
    activatedAt: doc.activatedAt,
    cancelledAt: doc.cancelledAt,
    ...(staff && {
      customerId: doc.customerId,
      suspendedBy: doc.suspendedBy,
      suspensionReason: doc.suspensionReason,
      cancellationReason: doc.cancellationReason,
      history: doc.history,
    }),
    ...(agreements && { agreements: agreements.map((a) => mapAgreement(a, { staff })) }),
    ...(renewals && { renewals: renewals.map((r) => mapRenewal(r, { staff })) }),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
