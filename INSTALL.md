## How to Build

Debian; Raspberry PI (Raspbian 8.3.0-6+rpi1) / Linux (Ubuntu 20)

__Docker__
```
curl -sSL https://get.docker.com | sh

sudo usermod -aG docker $USER
newgrp docker 
sudo systemctl enable docker
```

See the dockerfile at <https://github.com/jacobfriedman/swipl-wasm/tree/master/docker>.
Note: we don't want Java ... X default-jdk junit4 (it's 1GIG we just don't care for)




