# 🐛 Mundo Tango Security Bug Bounty Program

**Last Updated:** November 13, 2025  
**Program Status:** Active  
**Contact:** security@mundotango.life

---

## 🎯 Program Overview

Mundo Tango values the security community and recognizes the important role that independent security researchers play in keeping our platform safe. This bug bounty program rewards researchers who discover and responsibly disclose security vulnerabilities.

---

## 💰 Bounty Rewards

We offer competitive rewards based on the severity and impact of discovered vulnerabilities:

### **Critical Severity** ($500 - $2,000)
- Remote code execution (RCE)
- SQL injection leading to data breach
- Authentication bypass allowing account takeover
- Payment system manipulation
- Mass data exfiltration

### **High Severity** ($200 - $500)
- Cross-site scripting (XSS) with significant impact
- Server-side request forgery (SSRF)
- Privilege escalation
- Information disclosure of sensitive data
- CSRF on critical functions

### **Medium Severity** ($50 - $200)
- Cross-site scripting (XSS) with limited impact
- Broken access control
- Open redirects to malicious sites
- Rate limiting bypass
- Session management issues

### **Low Severity** ($25 - $50)
- Security misconfigurations
- Information leakage (non-sensitive)
- Minor CSRF issues
- Clickjacking

---

## 📋 Scope

### **IN SCOPE**

✅ **Primary Targets:**
- `https://mundotango.life` - Main application
- `https://api.mundotango.life` - API endpoints
- `https://admin.mundotango.life` - Admin panel

✅ **Attack Vectors:**
- Authentication and authorization flaws
- Injection vulnerabilities (SQL, NoSQL, XSS, etc.)
- Business logic flaws
- CSRF vulnerabilities
- Server-side security issues
- API abuse and rate limiting bypass
- Payment processing vulnerabilities
- Data validation issues

### **OUT OF SCOPE**

❌ **Excluded:**
- Third-party services (Stripe, Supabase, Cloudflare)
- Social engineering attacks
- Denial of Service (DoS/DDoS) attacks
- Physical security testing
- Attacks requiring physical access to devices
- Spam or social media presence
- Subdomain takeovers for unused subdomains
- Content spoofing without security impact
- Missing security headers (without demonstrable impact)
- SSL/TLS configuration issues (without demonstrable vulnerability)
- User enumeration (unless leading to account compromise)
- Clickjacking on non-sensitive pages
- Logout CSRF
- CSV injection without demonstrable impact
- Brute force attacks

---

## 📝 Responsible Disclosure Policy

We ask that all security researchers follow these responsible disclosure guidelines:

### **DO:**
- ✅ Report vulnerabilities privately through our designated channel
- ✅ Give us reasonable time to address the issue before public disclosure (90 days recommended)
- ✅ Provide detailed reproduction steps
- ✅ Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- ✅ Only test against your own accounts or test accounts you create

### **DON'T:**
- ❌ Access, modify, or delete other users' data
- ❌ Perform attacks that could harm platform availability
- ❌ Social engineer, phish, or physically attack our staff or infrastructure
- ❌ Demand payment before reporting a vulnerability
- ❌ Publicly disclose a vulnerability before we've had time to address it
- ❌ Spam or flood our systems with automated scanners

---

## 🚀 How to Submit

### **1. Prepare Your Report**

Include the following information:
- **Vulnerability Title** - Clear, descriptive name
- **Severity** - Your assessment (Critical/High/Medium/Low)
- **Description** - What is the vulnerability?
- **Impact** - What can an attacker do with this?
- **Steps to Reproduce** - Detailed, numbered steps
- **Proof of Concept** - Screenshots, videos, or code
- **Suggested Fix** - (Optional) How to remediate
- **Your Contact Info** - For follow-up questions

### **2. Submit Report**

**Email:** security@mundotango.life  
**Subject:** `[BUG BOUNTY] Vulnerability Title`

**Alternative:**
- Via our security contact form: https://mundotango.life/security/report
- Via encrypted email (PGP key available at: https://mundotango.life/.well-known/pgp-key.asc)

### **3. Wait for Response**

- **Initial Response:** Within 3 business days
- **Triage:** Within 5 business days
- **Fix Timeline:** Varies by severity (Critical: 7 days, High: 14 days, Medium: 30 days, Low: 90 days)
- **Bounty Payment:** Within 30 days of fix verification

---

## ⚖️ Legal Safe Harbor

Mundo Tango commits to not pursue legal action against security researchers who:

1. Follow our responsible disclosure policy
2. Make good faith efforts to avoid privacy violations and service disruption
3. Act only to identify and report security vulnerabilities
4. Do not exploit vulnerabilities beyond what is necessary to prove the issue

This safe harbor applies only to security research conducted under these guidelines and does not apply to violations of our Terms of Service unrelated to security research.

---

## 🏆 Hall of Fame

We publicly recognize researchers who help us improve our security (with their permission):

**2025 Contributors:**
- *Your name could be here!*

---

## 📞 Contact

**Security Team Email:** security@mundotango.life  
**PGP Key:** https://mundotango.life/.well-known/pgp-key.asc  
**Security Page:** https://mundotango.life/security

---

## 📚 Additional Resources

- **Security Advisories:** https://mundotango.life/security/advisories
- **Security Updates:** https://mundotango.life/blog/security
- **Privacy Policy:** https://mundotango.life/privacy
- **Terms of Service:** https://mundotango.life/terms

---

## ❓ FAQ

### **Q: Can I test without permission?**
A: No. You must follow this responsible disclosure policy.

### **Q: Will I get paid for a duplicate report?**
A: No. Only the first reporter of a unique vulnerability receives a bounty.

### **Q: Can I share my findings on social media?**
A: Only after we've fixed the vulnerability and explicitly approve public disclosure.

### **Q: What if I accidentally cause damage?**
A: Contact us immediately at security@mundotango.life. If you followed our guidelines in good faith, you're protected by our safe harbor.

### **Q: Can I use automated scanners?**
A: Limited automated scanning is acceptable if it doesn't impact service availability. Always use low-intensity scans.

### **Q: How do I know my report was received?**
A: You'll receive an automated acknowledgment within 1 hour, and a human response within 3 business days.

---

**Thank you for helping keep Mundo Tango safe!** 🙏

We value the security research community and appreciate your efforts to make our platform more secure for all users.

---

*This bug bounty program is governed by the laws of the United States. By participating, you agree to these terms and conditions.*
