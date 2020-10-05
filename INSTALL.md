From ABSOLUTE 0:

Debian; Raspberry PI (Raspbian 8.3.0-6+rpi1) / Linux (Ubuntu 20)

__Docker__
```
curl -sSL https://get.docker.com | sh

sudo usermod -aG docker $USER
newgrp docker 
sudo systemctl enable docker
```

AS ROOT.

Docker, cmake, etc..
Note: we don't want Java ... X default-jdk junit4 (it's 1GIG we just don't care for)

```

############################
# 1. Install Dependencies  #
############################

sudo apt update
sudo apt upgrade

sudo apt-get install -y \
	build-essential cmake pkg-config \
	ncurses-dev libreadline-dev libedit-dev \
	libgoogle-perftools-dev \
	libunwind-dev \
	libgmp-dev \
	libssl-dev \
	unixodbc-dev \
	zlib1g-dev libarchive-dev \
	libossp-uuid-dev \
	libxext-dev libice-dev libjpeg-dev libxinerama-dev libxft-dev \
	libxpm-dev libxt-dev \
	libdb-dev \
	libpcre3-dev \
	libyaml-dev \
	python3




############################
# 3.     Build SWIPL       #
############################

cd $HOME
git clone https://github.com/SWI-Prolog/swipl-devel.git
cd swipl-devel
git submodule update --init
mkdir build
cd build
cmake -DSWIPL_PACKAGES_JAVA=OFF ..
make
make install

############################
# 3.   Build SWIPL WASM    #
############################

cd $HOME/swipl-devel
mkdir build.wasm
cd build.wasm

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
      -G "Unix Makefiles" ..

emmake make

```