# Remittance Tracker API

## Run locally

From this directory, install dependencies and start the development server:

```bash
npm install
npm run dev
```

The server listens on port `4000` by default. Set the `PORT` environment variable to use a different port.

Check that it is running at [http://localhost:4000/health](http://localhost:4000/health).

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/remittances` | List all remittances |
| GET | `/api/remittances/:id` | Get a remittance by ID |
| POST | `/api/remittances` | Create a remittance |
| PATCH | `/api/remittances/:id` | Update a remittance |
| DELETE | `/api/remittances/:id` | Delete a remittance |
| GET | `/api/exchange-rates?from=USD&to=EUR&amount=100` | Get exchange rate and optional converted amount |
| GET | `/api/budgets` | List all budgets |
| GET | `/api/budgets/:id` | Get a budget by ID |
| POST | `/api/budgets` | Create a budget |
| PUT | `/api/budgets/:id` | Replace/Update a budget |
| PATCH | `/api/budgets/:id` | Partially update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |


## Resource Details

### Remittances

The API keeps remittances in memory and starts with sample records. Records are reset to the seed data when the server restarts. New records receive an ID generated with `crypto.randomUUID()`. Remittance records use `recipient`, `amount`, `rate`, `date`, and `purpose` fields.

### External Currency API

The API fetches live exchange rates with a 5-second timeout and 60-second caching to prevent redundant external requests. It returns a custom JSON shape, not the raw external response.

### Budgets

The API stores the budget data in memory and uses Zod to validate the information. Budget records use `userId`, `currency`, `monthlyLimit`, `month`, and `year` fields.

## Testing

Run the following curl commands in your terminal to test all endpoints.

### Remittances

**List remittances (Expect 200):**

```bash
curl -i http://localhost:4000/api/remittances
```

**Get single remittance (Expect 200):**

```bash
curl -i http://localhost:4000/api/remittances/<valid-id>
```

**Get missing remittance (Expect 404):**

```bash
curl -i http://localhost:4000/api/remittances/invalid-id-123
```

**Create remittance (Expect 201):**

```bash
curl -i -X POST http://localhost:4000/api/remittances -H "Content-Type: application/json" -d '{"recipient":"Test","amount":100,"rate":60,"date":"2026-10-25","purpose":"Test"}'
```

**Update remittance (Expect 200):**

```bash
curl -i -X PATCH http://localhost:4000/api/remittances/<valid-id> -H "Content-Type: application/json" -d '{"amount":200}'
```

**Delete remittance (Expect 204):**

```bash
curl -i -X DELETE http://localhost:4000/api/remittances/<valid-id>
```

**Validation failure (Expect 400):**

```bash
curl -i -X POST http://localhost:4000/api/remittances -H "Content-Type: application/json" -d '{"recipient":""}'
```

### External API

**Exchange rate (Expect 200):**

```bash
curl -i 'http://localhost:4000/api/exchange-rates?from=CAD&to=INR&amount=500'
```

### Budgets

**List budgets (Expect 200):**

```bash
curl -i http://localhost:4000/api/budgets
```
**Get budget by ID(Expect 200):**

```bash
curl -i http://localhost:4000/api/budgets/b1a2c3d4-e5f6-7890-abcd-ef1234567890
```
**Create budget (Expect 201):**

```bash
curl -i -X POST http://localhost:4000/api/budgets -H "Content-Type: application/json" -d '{"userId":"user1","currency":"CAD","monthlyLimit":1000,"month":10,"year":2026}'
```
**Update budget (Expect 200):**

```bash
curl -i -X PATCH http://localhost:4000/api/budgets/b1a2c3d4-e5f6-7890-abcd-ef1234567890 -H "Content-Type: application/json" -d '{"monthlyLimit":35000}'
```
**Delete budget (Expect 204):**

```bash
curl -i -X DELETE http://localhost:4000/api/budgets/b1a2c3d4-e5f6-7890-abcd-ef1234567890
```
**Validation failure (Expect 400):**

```bash
curl -i -X POST http://localhost:4000/api/budgets -H "Content-Type: application/json" -d '{"userId":""}'
```
