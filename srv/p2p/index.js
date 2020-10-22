const process = require('process')


//////////////// 		LIBP2P
const Libp2p 				= require('libp2p')

//////////////// 		LIBP2P Libraries
const TCP 					= require('libp2p-tcp')
const NOISE 				= require('libp2p-noise')
const MPLEX 				= require('libp2p-mplex')
const Bootstrap 		= require('libp2p-bootstrap')
const WebRTCStar 		= require('libp2p-webrtc-star')
const WebSockets 		= require('libp2p-websockets')
const MulticastDNS	= require('libp2p-mdns')

//////////////// 		LIBP2P Helpers
const wrtc 					= require('wrtc')
const multiaddr 		= require('multiaddr')


//////////////// INITIALIZE  ////////////////////////


const peers = process.argv;


const main = async () => {

		const node = await Libp2p.create({
				addresses:      {
						// add a listen address (localhost) to accept TCP connections on a random port
						listen: [
							'/ip4/0.0.0.0/tcp/0'
						],

				},
				modules:        {
						transport: [WebSockets, TCP],
						connEncryption: [NOISE],
						streamMuxer: [MPLEX],
						peerDiscovery: [MulticastDNS]
				},
				config: {
				  peerDiscovery: {
			        bootstrap: {
			          interval: 60e3,
			          enabled: true,
			          list: peers
			        },
	            mdns: {
				        interval: 20e3,
				        enabled: true
				      }
					}
				}
		})

		node.connectionManager.on('peer:connect', (connection) => {
	    console.log('Connection established to:', connection.remotePeer.toB58String())	// Emitted when a peer has been found
	  })

	  node.on('peer:discovery', (peerId) => {
	    console.log('Discovered:', peerId.toB58String())
	  })

		// start libp2p
		let output = await node.start()
		console.log('🌈 libp2p has started: 🌈')

	  node.multiaddrs.forEach(addr => {
	    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`)
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
