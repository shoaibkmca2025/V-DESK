# Booking module

Meeting-room and workspace bookings, including the 10-minute hold before payment.

- **Mounted at:** `/api/v1/bookings`
- **Build phase:** 2
- **Collections:** `bookings`, `availability_slots`, `holds`
- **Frontend that will call it:** `features/meetingRooms/roomBooking.js`, `features/bookings/bookingStore.js`

## Planned endpoints (relative to the mount path)

- GET /availability?workspaceId=&date=
- POST /hold
- POST /:ref/confirm
- POST /:ref/cancel
- GET /:ref/pass

Full spec: [docs/backend/modules.md §3.6](../../../../docs/backend/modules.md). Layer rules: [backend/README.md](../../../README.md).
