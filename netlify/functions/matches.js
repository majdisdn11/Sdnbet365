
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

  async function getMatches(day) {
    const url = new URL(
      "https://api.soccersapi.com/v2.2/livescores/"
    );

    url.search = new URLSearchParams({
      t: day,
      utc: "1",
      page: "1"
    }).toString();

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        status: response.status,
        data
      };
    }

    return {
      error: false,
      data
    };
  }

  try {
    const today = await getMatches("today");

    if (today.error) {
      return {
        statusCode: today.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(today.data)
      };
    }

    let result = today.data;
    let requestedDay = "today";

    if (
      !Array.isArray(result.data) ||
      result.data.length === 0
    ) {
      const tomorrow = await getMatches("tomorrow");

      if (tomorrow.error) {
        return {
          statusCode: tomorrow.status,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tomorrow.data)
        };
      }

      if (
        Array.isArray(tomorrow.data.data) &&
        tomorrow.data.data.length > 0
      ) {
        result = tomorrow.data;
        requestedDay = "tomorrow";
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=120"
      },
      body: JSON.stringify({
        ...result,
        requested_day: requestedDay
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
