# Trust Model Architecture

Analisis lengkap trust model KuliBayar: problem, solution, dan implementasi.

---

## Problem Statement

### Original Design (Before)

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN TUNGGAL                         │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  Verifikasi     │  │  Resolusi       │              │
│  │  Bukti Kerja    │  │  Dispute        │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                     │                        │
│           └─────────┬───────────┘                        │
│                     │                                    │
│                     ▼                                    │
│           ┌─────────────────┐                           │
│           │  Cancel Proyek  │                           │
│           └─────────────────┘                           │
└─────────────────────────────────────────────────────────┘
```

**Kekurangan:**
1. **Single Point of Failure**: Jika admin key compromise, semua dana bisa dicuri
2. **Tidak Trustless**: Kuli harus percaya admin approve dengan jujur
3. **Centralized Control**: Admin bisa reject bukti kerja sepihak
4. **No Appeal**: Tidak ada mekanisme appeal selain admin itu sendiri

### After Improvements

```
┌─────────────────────────────────────────────────────────┐
│              MULTI-FACTOR VERIFICATION                  │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │  EXIF Validation│  │  GPS Accuracy   │              │
│  │  (60% weight)   │  │  Check          │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                     │                        │
│           ▼                     ▼                        │
│  ┌─────────────────────────────────────────┐           │
│  │         COMBINED SCORE (0-100)          │           │
│  │  Threshold: 60/100 untuk approve        │           │
│  └────────────────────┬────────────────────┘           │
│                       │                                  │
│           ┌───────────┴───────────┐                     │
│           ▼                       ▼                     │
│  ┌─────────────────┐     ┌─────────────────┐          │
│  │  AUTO-RELEASE   │     │  REJECT + REASON│          │
│  │  PAYMENT        │     │                 │          │
│  └─────────────────┘     └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

**Perbaikan:**
1. **Automated Verification**: Tidak perlu admin manual approve
2. **Multi-Factor Scoring**: EXIF + GPS + Liveness + Location
3. **Transparent**: Semua alasan reject tercatat
4. **Difficult to Cheat**: Butuh bypass semua faktor sekaligus

---

## Verification Factors

### 1. EXIF Validation (60% Weight)

**Apa yang diverifikasi:**
- GPS coordinates dari foto (EXIF metadata)
- Timestamp dari foto (EXIF metadata)
- Cross-check EXIF GPS vs submitted GPS

**Threshold:**
- EXIF GPS deviation: ≤100m dari submitted GPS
- EXIF timestamp: harus hari ini, tidak expired
- EXIF timestamp vs submitted timestamp: ≤5 menit

**Contoh reject:**
```
Score: 45/100
Reasons:
- EXIF GPS mismatch: 250m deviation from submitted GPS (-25)
- No EXIF data found (possible screenshot or edited photo) (-10)
- Photo is not from today (-10)
```

### 2. GPS Accuracy Check (Part of EXIF)

**Apa yang diverifikasi:**
- Browser GPS accuracy (harus ≤50m)
- High accuracy mode diaktifkan

**Threshold:**
- Accuracy > 50m: score -15
- Accuracy > 100m: score -25

### 3. Liveness Challenge (20% Weight)

**Apa yang diverifikasi:**
- Foto mengandung kode challenge yang ditulis di kertas
- Kode dikenali oleh OCR (Tesseract.js)

**Flow:**
1. Server generate random kode (8 karakter)
2. Tampilkan ke user: "Tulis di kertas: KULI-A1B2C3D4"
3. User ambil foto dengan kode di kertas
4. Server OCR foto dan cek kode ada

**Threshold:**
- Kode ditemukan di foto: +50
- Challenge words ditemukan: +20
- Clear text detected: +15
- Tidak ada kode: -30

### 4. Location Cross-Validation (20% Weight)

**Apa yang diverifikasi:**
- GPS submitted berada dalam radius project site
- Menggunakan Haversine formula untuk hitung jarak

**Threshold:**
- Default radius: 500m dari project site
- Di dalam radius: +20
- Di luar radius: -25

---

## Scoring Algorithm

```javascript
// Combine scores
let finalScore = verification.score; // EXIF validation score

if (challengeResult && locationResult) {
  // Semua faktor ada
  finalScore = Math.round(
    verification.score * 0.6 +    // EXIF: 60%
    challengeResult.score * 0.2 + // Challenge: 20%
    (locationResult.valid ? 20 : 0) // Location: 20%
  );
} else if (challengeResult) {
  // Hanya EXIF + Challenge
  finalScore = Math.round(
    verification.score * 0.7 +    // EXIF: 70%
    challengeResult.score * 0.3   // Challenge: 30%
  );
} else if (locationResult) {
  // Hanya EXIF + Location
  finalScore = Math.round(
    verification.score * 0.8 +    // EXIF: 80%
    (locationResult.valid ? 20 : 0) // Location: 20%
  );
}

// Threshold
verification.valid = finalScore >= 60;
```

---

## Cheat Scenarios & Mitigations

### Scenario 1: GPS Spoofing
**Attack:** User pakai mock location app
**Mitigation:** EXIF GPS cross-validation
- EXIF GPS dari foto asli akan berbeda dari spoofed GPS
- Score -25 jika deviation > 100m

### Scenario 2: Foto Reuse
**Attack:** User pakai foto yang sama setiap hari
**Mitigation:** EXIF timestamp validation
- EXIF timestamp harus hari ini
- Score -20 jika EXIF timestamp > 24 jam

### Scenario 3: Screenshot/Edited Photo
**Attack:** User pakai screenshot atau edited photo
**Mitigation:** EXIF data check
- Tidak ada EXIF data → score -10
- EXIF GPS tidak match → score -25

### Scenario 4: Lokasi Tidak Sesuai
**Attack:** User foto dari lokasi lain
**Mitigation:** Location cross-validation
- GPS harus dalam radius 500m dari project site
- Score -25 jika di luar radius

### Scenario 5: Tidak Hadir di Lokasi
**Attack:** User tidak hadir tapi upload foto
**Mitigation:** Liveness challenge
- Harus tulis kode di kertas dan foto
- OCR verifikasi kode ada di foto
- Score -30 jika kode tidak ditemukan

---

## Security Considerations

### What This DOES Protect Against
- ✅ GPS spoofing (via EXIF cross-validation)
- ✅ Foto reuse (via EXIF timestamp)
- ✅ Screenshot/edited photos (via EXIF data)
- ✅ Wrong location (via location validation)
- ✅ Not present at site (via liveness challenge)

### What This DOES NOT Protect Against
- ❌ Sophisticated EXIF spoofing (butuh tools khusus)
- ❌ Real-time GPS spoofing + EXIF manipulation
- ❌ Someone else hadir di lokasi (bukan kuli yang bersangkutan)
- ❌ Collusion antara kuli dan verifikator

### Future Improvements
- 🔄 Multi-signature admin (Gnosis Safe)
- 🔄 Role separation (Verifier vs Arbitrator)
- 🔄 Timelock on admin actions
- 🔄 Decentralized oracle (Chainlink)
- 🔄 Biometric verification
- 🔄 Video proof (bukan hanya foto)
