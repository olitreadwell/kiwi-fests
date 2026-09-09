# Docker / container notes

Exact commands come from the repository's own config (`Dockerfile`,
`compose.yaml`/`docker-compose.yml`, Makefile targets). Match what is there.

- **Images**: respect the repo's base images and tags; never float `latest`
  in a production Dockerfile.
- **Builds**: use the repo's build command (or Compose service) rather than
  inventing a new one.
- **Layers and size**: keep the image lean per the repo's convention; do not
  ship build tooling or secrets into a runtime image.
- **Secrets**: build args and env vars are visible in history — no secrets in
  the Dockerfile, `.env` files, or Compose.
- **Health**: match the repo's healthcheck; the container should fail fast on
  bad config.
- **Reproducibility**: pin digests where the repo does; document why a pin
  changed when it does.

## Common traps for agents

- Mounting local state or credentials into a container and leaving it in
  Compose.
- Running the container as root when the repo's image uses a non-root user.
- Adding a second Compose file/format when the repo already has one.
- Copying a whole monorepo into the image when the build context should be
  smaller.
