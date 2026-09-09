// Swagger UI assets are loaded from unpkg so the docs page has no bundler
// interop issues and no client-side bundle weight. Version is pinned to
// match the OpenAPI 3.1 support the spec relies on.
const SWAGGER_UI_VERSION = '5.32.14';

const DOCS_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API docs — Swagger UI</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@${SWAGGER_UI_VERSION}/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' });
      };
    </script>
  </body>
</html>`;

/**
 * Swagger UI for the OpenAPI document at /api/openapi.json.
 *
 * @returns The Swagger UI HTML page.
 */
export function GET(): Response {
  return new Response(DOCS_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
