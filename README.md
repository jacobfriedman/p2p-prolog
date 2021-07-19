# P2P Prolog

## Run the compose files

If this is your first time running, please see 'Initialization' below.

**Signaller**: 

```
export DOMAIN=<yourdomain.here> && docker-compose -f docker-compose-signaller up 
```

*Clients (Browser & NodeJS)*: 
```
export DOMAIN=<yourdomain.here> && docker-compose -f docker-compose-client up 
```

_Note: Append `-d` to start docker-compose daemons._

### Initialization

1. *Distribute Identities*

Docker needs to build-out a single identity and distribute it across the HTML client & NodeJS client through `peer-id`. We also want to distribute the `.peers.json` file in the same way. Put your signaller and peers' multiaddrs (peers are not necessary for a new network) in `.peers.json` (you'll have to `touch .peers.json` first):

```
{
	"peers": [
		"/dns4/your.signaller.domain/tcp/9999/wss/p2p-webrtc-star/p2p/QmYJollioPDRGYM6doTJEDguuUniFSYLBqyLJxwBtQzkkR"
	],
	"signallers": [
		"/dns4/your.signaller.domain/tcp/9999/wss/p2p-webrtc-star/"
	]
}
```

2. *Run the Bootstrapper*

This will generate `.identity.json` and distribute `.identity.json`+`.peers.json` to the NodeJS p2p node. It will also inject `.identity.json`+`.peers.json` into the `src/www` (html source), run the parcel HTML builder, then copy the output over to `srv/www`.

Run 
```
sh bootstrap.sh
```

## Docker Tools

## Install Docker & Docker-Compose

You'll need docker-compose to run the service (version 3.3). 
```
# From <https://gist.github.com/EvgenyOrekhov/1ed8a4466efd0a59d73a11d753c0167b>
sh install-docker.sh
```

### Container Management
In order to remove containers, run `docker rm $(docker ps -a -q)`.

If you're devving, you may need to clean the ridiculously large 
docker cache once in a while with `docker system prune -a`.

***



### Todo

- [ ] Private Github URLs for build (...change star-signal build)
- [ ] Multiple Contexts/Deployments <https://www.docker.com/blog/multi-arch-build-and-images-the-simple-way/>
- [X] Private Keysets for Deployments

## Browser

- [X] Hook up LibP2P

## Node

- [X] Hook up LibP2P
- [x] LibP2P AF_UNIX [IPC] methods with <https://nodejs.org/api/net.html#net_ipc_support>
- 

## Prolog
- [x] Deconstruct events to CBOR
- [x] Interface on Socket I/O Via Docker

