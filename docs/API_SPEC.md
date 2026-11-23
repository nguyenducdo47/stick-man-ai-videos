# API spec

Base URL: `http://127.0.0.1:3001`

## Phase 0

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | API liveness (Zod-validated) |
| GET | `/v1/system/info` | Build phase metadata |
| GET | `/v1/ollama/status` | Ollama reachability and models |

Project CRUD and storyboard routes are defined in Phase 1+.