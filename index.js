addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if (request.method !== "POST") {
    const data = {
      error: "Bad Request",
      message: "This API only accepts a request using the POST method.",
    };
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "content-type": "application/json;charset=UTF-8" },
      status: 400,
    });
  } else {
    const data = {
      error: false,
      message: "API Request Successful!",
    };
    return new Response(JSON.stringify(data, null, 2), {
      headers: { "content-type": "application/json;charset=UTF-8" },
      status: 200,
    });
  }
}
