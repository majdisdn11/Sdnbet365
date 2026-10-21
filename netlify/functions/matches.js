
exports.handler = async function () {
  const apiKey = process.env.SOCCERSAPI_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "API key is not configured"
      })
    };
  }

  try {
    const today = new Date().toISOString().slice(0, 10);

    const url = new URL(
      "https://api.soccersapi.com/v2.2/fixtures/"
    );

    url.search = new URLSearchParams({
      t: "schedule",
      d: today,
      utc: "1",
      page: "1"
    }).toString();

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=120"
      },
      body: JSON.stringify({
        ...data,
        requested_date: today
      })
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Could not retrieve match data"
      })
    };
  }
};
