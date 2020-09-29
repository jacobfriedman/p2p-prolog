# p2p-prolog

This repo will eventually offload most of the libp2p functions required into prolog.

First, a barebone/prototype will be used to demonstrate a prolog core in a libp2p environment...

## 1. Install emscripten.

<https://emscripten.org/docs/getting_started/downloads.html>

```
sudo apt-get install python3
sudo apt-get install cmake
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
git pull
/emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## 2. Follow Jan Wielemaker's Swipl-devel -> WASM tutorial: 
<https://github.com/SWI-Prolog/swipl-wasm>


```
wget https://zlib.net/zlib-1.2.11.tar.gz -O "$HOME/zlib-1.2.11.tar.gz"
tar -xf "$HOME/zlib-1.2.11.tar.gz" -C "$HOME"
cd "$HOME/zlib-1.2.11"
emconfigure ./configure
emmake make
```

### DRAGON: My first attempt resulted in
```
configure: ./configure
Compiler error reporting is too harsh for ./configure (perhaps remove -Werror).
** ./configure aborting.
```

