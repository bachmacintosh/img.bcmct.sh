addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  if (request.method !== "POST") {
    const body = {
      error: "Bad Request",
      message: "This API only accepts a request using the POST method.",
    };
    return new Response(JSON.stringify(body, null, 2), {
      headers: { "content-type": "application/json;charset=UTF-8" },
      status: 400,
    });
  } else {
    const { headers } = request;
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await request.json();
      if (typeof json.id === "undefined") {
        const body = {
          error: "Bad Request",
          message: "The id property was missing from the request body.",
        };
        return new Response(JSON.stringify(body, null, 2), {
          headers: { "content-type": "application/json;charset=UTF-8" },
          status: 400,
        });
      } else {
        const cachedImage = await IMAGE_KV.get(json.id);
        if (cachedImage === null) {
          const url =
            "https://api.cloudinary.com/v1_1/bachman-io/resources/image/upload/" +
            json.id;
          const headers = new Headers({
            Authorization:
              "Basic " + btoa(CLOUDINARY_API_KEY + ":" + CLOUDINARY_API_SECRET),
          });
          const init = {
            headers,
          };
          const response = await fetch(url, init);
          const data = await response.json();
          if (
            typeof data.error !== "undefined" &&
            data.error.message.includes("Resource not found")
          ) {
            const body = {
              error: true,
              message: data.error.message,
            };
            return new Response(JSON.stringify(body, null, 2), {
              headers: { "content-type": "application/json;charset=UTF-8" },
              status: 404,
            });
          } else {
            await IMAGE_KV.put(json.id, JSON.stringify(data), {
              expirationTtl: 86400,
            });
            const body = {
              error: false,
              message: "Image fetched from Cloudinary and cached to KV.",
              data,
            };
            return new Response(JSON.stringify(body, null, 2), {
              headers: { "content-type": "application/json;charset=UTF-8" },
              status: 200,
            });
          }
        } else {
          const data = JSON.parse(cachedImage);
          const body = {
            error: false,
            message: "Image fetched from KV.",
            data,
          };
          return new Response(JSON.stringify(body, null, 2), {
            headers: { "content-type": "application/json;charset=UTF-8" },
            status: 200,
          });
        }
      }
    } else {
      const data = {
        error: "Bad Request",
        message: "The request body must be JSON..",
      };
      return new Response(JSON.stringify(data, null, 2), {
        headers: { "content-type": "application/json;charset=UTF-8" },
        status: 400,
      });
    }
  }
}
