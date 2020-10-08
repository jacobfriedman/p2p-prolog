# p2p-prolog

This repo will eventually offload most of the libp2p functions required into prolog.

```node index.mjs --experimental-modules```


## Todo:

- [X] BROWSER  Build swipl-wasm:  
- [ ] NODEJS   Build swipl-wasm: 
- [X] BROWSER  Docker-ify swipl-wasm: 
- [ ] NODEJS   Docker-ify swipl-wasm: 
- [ ] BROWSER  Load LibP2P: 
- [ ] NODEJS   Load LibP2P:

## Browser

- [ ] Install libP2P
- [ ] Include Paxos bindings to libP2P
- [X] Grab from the swipl-wasm example index
- [ ] Pipe <body> to stdin on mutation
- [ ] Check for RPC possibilities with local PL-browser server
- [ ] Enable dlopen dynamic file linking <https://github.com/emscripten-core/emscripten/wiki/Linking>
- [ ] ~~Actually output ES6 Modules, rather than Node Modules~~

future: use Krustlet to handle WASMs with Kubernetes?


## Node

- [ ] Install libP2P
- [ ] Include Paxos bindings to libP2P