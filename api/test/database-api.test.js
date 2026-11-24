import { after, before, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import Budget from '../src/models/budgetDocument.js';
import Remittance from '../src/models/remittance.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test('remittance endpoints use the database and preserve the response shape', async () => {
  const data = { recipient: 'Test', amount: 100, rate: 60, date: '2026-10-25', purpose: 'Family' };
  const document = new Remittance({ id: 'existing-id', ...data });
  const create = mock.method(Remittance, 'create', async () => document);
  const list = mock.method(Remittance, 'find', async () => [document]);
  const exists = mock.method(Remittance, 'exists', async () => ({ _id: document._id }));
  const update = mock.method(Remittance, 'findOneAndUpdate', async () => document);
  const remove = mock.method(Remittance, 'findOneAndDelete', async () => null);
  try {
    let response = await fetch(`${baseUrl}/api/remittances`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { id: 'existing-id', ...data });
    assert.deepEqual(create.mock.calls[0].arguments[0], data);

    response = await fetch(`${baseUrl}/api/remittances`);
    assert.deepEqual(await response.json(), [{ id: 'existing-id', ...data }]);
    assert.equal(list.mock.callCount(), 1);

    response = await fetch(`${baseUrl}/api/remittances/existing-id`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: 200 }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(update.mock.calls[0].arguments[0], { id: 'existing-id' });
    assert.deepEqual(update.mock.calls[0].arguments[1], { amount: 200 });

    response = await fetch(`${baseUrl}/api/remittances/missing`, { method: 'DELETE' });
    assert.equal(response.status, 404);
  } finally {
    create.mock.restore(); list.mock.restore(); exists.mock.restore(); update.mock.restore(); remove.mock.restore();
  }
});

test('budget writes use validated fields and database failures surface', async () => {
  const data = { userId: 'user-1', currency: 'CAD', monthlyLimit: 1000, month: 'November', year: 2026 };
  const document = new Budget({ id: 'budget-id', ...data });
  const create = mock.method(Budget, 'create', async () => document);
  const list = mock.method(Budget, 'find', async () => { throw new Error('Database unavailable'); });
  try {
    let response = await fetch(`${baseUrl}/api/budgets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id: 'untrusted-id' }),
    });
    assert.equal(response.status, 201);
    const body = await response.json();
    assert.equal(body.id, 'budget-id');
    assert.equal(body._id, undefined);
    assert.deepEqual(create.mock.calls[0].arguments[0], data);

    response = await fetch(`${baseUrl}/api/budgets`);
    assert.equal(response.status, 500);
    assert.equal((await response.json()).error.message, 'Database unavailable');
  } finally {
    create.mock.restore(); list.mock.restore();
  }
});
