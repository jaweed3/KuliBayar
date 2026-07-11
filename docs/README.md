# KuliBayar Documentation

Dokumentasi lengkap untuk semua komponen KuliBayar, termasuk perbaikan Trust Model dan Anti-Spoofing.

## Daftar Dokumentasi

### 📁 Struktur

```
docs/
├── README.md                          # Halaman ini
├── trust-model.md                     # Analisis & arsitektur trust model
├── verification-flow.md               # Flow verifikasi end-to-end
├── anti-spoofing.md                   # Mekanisme anti-spoofing (EXIF, GPS, Liveness)
├── liveness-challenge.md              # Sistem challenge-response
├── location-validation.md             # Validasi lokasi project
├── smart-contracts.md                 # Smart contract architecture
├── api-reference.md                   # API endpoints lengkap
├── deployment.md                      # Panduan deployment
└── security-model.md                  # Security considerations
```

### 🏗️ Arsitektur Trust Model

Lihat [trust-model.md](./trust-model.md) untuk analisis lengkap:
- Problem: Admin tunggal sebagai single point of failure
- Solution: Multi-factor verification (EXIF + GPS + Liveness + Location)
- Skor kombinasi: EXIF 60% + Challenge 20% + Location 20%

### 🔐 Anti-Spoofing

Lihat [anti-spoofing.md](./anti-spoofing.md) untuk detail:
- EXIF validation (GPS + timestamp)
- GPS accuracy check (threshold 50m)
- Liveness challenge (OCR-based)
- Location cross-validation (Haversine formula)

### 📍 Flow Verifikasi

Lihat [verification-flow.md](./verification-flow.md) untuk flow lengkap:
1. User dapat GPS (dengan accuracy check)
2. User dapatkan challenge (random kode)
3. User tulis kode di kertas, ambil foto
4. Backend verifikasi multi-factor
5. Skor kombinasi → approve/reject
