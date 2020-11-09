const process 			= require('process')
const fs 						= require('fs');

//////////////// 		LIBP2P
const Libp2p 				= require('libp2p')

//////////////// 		LIBP2P Libraries
const TCP 					= require('libp2p-tcp')
const NOISE 				= require('libp2p-noise')
const MPLEX 				= require('libp2p-mplex')
const Bootstrap 		= require('libp2p-bootstrap')
const WebRTCStar 		= require('libp2p-webrtc-star')
const WebSockets 		= require('libp2p-websockets')
const GossipSub 		= require('libp2p-gossipsub')
const MulticastDNS	= require('libp2p-mdns')

//////////////// 		LIBP2P Helpers
const wrtc 					= require('wrtc')
const multiaddr 		= require('multiaddr')

//////////////// 		WebRTC Signalling Server
const Signaller 		= require('libp2p-webrtc-star/src/sig-server')

const transportKey = WebRTCStar.prototype[Symbol.toStringTag]

//////////////// INITIALIZE  ////////////////////////


const main = async () => {
		
		console.info(`\n`)

		////////// Create Identity File & Save Locally

		let identityFilePath = '.identity-client',
				identity 
		
		// TODO: Abstract into identity.js file

	  if (fs.existsSync(identityFilePath)) {
	   	identity = JSON.parse(fs.readFileSync('.identity-client',{ encoding:'utf8'} ));
	   	console.info(` 🔑 ID (preset): \t ${identity.id.id}`)
	  } else {
	  	identity = await PeerInfo.create()
			await fs.writeFileSync('.identity-client', JSON.stringify(identity, null, 2))
			console.info(` 🔑 ID (initial): \t ${identity.id.id}`)
	  }

		const node = await Libp2p.create({
				addresses:      {
						// add a listen address (localhost) to accept TCP connections on a random port
						listen: [
							'/ip4/0.0.0.0/tcp/9998/wss/p2p-webrtc-star',
					//		'/ip4/0.0.0.0/tcp/9999/wss/p2p-webrtc-star'
						],
				},

				modules:        {
						transport: [TCP, WebSockets,WebRTCStar],
						connEncryption: [NOISE],
						streamMuxer: [MPLEX],
			      pubsub: GossipSub,
						peerDiscovery: [ Bootstrap /*MulticastDNS*/],
				},
				config: {
					relay: {           // Circuit Relay options (this config is part of libp2p core configurations)
		        enabled: true,   // Allows you to dial and accept relayed connections. Does not make you a relay.
		        hop: {
		          enabled: true, // Allows you to be a relay for other peers
		          active: true   // You will attempt to dial destination peers if you are not connected to them
		        },
		        autoRelay: {
		        	enabled: true,
		        	maxListeners: 2
		        }
		      },
		      /*EXPERIMENTAL: {
		        pubsub: true
		      },
		      */
		      //autoDial: true, // auto dial to peers we find when we have less peers than `connectionManager.minPeers`
		      /*mdns: {
		        interval: 60e3,
		        enabled: true
		      },
		      */
		      peerDiscovery: {
			      [WebRTCStar.tag]: {
			        enabled: true
			      },
		        [Bootstrap.tag]: {
		          interval: 60e3,
		          enabled: true,
		          list: [
		            `/ip4/0.0.0.0/tcp/9998/wss/p2p-webrtc-star/p2p/${identity.id.id}`,
		          ]
		        },
		      },
		      transport: {
		        [transportKey]: {
		          wrtc
		        },
		      },
         /*transportManager: {
		        addresses: [
		          '/ip4/0.0.0.0/tcp/9999/ws/p2p-webrtc-star',
		          'ip4/0.0.0.0/tcp/9999/ws/',
		          '/ip4/0.0.0.0/tcp/9999/',
		        ]
		      },
		      */
		      
		      /*pubsub: {
		        enabled: true,
		        emitSelf: true,
		        signMessages: true,
		        strictSigning: true,
		      },
		      */
		      /*dht: {
		        enabled: false,
		        randomWalk: {
		          enabled: false
		        }
		      },
		      */
			  }
		})

		node.connectionManager.on('peer:connect', (connection) => {
	    console.log('\n \n Connection established to:', connection.remotePeer.toB58String())	// Emitted when a peer has been found
	  })

	  node.on('peer:discovery', (peerId) => {
	    console.log(`\n 🔭 Discovered:\t\t${peerId.toB58String()}`)
	  })

	  console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')

	  console.log(' 👥 Libp2p: \t\tInitializing...')

		// start libp2p
		let output = await node.start()

	  node.multiaddrs.forEach(addr => {
	    console.log(`\n 🌐 Your Address: \t${addr.toString()}/p2p/${node.peerId.toB58String()}`)
	  })

		const stop = async () => {
		// stop libp2p
				await node.stop()
				console.log('libp2p has stopped')
				process.exit(0)
		}

		process.on('SIGTERM', stop)
		process.on('SIGINT', stop)

}


main()
