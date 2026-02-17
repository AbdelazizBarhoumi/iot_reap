 # Infrastructure Layer — Reference

 Infrastructure rules and minimal setup notes.

 Docker & local environment
 - `docker-compose.yml` should provide PHP-FPM, Nginx, MySQL, Redis (matching `.env.example`).
 - Keep service names and ports configurable via `.env`.

 Proxmox & Guacamole
 - Use `config/proxmox.php` and `config/guacamole.php` for all external API settings. Do not hardcode node names or credentials.
 - Use API tokens for Proxmox (PVEAPIToken) and never embed secrets in code.

 CI/CD
 - CI pipelines must be green before merging to `develop`.
 - Include linting, phpunit tests, and a frontend build in the pipeline.

 Secrets
 - Never commit `.env` files. Use `.env.example` with key placeholders only.
