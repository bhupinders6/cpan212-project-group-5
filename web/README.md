# Remittance Tracker

## Static remittance tracker

Open `index.html` in a browser. Add, edit, and delete remittances; totals and
records are saved in local storage.

Enter an exchange rate to estimate the INR received. This is a tracker only and does not send money.

## Budgets app

The monthly budgets page is a Next.js app. From this directory, install
dependencies and start the development server:

```powershell
npm install
npm run dev
```

Open [http://localhost:3000/budgets](http://localhost:3000/budgets). Budgets are
saved in browser storage. Monthly spending uses remittance records stored under
the `remittances` browser-storage key when those records are available in the
same browser origin.