# Remittance Tracker API

## Run locally

From this directory, install dependencies and start the development server:

```powershell
npm install
npm run dev
```

The server listens on port `4000` by default. Set the `PORT` environment
variable to use a different port.

Check that it is running at [http://localhost:4000/health](http://localhost:4000/health).

## Remittances

The API keeps remittances in memory and starts with sample records. Records are
reset to the seed data when the server restarts.

| Method | Path | Description |
|---|---|---|
| GET | `/api/remittances` | List all remittances |
| GET | `/api/remittances/:id` | Get a remittance by ID |
| POST | `/api/remittances` | Create a remittance |
| PATCH | `/api/remittances/:id` | Update a remittance |
| DELETE | `/api/remittances/:id` | Delete a remittance |

New records receive an ID generated with `crypto.randomUUID()`. Remittance
records use `recipient`, `amount`, `rate`, `date`, and `purpose` fields. The
same endpoints are also available under `/api/remitances`.

## Budgets
The API stores the budget data in memory and uses ZOD to check if the information is valid. 
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/budgets` | List all budgets |
| GET | `/api/budgets/:id` | Get a budget by ID |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/:id` | Replace/Update a budget |
| PATCH | `/api/budgets/:id` | Partially update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

Budget records use userId, currency, monthlyLimit, month & year fields. 


