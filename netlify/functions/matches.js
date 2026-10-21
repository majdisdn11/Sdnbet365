
exports.handler = async function () {
  const apiKey = process.env.SOCCERSAPI_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "API key is not configured"
      })
    };
  }

  try {
    const response = await fetch(
      "https://api.soccersapi.com/v2.2/livescores/?t=today&utc=1",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      }
    );

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=120"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 502,
      body: JSON.stringify({
        error: "Could not retrieve match data"
      })
    };
  }
};
