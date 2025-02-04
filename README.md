# AI-Powered Website Planner

## Overview
*To be filled: Provide a short description here explaining how the app helps users plan a strategic website using AI by answering a few simple questions.*

## Features
*To be filled: List out general features of the project.*

---

## Rate-Limiting and Credit System

This system ensures fair usage for both anonymous and authenticated users, offering different tiers and limits depending on the user’s subscription level.

### **Anonymous Users**
- Anonymous users are given a **permanent free rate limit**.
- This limit is displayed to the user as **credits**, and these credits **do not reset**.
- Once the limit is exhausted, anonymous users **cannot generate more AI plans unless they register or subscribe.**
- The rate limit is tied to the user’s IP/device fingerprint (to differentiate between users).

---

### **Free Tier (Authenticated Users)**
- Free-tier users have access to **a specific amount of credits**.
- These credits are displayed as **monthly allowances**.
- Once their credits are exhausted, free-tier users cannot generate new plans until they top up, upgraed to a higher tier or receive promotional credit.
- Credits **automatically reset** at the start of each term via a **cron job**.

---

### **Paid Tiers (Subscription-Based)**
- Paid-tier users are also checked by credits, similar to free-tier users.
- The difference is:
  - They receive a **higher monthly credit allowance** depending on their subscription plan.
  - These credits are displayed and tracked exactly like free-tier credits.
- **Credits automatically reset** at the start of each term (e.g., monthly) via a **cron job**.
- Users can **purchase top-up credits manually** if they need extra credits before the next term begins.

---

### **Subscription-Based and Auto-Renewing Credits**
- For both free and paid tiers, **the cron job handles automatic credit resets and updates the credits directly in the database.**
- The allowance is calculated based on the user’s `tier` or `plan`.

---

### **How the System Differentiates Between User Types**
1. **Anonymous users:**  
   - Identified by their lack of authentication.
   - Rate-limited based on IP/device fingerprint.
   - Permanent free credits are applied.

2. **Authenticated free-tier users:**  
   - Identified by their user ID.
   - Credits are tracked in the `profiles` table or a similar structure.
   - Credits reset automatically each term (monthly).

3. **Paid-tier users:**  
   - Identified by their `tier` or `plan` (e.g., stored in the `profiles` table).
   - Receive monthly credit allowances.
   - Credits reset automatically each term and can be topped up manually.

---

### **Key Implementation Notes**
- **Supabase** is used to authenticate users and enforce **Row Level Security (RLS)** to ensure users can only access their data.
- The **rateLimiter utility** checks the user’s credit balance and rate limits depending on their tier.
- The backend API passes the user’s JWT token dynamically to authenticate requests.
- **Cron jobs** automatically update and reset credits for paid-tier users at the start of each term.

---

## Installation
*To be filled: Instructions for installing and setting up the project locally.*

## API Documentation
*To be filled: List endpoints and describe their use.*

