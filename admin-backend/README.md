# Bund: Admin Backend

## Prerequisites

For the server to run in a realisitc setup (i.e. using HTTPS and TLS) a certificate is required. Generate the certificate using:

```
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

Place the certificate and key in the folder: `./certs` and add the passphrase to the `.env` file.
