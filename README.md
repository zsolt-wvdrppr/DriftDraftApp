## Overview

AI-Powered Website Planner is an early project I built to accelerate the “requirements discovery” stage for website builds. It helps non-technical clients express what they want in a way that’s clear, structured, and useful for delivery, with marketing context included.

## What it does

- Collects user answers to a guided discovery questionnaire
- Uses AI to expand short inputs into clear, marketing-aware sentences (client-friendly and developer-readable)
- Generates a detailed website planning document, including:
  - Suggested page structure and content
  - Wireframe-style layout suggestions
  - SEO considerations
  - Advertising / acquisition ideas and other recommendations

## Credits and rate-limiting (high level)

- Anonymous users: limited free credits tracked by device/IP
- Free tier: monthly credits (reset automatically), no rollover
- Paid tiers: higher monthly credits + optional top-ups
- Top-ups are consumed before monthly credits; when credits run out, requests are rate-limited

Implementation notes:
- Supabase Auth for authentication
- Supabase RLS to restrict data access per user
- API requests pass JWT dynamically
- Scheduled jobs reset monthly credits each term

## Project context

This was built before my bootcamp and relied heavily on AI assistance, especially for implementation. The codebase reflects early trade-offs and a less mature structure than my newer work; I’m keeping it public to demonstrate learning progress over time.
