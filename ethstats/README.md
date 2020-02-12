# ETH Blockchain Explorer

The Lite Explorer is a client-side only web application that connects directly to a Ethereum JSON RPC compatible node. This means you can have your own private Ethereum Explorer should you wish so. No need for servers, hosting or trusting any third parties to display chain data.

found here: https://github.com/Alethio/ethereum-lite-explorer

## How to run

The explorer is automatically started with the start-script `docker-up.sh` and also removed inside `doker-down.sh` (both scripts found in the root of the project)

```bash
chmod +x ./docker-start.sh
./docker-start.sh
```

This will start the explorer on port 6001, as defined inside `system.json`:

```json
{
  {
    ...
    "ethstats": {
      "port": 6001
    }
  }
}

```
