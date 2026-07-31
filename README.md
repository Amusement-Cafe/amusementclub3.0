# Amusement Club 3.0

## About Us

---


## Contributing

---

### Requirements
```
NodeJS v24.13.0+
PNPM v10.28.0+
MongoDB Server
Minio or other S3 storage
TBD
```

- Clone this repo
- Change config-example.yml to config.yml
- Open config.yml and fill out the following required fields
  - amusement/token & adminGuildID
  - ayano all fields
  - Database, an active and functional MongoDB instance
  - Links, add your base URLs here
  - Minio, all as needed for S3 storage
  - Webhooks, change auth and ports as needed
- Run `pnpm i`
- Run `pnpm start`
