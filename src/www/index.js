import 'babel-polyfill'
import Libp2p from 'libp2p'
import Websockets from 'libp2p-websockets'
import WebRTCStar from 'libp2p-webrtc-star'
import { NOISE } from 'libp2p-noise'
import SECIO from 'libp2p-secio'
import GossipSub from 'libp2p-gossipsub'
import Mplex from 'libp2p-mplex'
import Bootstrap from 'libp2p-bootstrap'
import PeerId from 'peer-id'

import identity from '.identity.json'
import peers  from '.peers.json'

document.addEventListener('DOMContentLoaded', async (d) => {

  // Create our libp2p node
  const libp2p = await Libp2p.create({
    addresses: {
      // Add the signaling server address, along with our PeerId to our multiaddrs list
      // libp2p will automatically attempt to dial to the signaling server so that it can
      // receive inbound connections from other peers
      listen: [
        peers.signallers[0]
      ]
    },
    modules: {
      transport: [Websockets, WebRTCStar],
      connEncryption: [NOISE, SECIO],
      pubsub: GossipSub,
      streamMuxer: [Mplex],
      peerDiscovery: [Bootstrap]
    },
    config: {
      peerDiscovery: {
        // The `tag` property will be searched when creating the instance of your Peer Discovery service.
        // The associated object, will be passed to the service when it is instantiated.
        [Bootstrap.tag]: {
          enabled: peers.peers.length ? true : false,
          list: [
            // We need to convert this ID into a multiaddr.
            ...peers.peers
          ]
        }
      }
    },
      EXPERIMENTAL: {
    pubsub: true
    }
  })

  // UI elements
  const status = document.getElementById('libp2pstatus')
  const output = document.getElementById('libp2poutput')

  output.textContent = ''

  function log (target, txt) {
    console.info(txt)
    target.textContent += `${txt.trim()}\n`
  }

  // Listen for new peers
  libp2p.on('peer:discovery', (peerId) => {
    log(status, `Found peer ${peerId.toB58String()}`)
  })

  // Listen for new connections to peers
  libp2p.connectionManager.on('peer:connect', (connection) => {
    log(status, `Connected to ${connection.remotePeer.toB58String()}`)
  })

  // Listen for peers disconnecting
  libp2p.connectionManager.on('peer:disconnect', (connection) => {
    log(status, `Disconnected from ${connection.remotePeer.toB58String()}`)
  })

  await libp2p.start()

   libp2p.connectionManager.on('peer:connect', (connection) => {
      console.log('\n \n Connection established to:', connection.remotePeer.toB58String())  // Emitted when a peer has been found
   
    })

    libp2p.peerStore.on('peer', async (peerId) => {
      console.log(`\n 🔭 Discovered:\t\t${peerId.toB58String()}`)

     // let done = await libp2p.dial(peerId);

    })

    const topic = 'paxos'
    const handler = (msg) => {
      console.log(new TextDecoder().decode(msg.data))
      log(output, new TextDecoder().decode(msg.data))
    }

    libp2p.pubsub.on(topic, handler)
    libp2p.pubsub.subscribe(topic)

    const data = new TextEncoder().encode(`Hello from the Browser`)

    /*setInterval( async () => {
     libp2p.pubsub.publish('paxos', data)

  // console.log(libp2p.connections,'CONENCTIONS')

    }, 5000

     );
     */


    console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')
    console.log(' 👥 Libp2p: \t\tInitializing...')

  // start libp2p
    

    libp2p.multiaddrs.forEach(addr => {
      console.log(`\n 🌐 Your Address: \t${addr.toString()}/p2p/${libp2p.peerId.toB58String()}`)
    })


  // Export libp2p to the window so you can play with the API
  window.libp2p = libp2p
})
