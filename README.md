# p2p-prolog

```node index.mjs --experimental-modules```

## Docker

```

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

```

### First time?
```
git clone https://github.com/jacobfriedman/p2p-prolog && cd p2p-prolog

sudo apt update
sudo apt install -y python3-pip libffi-dev
sudo pip3 install docker-compose

```


```
docker-compose build && docker-compose up -d
```

### Need to Rebuild? use 

```
docker-compose build
```
or
```
docker-compose up --build
```

### Need to delete the docker builds?

Use 
```
docker system prune -a
```

### Todo

- [ ] Private Github URLs for build (...change star-signal build)
- [ ] Multiple Contexts/Deployments <https://www.docker.com/blog/multi-arch-build-and-images-the-simple-way/>
- [ ] Private Keysets for Deployments

## Browser

- [ ] Hook up LibP2P
- [X] Grab from the swipl-wasm example index

future: use Krustlet to handle WASMs with Kubernetes?

## Node

Following <https://github.com/ipfs/js-ipfs/issues/2779>...

- [ ] Hook up LibP2P
- [ ] Establish LibP2P AF_UNIX [IPC] methods with <https://nodejs.org/api/net.html#net_ipc_support>

## Prolog
- [ ] Instantiate Unix Domain Sockets
- [ ] Emulate required UDP Api Methodologies towards Paxos

### Unix domain sockets

_"Unix domain sockets (sockets with address family AF_UNIX) are represented as a (socket) file in the file system. They can only be used to connect processes on the same host. The main advantage of AF_UNIX sockets is that name conflicts are much easier to manage than port conflicts and that access is determined by the file system permission rules."_

<https://www.swi-prolog.org/pldoc/man?section=socket#sec:6.5>

*unix_domain_socket(-Socket)*

_"Creates an AF_UNIX-domain stream-socket and unifies an identifier to it with Socket. This predicate does not exist if the OS does not support the AF_UNIX address family (e.g. MS-Windows)."_

_"Unix domain socket affect tcp_connect/2 (for clients) and tcp_bind/2 and tcp_accept/3 (for servers). The address is an atom or string that is handled as a file name. On most systems the length of this file name is limited to 128 bytes (including null terminator), but according to the Linux documentation (unix(7)), portable applications must keep the address below 92 bytes. Note that these lengths are in bytes. Non-ascii characters may be represented as multiple bytes. If the length limit is exceeded a representation_error(af_unix_name) exception is raised."_

```
use_module(library(socket)).
```
