const process = require('process')


//////////////// 		LIBP2P
const Libp2p 				= require('libp2p')

//////////////// 		LIBP2P Libraries
const TCP 					= require('libp2p-tcp')
const NOISE 				= require('libp2p-noise')
const MPLEX 				= require('libp2p-mplex')
const Bootstrap 		= require('libp2p-bootstrap')
const WebRTCStar		= require('libp2p-webrtc-star')

//////////////// 		LIBP2P Helpers
const wrtc 					= require('wrtc')
const multiaddr 		= require('multiaddr')


//console.log(ws1)

//////////////// INITIALIZE  ////////////////////////


const transportKey = WebRTCStar.prototype[Symbol.toStringTag]

/*,

BOOTSTRAP Peers w/ libp2p

				config: {
								peerDiscovery: {
								  autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minConnections)
									  // The `tag` property will be searched when creating the instance of your Peer Discovery service.
									  // The associated object, will be passed to the service when it is instantiated.
									  [Bootstrap.tag]: {
										enabled: true,
										list: bootstrapPeers // provide array of multiaddrs
									  }
								}
							  }*/


const main = async () => {

		const node = await Libp2p.create({
				addresses:      {
						// add a listen address (localhost) to accept TCP connections on a random port
						listen: ['/ip4/0.0.0.0/tcp/9999']
				},
				modules:        {
						transport: [WebRTCStar],
						connEncryption: [NOISE],
						streamMuxer: [MPLEX]
				},
				config: {
			    transport: {
			      [transportKey]: {
			        wrtc // You can use `wrtc` when running in Node.js
			      }
			    }
			  }	
		})

		// print out listening addresses
		const advertiseAddrs = node.multiaddrs
		console.log('libp2p is advertising the following addresses: ', advertiseAddrs)
		const listenAddrs = node.transportManager.getAddrs()
		console.log('libp2p is listening on the following addresses: ', listenAddrs)

		node.connectionManager.on('peer:connect', (connection) => {
				  console.log('Connection established to:', connection.remotePeer.toB58String())	// Emitted when a new connection has been created
				})

				node.on('peer:discovery', (peerId) => {
				  // No need to dial, autoDial is on
				  console.log('Discovered:', peerId.toB58String())
				})

		// start libp2p
		await node.start()
		console.log('libp2p has started')


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
