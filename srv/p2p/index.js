const process 				= require('process')
const fs 					= require('fs');

//////////////// 		LIBP2P
const Libp2p 				= require('libp2p')

//////////////// 		LIBP2P Libraries
const TCP 					= require('libp2p-tcp')
const NOISE 				= require('libp2p-noise')
const SECIO 				= require('libp2p-secio')
const MPLEX 				= require('libp2p-mplex')
const Bootstrap 			= require('libp2p-bootstrap')
const WebRTCStar 			= require('libp2p-webrtc-star')
const WebSockets 			= require('libp2p-websockets')
const GossipSub 			= require('libp2p-gossipsub')
const MulticastDNS		 	= require('libp2p-mdns')
const KadeliaDHT 			= require('libp2p-kad-dht')

//////////////// 		LIBP2P Helpers
const wrtc 					= require('wrtc')
const multiaddr 			= require('multiaddr')
const PeerId 				= require('peer-id')

//////////////// 		WebRTC Signalling Server
const Signaller 			= require('libp2p-webrtc-star/src/sig-server')
const transportKey 			= WebRTCStar.prototype[Symbol.toStringTag]


//////////////// INITIALIZE  ////////////////////////

const main = async () => {

	console.clear();
	console.info(`
 ___  __   ___    ___  ____ ____ _    ____ ____
 |--'  /_  |--'   |--' |--< [__] |___ [__] |__,  
		 `)

	console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')

	var processArguments = process.argv.slice(2);
	let peerId;

	if(processArguments[0] === '--unique') {
		peerId = await PeerId.create()
	} else {
		peerId = await PeerId.createFromJSON(JSON.parse(fs.readFileSync('.identity.json',{ encoding:'utf8'} )));
	}

   	const peers = 	 JSON.parse(fs.readFileSync('.peers.json',{ encoding:'utf8'} ));

   	let thisId = peerId.toB58String()
   	console.info(` 🔑 ID: \t ${peerId.toB58String()}`)

	const libp2p = await Libp2p.create({
			peerId,
			addresses:      {
					// add a listen address (localhost) to accept TCP connections on a random port
					listen: [
				       '/ip4/0.0.0.0/tcp/0',
				        '/ip4/0.0.0.0/tcp/0/ws',
						`${peers.signallers[0]}`
					],
			},
			modules:        {
					transport: [WebRTCStar],
					connEncryption: [NOISE, SECIO],
					streamMuxer: [MPLEX],
			      	pubsub: GossipSub,
					peerDiscovery: [ /*Bootstrap,*/ MulticastDNS],
					//dht: KadeliaDHT
			},
			/* EXPERIMENTAL: {
			    pubsub: true
			  },
			  */
			config: {
				autoDial: true,
			/*relay: {           // Circuit Relay options (this config is part of libp2p core configurations)
		        enabled: true,   // Allows you to dial and accept relayed connections. Does not make you a relay.
			        hop: {
			          enabled: true, // Allows you to be a relay for other peers
			          active: true   // You will attempt to dial destination peers if you are not connected to them
		        },
		        autoRelay: {
		        	enabled: true,
		        	maxListeners: 2
		        }

	        
		      }, */
	      //autoDial: true, // auto dial to peers we find when we have less peers than `connectionManager.minPeers`
			      peerDiscovery: {
			      	autoDial: true,
				      [WebRTCStar.tag]: {
				        enabled: true
				      },
				      
			        [Bootstrap.tag]: {
			          interval: 60e3,
			          enabled: peers.peers.length ? true : false,
			          list: [
			            ...peers.peers
			          ]
			        },
			        mdns: {
				        interval: 60e3,
				        enabled: true
				      },
			      },
			     transport: {
			        [transportKey]: {
			          wrtc
			        },
			      },
			      
			      pubsub: {
			        enabled: true,
			        emitSelf: false,
			      },
			      /*dht: {
			        enabled: true,
			        randomWalk: {
			          enabled: false
			        }
			      },*/
		  }
	})

	await libp2p.start()

	  libp2p.connectionManager.on('peer:connect', (connection) => {
	    console.log('\n \n Connection established to:', connection.remotePeer.toB58String())	// Emitted when a peer has been found
	 
		

	  })

	  libp2p.peerStore.on('peer', async (peerId) => {
	    console.log(`\n 🔭 Discovered:\t\t${peerId.toB58String()}`)

	   // let done = await libp2p.dial(peerId);

	  })

		const topic = 'paxos'
		const handler = (msg) => {
		  console.log(`topic: ${topic}`, new TextDecoder().decode(msg.data))
		}

		libp2p.pubsub.on(topic, handler)
		libp2p.pubsub.subscribe(topic)

		const data = new TextEncoder().encode(`Hello from NodeJS: <${thisId}>`)

		setInterval( async () => {
		 libp2p.pubsub.publish('paxos', data)

	// console.log(libp2p.connections,'CONENCTIONS')

		}, 5000

		 );

	  console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')
	  console.log(' 👥 Libp2p: \t\tInitializing...')

	// start libp2p
		

	  libp2p.multiaddrs.forEach(addr => {
	    console.log(`\n 🌐 Your Address: \t${addr.toString()}/p2p/${libp2p.peerId.toB58String()}`)
	  })



		

		const stop = async () => {
		// stop libp2p
				await libp2p.stop()
				process.exit(0)
		}

		process.on('SIGTERM', stop)
		process.on('SIGINT', stop)

}


main()
