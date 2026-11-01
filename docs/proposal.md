# Remittance Tracker for International Students

## Problem

International students who send money to family or friends back home or abroad may
need to keep track of how much they have sent, when they sent it, and how much
the recipient is expected to receive after currency conversion. Keeping these
details across transfer confirmations or personal notes makes it difficult to
review remittance history and plan a monthly budget.

The Remittance Tracker provides one place to record and review transfers. It
calculates an estimated received amount using an exchange rate; it is for
personal tracking only and does not send money or guarantee the rate applied by
a transfer provider.

## Intended Users

- **Primary users:** International students in Canada who send money to
  recipients in another country, such as family in India.
- **User goals:** Record the recipient, amount sent, exchange rate, date sent, expected date that the money will be reeived and
  purpose; review past remittances and estimated received amounts; and manage a
  monthly remittance budget.
- **Out of scope:** Recipients do not need accounts, and the application does
  not initiate or process money transfers.

## Draft Data Model

The following entities support the planned remittance and budget features. Each
remittance and budget belongs to one user.

| Entity | Fields | Relationships and notes |
|---|---|---|
| **User** | `id` (primary key), `name`, `email`, `passwordHash`, `createdAt` | Has many remittances and budgets. Email is unique. |
| **Remittance** | `id` (primary key), `userId` (foreign key), `recipient`, `amountSent`, `sourceCurrency`, `destinationCurrency`, `exchangeRate`, `amountReceivedEstimate`, `date`, `purpose`, `createdAt`, `updatedAt` | Belongs to one user. The estimate is calculated from the sent amount and exchange rate; the currencies and rate are stored to preserve the recorded transaction details. |
| **Budget** | `id` (primary key), `userId` (foreign key), `amount`, `currency`, `month`, `year`, `createdAt`, `updatedAt` | Belongs to one user. A user's budget is identified by its month and year. |

## External API
- **Name:** Frankfurter Currency Exchange API
- **Docs:** https://frankfurter.app/docs
- **Key Required:** No. It is completely free and open source.
- **Rate Limits/Terms:** Free to use for non-commercial purposes. We will call it through our Express server, not directly from the frontend.
- **Feature Used:** Getting the current exchange rate to show the approximate converted amount when a user records a remittance.
- **Real Request Example:** 
  `https://api.frankfurter.app/latest?from=CAD&to=INR`
- **Trimmed Response Example:**
  ```json
  {
    "amount": 1.0,
    "base": "CAD",
    "date": "2026-10-07",
    "rates": {
      "INR": 63.54
    }
  }
  ```


  ## Endpoint List
| Method | Path | What it does | Success Code | Error Codes |
|---|---|---|---|---|
| GET | `/api/remittances` | Lists all remittances for the logged-in user | 200 | 401, 500 |
| GET | `/api/remittances/:id` | Gets details of a single remittance | 200 | 404, 401 |
| POST | `/api/remittances` | Creates a new remittance transaction | 201 | 400, 401 |
| PATCH | `/api/remittances/:id` | Updates an existing remittance | 200 | 400, 404, 401 |
| DELETE | `/api/remittances/:id` | Deletes a remittance | 204 | 404, 401 |
| GET | `/api/budgets` | Lists all budgets for the logged-in user | 200 | 401, 500 |
| GET | `/api/budgets/:id` | Gets details of a single budget | 200 | 404, 401 |
| POST | `/api/budgets` | Creates a new monthly budget | 201 | 400, 401 |
| PATCH | `/api/budgets/:id` | Updates an existing budget | 200 | 400, 404, 401 |
| DELETE | `/api/budgets/:id` | Deletes a budget | 204 | 404, 401 |
| GET | `/api/exchange-rates?from=CAD&to=INR` | Fetches live conversion rate from Frankfurter API | 200 | 400, 502 |


## Wireframes

Photos of paper sketches of the main screens.

#List
![List screen sketch](List.jpeg)

## Create
![Create screen sketch](create.jpeg)

##Detail
![Detail screen sketch](detail.jpeg)

##Edit
![Edit screen sketch](edit.jpeg)

#Team Roles

API | Amrit 

Frontend, Repo and pull requests | Bhupinder

Database | Sitakant 

