const cache = new Map();
const CACHE_TTL_MS = 60000;

export async function getExchangeRate(req, res, next) {
  const { from, to, amount } = req.query;

  if (!from || !to) {
    return next({
      status: 400,
      message: "Missing query parameters",
      details: { from: "required", to: "required" }
    });
  }

  const cacheKey = `${from.toUpperCase()}-${to.toUpperCase()}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() < cached.expiry) {
    console.log(`Cache hit for exchange rate: ${cacheKey}`);
    return res.status(200).json(cached.data);
  }

  try {
    const url = `https://api.frankfurter.app/latest?from=${from}&to=${to}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw { status: 502, message: "External currency API failed" };
    }

    const rawData = await response.json();
    const rate = rawData.rates[to.toUpperCase()];
    const converted = amount ? (parseFloat(amount) * rate).toFixed(2) : null;

    const customData = {
      data: {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate,
        amount: amount ? parseFloat(amount) : null,
        convertedAmount: converted ? parseFloat(converted) : null,
        date: rawData.date
      }
    };

    cache.set(cacheKey, { data: customData, expiry: Date.now() + CACHE_TTL_MS });
    res.status(200).json(customData);

  } catch (error) {
    if (error.name === 'TimeoutError') {
      return next({ status: 504, message: "External currency API timed out" });
    }
    next({ status: error.status || 502, message: error.message || "External API error" });
  }
}