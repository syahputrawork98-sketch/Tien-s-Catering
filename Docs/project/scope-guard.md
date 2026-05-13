# TC Scope Guard

## Prinsip Scope

Project TC / Tien’s Catering harus dikembangkan bertahap.

Jangan membuka fitur besar tanpa keputusan Room 00.

Jika scope belum jelas, Room 00 harus bertanya kepada user terlebih dahulu.

## Fitur Hold

Fitur besar berikut tetap Hold sampai Room 00 membuka scope secara eksplisit:

- payment gateway production,
- QRIS production,
- upload bukti pembayaran production,
- invoice/pajak production,
- export PDF/CSV production,
- auth production,
- JWT/session/password/RBAC production,
- deployment production,
- Super Admin,
- role management,
- convert package request to order,
- package masuk cart/checkout/order jika belum dibuka,
- fitur legal/pajak production,
- fitur besar lain yang belum diputuskan Room 00.

## Aturan Fitur Hold

Jika fitur belum aman secara backend/schema/data, jangan dibuat production.

Gunakan salah satu pendekatan berikut:

- tampilkan sebagai Hold,
- disabled action,
- empty state yang jujur,
- placeholder dengan catatan,
- dokumentasikan sebagai follow-up.

## Larangan

Jangan membuat:

- production payment,
- production authentication,
- production invoice/legal/tax,
- production deployment,
- production role management,
- production upload flow,
- fitur besar tanpa keputusan Room 00.

## Prinsip Utama

Lebih baik jujur Hold daripada membuat fitur palsu yang terlihat production-ready.