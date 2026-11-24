# Remittance Tracker API

## Run locally

Install and start [MongoDB Community Server](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/), or use a MongoDB Atlas database.

From this directory in Windows Command Prompt, install dependencies and start the development server:

```cmd
npm install
npm run seed
npm run dev
```

The API connects to `mongodb://127.0.0.1:27017/remittance_tracker` by default. For Atlas or a different server, set `MONGODB_URI` in the same terminal before running the seed or server:

```cmd
set "MONGODB_URI=your-mongodb-connection-string"
```

Keep connection strings containing credentials private. `.env.example` lists supported variables; the API does not automatically load `.env` files.

The seed command inserts the original sample records if their IDs do not already exist. It does not overwrite existing records. Data created by the old in-memory API cannot be recovered after that server has stopped; records saved in the browser are not automatically imported.

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
| DELETE | `/api/budgets/:id` | Delete a budget |


## Resource Details

### Remittances

The API stores remittances in MongoDB. New records receive an ID generated with `crypto.randomUUID()`. Remittance records use `recipient`, `amount`, `rate`, `date`, and `purpose` fields.

### External Currency API

The API fetches live exchange rates with a 5-second timeout and 60-second caching to prevent redundant external requests. It returns a custom JSON shape, not the raw external response.

### Budgets

The API stores budgets in MongoDB and uses Zod to validate the information. Budget records use `userId`, `currency`, `monthlyLimit`, `month`, and `year` fields.

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
curl -i -X POST http://localhost:4000/api/budgets -H "Content-Type: application/json" -d '{"userId":"user1","currency":"CAD","monthlyLimit":1000,"month":"November","year":2026}'
```
**Update budget (Expect 200):**

```bash
curl -i -X PUT http://localhost:4000/api/budgets/b1a2c3d4-e5f6-7890-abcd-ef1234567890 -H "Content-Type: application/json" -d '{"userId":"user-1","currency":"INR","monthlyLimit":35000,"month":"November","year":2026}'
```
**Delete budget (Expect 204):**

```bash
curl -i -X DELETE http://localhost:4000/api/budgets/b1a2c3d4-e5f6-7890-abcd-ef1234567890
```
**Validation failure (Expect 400):**

```bash
curl -i -X POST http://localhost:4000/api/budgets -H "Content-Type: application/json" -d '{"userId":""}'
```
