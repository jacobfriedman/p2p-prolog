# p2p-prolog

future: use Krustlet to handle WASMs with Kubernetes?

From ABSOLUTE 0:


This repo will eventually offload most of the libp2p functions required into prolog.

First, a barebone/prototype will be used to demonstrate a prolog core in a libp2p environment...

Note: We assume TCMalloc is not in use for the WASM yet.

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
```

wget https://zlib.net/zlib-1.2.11.tar.gz -O "./zlib-1.2.11.tar.gz"
tar -xf "./zlib-1.2.11.tar.gz" -C "."
cd "./zlib-1.2.11"
emconfigure ./configure
emmake make


## 2. Read


SHOULD WE USE THIS: To install in a particular location, use -DCMAKE_INSTALL_PREFIX. For example, this will build SWI to be installed in /usr/local/swipl-git:

```
cmake -DCMAKE_INSTALL_PREFIX=/usr/local/swipl-git -G Ninja ..
```

```
wget https://zlib.net/zlib-1.2.11.tar.gz -O "$HOME/zlib-1.2.11.tar.gz"
tar -xf "$HOME/zlib-1.2.11.tar.gz" -C "$HOME"
cd "$HOME/zlib-1.2.11"
emconfigure ./configure
emmake make

mkdir build
cd build
source ~/emsdk/emsdk_env.sh
cmake -DCMAKE_TOOLCHAIN_FILE=$HOME/projects/wasm-prolog/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake \
      -DCMAKE_BUILD_TYPE=Release \
		  -DZLIB_LIBRARY=$HOME/projects/wasm-prolog/zlib-1.2.11/libz.a \
		  -DZLIB_INCLUDE_DIR=$HOME/projects/wasm-prolog/zlib-1.2.11 \
      -DMULTI_THREADED=OFF \
      -DUSE_SIGNALS=OFF \
      -DUSE_GMP=OFF \
      -DBUILD_SWIPL_LD=OFF \
      -DSWIPL_PACKAGES=OFF \
      -DINSTALL_DOCUMENTATION=OFF \
      -DSWIPL_NATIVE_FRIEND=build \
      ..

emmake
```

... build failed (see issues.)




WASM_HOME=$HOME/wasm
source $WASM_HOME/emsdk/emsdk_env.sh
TOOLCHAIN=$EMSDK/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake
[ -f $TOOLCHAIN ] || echo "Could not find emscripten toolchain"

cmake -DCMAKE_TOOLCHAIN_FILE=$TOOLCHAIN \
          -DCMAKE_BUILD_TYPE=Release \

	  -DMULTI_THREADED=OFF \
	  -DUSE_SIGNALS=OFF \
	  -DUSE_GMP=OFF \
	  -DBUILD_SWIPL_LD=OFF \
	  -DSWIPL_PACKAGES=OFF \
	  -DINSTALL_DOCUMENTATION=OFF \
	  -DSWIPL_NATIVE_FRIEND=linux \
	  -G Ninja ..






"ranlib generates an index to the contents of an archive and stores it in the archive. " ohhh.kkkkk....
[21:05] jacobpdq:
The following tools are required to compile and install the source package:
   gcc, as, ranlib (if needed), sh, mkdir, cp, rm, sed, test,...
[21:05] jacobpdq: sweet. nothing- just a few commands(edited)
[21:27] jacobpdq: working so far...
/wasm-prolog/gprolog/src$ emconfigure ./configure
(edited)
[21:29] jacobpdq: jacob@jacob:~/projects/wasm-prolog/gprolog/src$ emmake make
latest gprolog
https://sourceforge.net/code-snapshots/git/g/gp/gprolog/code.git/gprolog-code-457f7b447c2b9e90a09956ff15fd277d269b1d98.zip