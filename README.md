# p2p-prolog

This repo will eventually offload most of the libp2p functions required into prolog.

First, a barebone/prototype will be used to demonstrate a prolog core in a libp2p environment...

## 1. Install emscripten.

<https://emscripten.org/docs/getting_started/downloads.html>

```
sudo apt-get install python3
sudo apt-get install cmake

cd $HOME
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
git pull
/emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

## 2. Build the latest swipl-devel branch.
<https://github.com/SWI-Prolog/swipl-devel/blob/master/CMAKE.md>

(assume linux/x86)
```
wget https://cmake.org/files/v3.12/cmake-3.12.0-Linux-x86_64.sh
sudo sh cmake-3.12.0-Linux-x86_64.sh --prefix=/usr/local --exclude-subdir
apt-get install ninja-build
git clone https://github.com/SWI-Prolog/swipl-devel.git
cd swipl-devel
git submodule update --init
mkdir build && cd build
cmake -G Ninja ..
ninja
ninja install
```


## 2. Read

<https://github.com/SWI-Prolog/swipl-devel/blob/master/CMAKE.md#wasm-emscripten>

Note: I had to build zlib as sudo to do this... otherwise it said "Compiler error reporting is too harsh". That means all is made in root (watch out)

```
wget https://zlib.net/zlib-1.2.11.tar.gz -O "$HOME/zlib-1.2.11.tar.gz"
tar -xf "$HOME/zlib-1.2.11.tar.gz" -C "$HOME"
cd "$HOME/zlib-1.2.11"
emconfigure ./configure
emmake make

mkdir build.wasm
cd build.wasm
source ~/emsdk/emsdk_env.sh
cmake -DCMAKE_TOOLCHAIN_FILE=$HOME/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake \
      -DCMAKE_BUILD_TYPE=Release \
      -DZLIB_LIBRARY=$HOME/zlib-1.2.11/libz.a \
      -DZLIB_INCLUDE_DIR=$HOME/zlib-1.2.11 \
      -DMULTI_THREADED=OFF \
      -DUSE_SIGNALS=OFF \
      -DUSE_GMP=OFF \
      -DBUILD_SWIPL_LD=OFF \
      -DSWIPL_PACKAGES=OFF \
      -DINSTALL_DOCUMENTATION=OFF \
      -DSWIPL_NATIVE_FRIEND=build \
      -G Ninja ..

ninja
```

... build failed (see issues.)

