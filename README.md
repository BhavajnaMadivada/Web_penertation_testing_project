# Web Penertation Testing Project

# 🔐 Security Assessment of Firebase-based Applications Against Token Theft

## 📑 Project Overview

This project focuses on the **security evaluation of Firebase-based web applications**, specifically targeting **token theft vulnerabilities**. Firebase Authentication uses **JSON Web Tokens (JWTs)** to manage user sessions. Improper implementation, insecure token storage, or misconfigured Firebase Security Rules can lead to serious risks such as **token theft, unauthorized data access, and privilege escalation**.

This repository contains:
- Web Application used for testing
- Project report with findings and mitigations
- Proof-of-concept (PoC) attack demonstrations
- Supporting screenshots and evidence

---

## 🎯 Objectives

- Evaluate the security of Firebase Authentication mechanisms.
- Identify vulnerabilities that lead to token theft.
- Demonstrate token theft via **Stored XSS** and **misconfigured security rules**.
- Recommend mitigation strategies to prevent these issues.

---

## 🛠️ Test Environment

| Component         | Details                      |
|:----------------:|:----------------------------|
| Operating System   | Windows               |
| URL                | https://sparkle-shop.web.app/|
| Firebase Services  | Authentication, Realtime Database     |
| Tools Used         | Firebase wed SDK, Browser, Burp Suite |
| PoC Application    | Locally hosted web app + Firebase Authentication |

---

## 🕵️‍♂️ Methodology

1. **Reconnaissance**  
   Identify application tech stack and Firebase configurations.
   
2. **Enumeration**  
   Enumerate users, permissions, and accessible endpoints.

3. **Vulnerability Scanning**  
   Check for XSS, insecure storage, and weak security rules.

4. **Exploitation**  
   Demonstrate token theft via:
   - **Stored XSS**
   - **Misconfigured Security Rules**

5. **Post-Exploitation**  
   Reuse stolen tokens to gain unauthorized access.

---

## 🐞 Key Findings

- **Stored Cross-Site Scripting (XSS)** via comment or input fields.
- **Insecure Token Storage** in `localStorage` accessible via client-side scripts.
- **Misconfigured Firebase Security Rules** allowing unrestricted access.

---

## 🛡️ Mitigation Recommendations

- Sanitize and validate all user inputs.
- Store tokens securely (use **HttpOnly** cookies instead of `localStorage`).
- Regularly audit and configure **Firebase Security Rules**.
- Implement **Content Security Policy (CSP)** headers.
- Enable **HttpOnly, Secure, SameSite=Strict** flags on cookies.

---

## 📸 Screenshots & Evidence

The `/screenshots` folder contains:
- User enumeration proof
- XSS payload insertion
- Token theft demonstration using Webhook.site
- Exploited token reuse

---

## 📚 References

- [OWASP Cross-Site Scripting (XSS) Guide](https://owasp.org/www-community/attacks/xss/)
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [WPScan Documentation](https://github.com/wpscanteam/wpscan)

---

## 📌 Author

**Bhavajna Madivada**  
AP22110011280 | April 2025  
Security Testing & Firebase Vulnerability Research

---
