# Paper Portfolio Tracker

A clean paper stock investment portfolio tracker built with Next.js App Router, TypeScript, Tailwind CSS, Convex, and Alpha Vantage.

## What is built

- Dashboard page using the Next.js App Router
- Add stock holding form with ticker, company name, shares, and average buy price
- Convex mutations and queries for saved holdings
- Holdings list with total invested, current quote, current value, and profit/loss
- Delete holding button
- Server-side Alpha Vantage search, quote, news, and chart routes using environment variables
- Mobile-friendly Tailwind CSS layout

This is a paper portfolio app only. It does not place trades and does not connect to brokerages.

## Setup

Install dependencies:

```bash
npm install
```

Create a Convex project and generate backend bindings:

```bash
npx convex dev
```

Copy the example env file and add your keys:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_URL=https://your-deployment.convex.cloud
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-key
```

Run the app:

```bash
npm run dev
```
