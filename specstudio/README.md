# SpecStudio

**Paste an OpenAPI spec → instantly get client SDKs, quickstart code, and API insight.**

SpecStudio is a small web app built on top of [openapi-generator](https://github.com/OpenAPITools/openapi-generator). Drop in any OpenAPI 3.x document (JSON or YAML) and you get:

- **API insight** — title, version, auth scheme, servers, and a browsable list of every endpoint with method badges.
- **Quickstart snippets** — click any endpoint to get ready-to-run `curl`, JavaScript (`fetch`), and Python (`requests`) examples, with auth headers pre-wired when the spec declares a security scheme.
- **One-click SDKs** — download a generated client library as a zip in 12 languages (TypeScript, Python, Go, Java, Kotlin, C#, Ruby, PHP, Rust, Swift, and more).
- **Validation** — runs the spec through openapi-generator's validator.

## Requirements

- Node.js 18+
- Java 11+ (used to run the generator)

## Quick start

```bash
./setup.sh        # installs npm deps and downloads the generator jar (~30 MB)
node server.js    # serves http://localhost:3000
```

Open http://localhost:3000, hit **Load sample spec**, and click around.

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/analyze` | POST | `{ spec }` → summary of title, endpoints, auth, models |
| `/api/validate` | POST | `{ spec }` → validation result from openapi-generator |
| `/api/generate` | POST | `{ spec, generator }` → zip download of the generated SDK |
| `/api/generators` | GET | List of available generator targets |

## Notes

- Specs are written to a temp directory per request and cleaned up afterwards; nothing is persisted.
- Generation timeout is 2 minutes per request; the first generation after startup is slowest (JVM warm-up).
- To pin a different generator version: `OPENAPI_GENERATOR_VERSION=7.x.y ./setup.sh`
