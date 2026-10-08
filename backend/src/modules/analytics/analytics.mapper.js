/**
 * Analytics mapper — stored events → the shape features/analytics/telemetry.js keeps locally
 * (`id, type, data, device, timestamp`, rules.md §42), plus the server's `ref` and receive time.
 */
export function mapEvent(doc) {
  return {
    ref: doc.ref,
    id: doc.clientRef,
    type: doc.type,
    data: doc.data,
    device: doc.device,
    timestamp: doc.occurredAt,
    receivedAt: doc.createdAt,
  };
}
