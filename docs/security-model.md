# Security Model

Analisis keamanan lengkap KuliBayar: attack vectors, mitigations, dan security considerations.

---

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                 SECURITY LAYERS                          │
│                                                         │
│  Layer 1: Smart Contract Security                       │
│  ├── Access control (onlyAdmin, onlyKuli, etc.)         │
│  ├── Reentrancy protection                              │
│  └── Integer overflow protection                        │
│                                                         │
│  Layer 2: Backend Security                              │
│  ├── EXIF validation                                    │
│  ├── GPS accuracy check                                 │
│  ├── Liveness challenge                                 │
│  └── Location validation                                │
│                                                         │
│  Layer 3: Frontend Security                             │
│  ├── Input validation                                   │
│  ├── CSRF protection                                    │
│  └── XSS prevention                                     │
│                                                         │
│  Layer 4: Infrastructure Security                       │
│  ├── HTTPS/TLS                                          │
│  ├── Environment variable protection                    │
│  └── Rate limiting (TODO)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Attack Vectors

### 1. GPS Spoofing

**Attack:** User manipulates GPS coordinates

**Methods:**
- Mock location apps (Android)
- Developer options (Android)
- GPS spoofing apps (iOS jailbreak)
- Browser dev tools (desktop)

**Mitigation:**
- ✅ EXIF GPS cross-validation
- ✅ GPS accuracy check
- ✅ Location validation against project site

**Effectiveness:** HIGH
- EXIF GPS from real photo won't match spoofed GPS
- Accuracy check catches suspiciously perfect GPS

---

### 2. Photo Reuse

**Attack:** User reuses same photo daily

**Methods:**
- Save photo, submit same photo next day
- Use photo from different day
- Use stock photo

**Mitigation:**
- ✅ EXIF timestamp validation
- ✅ EXIF GPS validation
- ✅ Liveness challenge (new code each time)

**Effectiveness:** HIGH
- EXIF timestamp will be old
- Challenge code changes each time
- OCR detects missing code

---

### 3. Screenshot/Edited Photo

**Attack:** User submits screenshot or edited photo

**Methods:**
- Screenshot from camera app
- Photoshop edited photo
- AI generated photo

**Mitigation:**
- ✅ EXIF data check (no EXIF = suspicious)
- ✅ EXIF GPS validation
- ✅ Liveness challenge

**Effectiveness:** MEDIUM-HIGH
- Screenshots have no EXIF data
- Edited photos often lose EXIF
- Challenge code hard to fake

---

### 4. Wrong Location

**Attack:** User submits photo from different location

**Methods:**
- Take photo at home
- Use photo from different site
- GPS spoof + photo from elsewhere

**Mitigation:**
- ✅ Location validation (500m radius)
- ✅ EXIF GPS cross-validation
- ✅ Liveness challenge (must be present)

**Effectiveness:** HIGH
- Location validation catches wrong location
- EXIF GPS from photo won't match

---

### 5. Not Present at Site

**Attack:** User not physically present

**Methods:**
- Have someone else take photo
- Use old photo
- Remote submission

**Mitigation:**
- ✅ Liveness challenge (must write code)
- ✅ EXIF timestamp (must be now)
- ✅ Location validation

**Effectiveness:** MEDIUM-HIGH
- Challenge requires physical presence
- Someone else could do it for them (not prevented)

---

### 6. Challenge Code Theft

**Attack:** Steal challenge code from worker

**Methods:**
- Look over shoulder
- Intercept API call
- Social engineering

**Mitigation:**
- ⚠️ Time-limited (5 minutes)
- ⚠️ One-time use
- ❌ No identity verification

**Effectiveness:** LOW-MEDIUM
- Code expires quickly
- But no way to verify who wrote it

---

### 7. Backend Compromise

**Attack:** Compromise backend server

**Methods:**
- Server vulnerability
- Environment variable leak
- Database injection

**Mitigation:**
- ⚠️ Admin key in env var (risky)
- ✅ Smart contract validation
- ✅ Input validation

**Effectiveness:** MEDIUM
- Backend is single point of failure
- Smart contract provides some protection

---

### 8. Smart Contract Vulnerability

**Attack:** Exploit smart contract bug

**Methods:**
- Reentrancy attack
- Integer overflow
- Access control bypass

**Mitigation:**
- ✅ Solidity 0.8+ (overflow protection)
- ✅ Access control modifiers
- ✅ 43 passing tests
- ⚠️ No formal audit

**Effectiveness:** HIGH
- Modern Solidity prevents many attacks
- But no audit = unknown vulnerabilities

---

## Security Measures

### Smart Contract Security

```solidity
// Access control
modifier onlyAdmin() {
    if (msg.sender != admin) revert NotAuthorized();
    _;
}

// Reentrancy protection (via state updates before external calls)
function _releasePayment(uint256 projectId) internal {
    // Update state BEFORE external call
    project.daysCompleted++;
    project.totalReleased += amount;
    
    // External call
    (bool success, ) = project.kuli.call{value: amount}("");
    require(success, "Transfer failed");
}

// Integer overflow protection (Solidity 0.8+)
uint256 totalAmount = _dailyRate * _durationDays; // Safe in 0.8+
```

### Backend Security

```javascript
// Input validation
if (!projectId || !req.file) {
    return res.status(400).json({ error: 'Missing required fields' });
}

// File type validation
fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images allowed'), false);
    }
}

// File size limit
limits: { fileSize: 5 * 1024 * 1024 } // 5MB

// EXIF validation
const exifData = parseEXIF(photoBuffer);
if (!exifData) {
    score -= 10; // Penalize missing EXIF
}
```

### Frontend Security

```javascript
// Input sanitization
const sanitizeInput = (input) => {
    return input.replace(/[<>]/g, '');
};

// CSRF protection (Next.js built-in)
// Use CSRF tokens for form submissions

// XSS prevention (React built-in)
// React escapes JSX by default
```

---

## Known Vulnerabilities

### 1. Admin Key in Backend (CRITICAL)

**Issue:** `ADMIN_PRIVATE_KEY` stored in environment variable

**Risk:**
- If server compromised, attacker has full control
- Can approve/reject any proof
- Can cancel any project
- Can steal all escrowed funds

**Mitigation:**
- Use multi-signature wallet (Gnosis Safe)
- Use hardware wallet for admin key
- Implement timelock on admin actions

---

### 2. No Backend Authentication (HIGH)

**Issue:** API endpoints have no authentication

**Risk:**
- Anyone can submit proofs
- Anyone can call admin endpoints
- Rate limiting missing

**Mitigation:**
- Add JWT authentication
- Add API key for admin endpoints
- Add rate limiting

---

### 3. Kuli Private Key is Public (HIGH)

**Issue:** `KULI_PRIVATE_KEY` is Anvil default key

**Risk:**
- Anyone can sign as kuli
- Can submit fake proofs
- Can drain funds on mainnet

**Mitigation:**
- Generate new private key for each kuli
- Use wallet connection (MetaMask)
- Never use default keys in production

---

### 4. No Appeal Mechanism (MEDIUM)

**Issue:** Users can only trust admin's decision

**Risk:**
- Admin can reject valid proofs
- Admin can approve invalid proofs
- No escalation path

**Mitigation:**
- Implement multi-signature verification
- Add timelock for dispute resolution
- Add decentralized oracle

---

### 5. No Rate Limiting (MEDIUM)

**Issue:** API endpoints have no rate limiting

**Risk:**
- DDoS attacks
- Spam submissions
- Resource exhaustion

**Mitigation:**
- Add express-rate-limit
- Add CAPTCHA for proof submission
- Add cooldown periods

---

## Security Recommendations

### Immediate (Before Mainnet)

1. **Generate new admin key** - Don't use default Anvil key
2. **Add backend authentication** - JWT or API key
3. **Add rate limiting** - Prevent abuse
4. **Formal smart contract audit** - Before mainnet

### Short-term (1-3 months)

1. **Multi-signature admin** - Gnosis Safe integration
2. **Timelock on admin actions** - 24-48 hour delay
3. **Role separation** - Verifier vs Arbitrator
4. **Emergency pause** - Circuit breaker pattern

### Long-term (3-6 months)

1. **Decentralized oracle** - Chainlink integration
2. **Biometric verification** - Face/fingerprint
3. **Video proof** - Continuous verification
4. **Insurance fund** - For dispute resolution

---

## Testing Security

### Smart Contract Tests

```bash
# Run all tests
forge test

# Run with verbosity
forge test -vvvv

# Check for vulnerabilities
forge inspect src/ProjectEscrow.sol:ProjectEscrow
```

### Backend Tests

```bash
# API tests
npm test

# Security tests
npm run test:security
```

### Penetration Testing

```bash
# SQL injection
curl -X POST http://localhost:3001/api/proofs \
  -d "projectId=1' OR '1'='1"

# XSS
curl -X POST http://localhost:3001/api/proofs \
  -d "projectId=<script>alert('xss')</script>"

# File upload
curl -X POST http://localhost:3001/api/proofs \
  -F "photo=@malicious.exe"
```

---

## Incident Response

### If Admin Key Compromised

1. **Immediately** pause contract (if possible)
2. Transfer remaining funds to new address
3. Deploy new contract with new admin
4. Notify all users
5. Investigate how key was compromised

### If Backend Compromised

1. **Immediately** take server offline
2. Review logs for unauthorized access
3. Rotate all API keys
4. Check for data breach
5. Restore from clean backup

### If Smart Contract Exploited

1. **Immediately** pause contract (if possible)
2. Document the exploit
3. Contact security researchers
4. Deploy fix if possible
5. Compensate affected users

---

## Security Checklist

### Before Deployment

- [ ] Admin key is not default Anvil key
- [ ] All private keys in env vars, not hardcoded
- [ ] Backend has authentication
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] File upload limited to images
- [ ] File size limit enforced
- [ ] EXIF validation working
- [ ] Liveness challenge working
- [ ] Location validation working
- [ ] All tests passing
- [ ] Smart contract audited (if mainnet)

### After Deployment

- [ ] Monitor for suspicious activity
- [ ] Review logs regularly
- [ ] Update dependencies
- [ ] Patch vulnerabilities
- [ ] Backup database
- [ ] Test disaster recovery
