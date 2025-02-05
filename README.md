# AI-Powered Website Planner

## Overview
*To be filled: Provide a short description here explaining how the app helps users plan a strategic website using AI by answering a few simple questions.*

## Features
*To be filled: List out general features of the project.*

---

## Rate-Limiting and Credit System (Updated)

This system ensures fair usage for both anonymous and authenticated users, with credits and rate limits depending on the user’s subscription plan.

### **Credit System Overview**
1. **Monthly Credits:**  
   - Each subscription tier has a fixed amount of monthly credits, which automatically reset at the start of each term (e.g., monthly) via a cron job.
2. **Top-Up Credits:**  
   - Users can purchase additional credits, which are stored separately and used before monthly credits.
3. **Credit Consumption Order:**  
   - Top-up credits are consumed first, followed by monthly credits.  
   - When no credits remain, the user is rate-limited.

---

### **How It Works**

| User Type            | Credit/Limit System                                                                 |
|---------------------|------------------------------------------------------------------------------------|
| **Anonymous Users**   | Permanent free credits based on device/IP tracking, do not reset.                 |
| **Free-Tier Users**   | Receive monthly credits (reset automatically), with no rollover of unused credits. |
| **Paid-Tier Users**   | Receive higher monthly credits (reset automatically), with top-up credits available.|

---

### **Subscription-Based and Auto-Renewing Credits**
- The monthly credit allowance is reset automatically via a **cron job** at the start of each term.
- Top-up credits are tracked separately and do not expire unless the user unsubscribes.

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

