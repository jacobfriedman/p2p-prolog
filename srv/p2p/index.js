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
const PeerInfo 			= require('peer-info')

//////////////// 		WebRTC Signalling Server
const Signaller 		= require('libp2p-webrtc-star/src/sig-server')


// peerInfo.multiaddrs.add(`${ssAddr}/p2p/${peerInfo.id.toB58String()}`)

let peerJSON = {
  "id": "QmWjz6xb8v9K4KnYEwP5Yk75k5mMBCehzWFLCvvQpYxF3d",
  "privKey": "CAASpwkwggSjAgEAAoIBAQDKNKwPX4DJhYdGreAVaJy+efhIfbyczR0Mfyi/JfzszY9INH83Veo2s/yOKv+YOP4y7OWpkXL5G6K8fLgxwq5gtTc78W07uz5ZUrxfOT0R4QJuiiQHjQSxYKw08yLIP9JaR2ztL46DOO/Nvzl9gCWHGsAb+w+RLWa0R0SRyvaDiw8aZW9G70yYTGF/SPkEoYN26sioVDwppmKxZ9mTuKsujG0AGAMVPnmjhDI5WmBD3gnOiqCECqlgxl29Qlc1fCIbojcUVE9eWFWassFLicGdo/iMacsVvoTav9JvHZsMvg1HXeK0khQWluCUfdcR6coijDMDWBa77dTI6+b2ybZXAgMBAAECggEALk4hmOOl+oA5mlX3Gu/59SS5VuB0cPQH0vTLv/pTEWeBiGd9Oo7SM/TDwUrXfWSP0dmuPkawrZtGiSOGit6qUDsviuqeuS8H+CyaNrRE5/M/O1EnLxN8H6KjzPxg2rrC0SnKKAbb+/Dt+Y/w+mx+K5JUrBOyXOyouGAZs8lm6nhlL4nelNh2hez0Rp9RFlCokk8aldHCJVUbUP3AwOtVqYJNttSofq4jvnXvUX8Kgb9WjGaZANoQNH+zn6rM2OvmDcxQvnxbKtAgBEu7O60kAdGtpw+JGvj1E5f+iuNlK+GYvYbpDhSt1bRfTMsHxRFxJ2V7vDSDqTLdxUfahI+WAQKBgQD6PUBSYOY151h3iBHqqJJ4sYQ/rUbs3/9QDZRKsxj/gC0vZFQHTVfLHiY2qUikjoMnTy+t1L/ot919ZM5XqOwjZ3oodtjRa3orWKUwGQElORxZQPCPz268GIU+DKSyE5ieBqGMdB3uOZ7oHKODc1a9HiDApux8C3Vwde0oMZcp3wKBgQDO3Feipt7dZ8AoZ1MJE/pRrhJBZDBhc9TpmQccRfG1JpgocA7GgRnzFQgM5yi6DrSIx3SCqPZm5K5VKqEW9PEsHbyNEPo8U0oOnhmVcBIrJe8Rf+wg5R3WvIwlh454ROchNl7iuJPgXTQzZjWtaKbeMm4fXTweRr0Mk9q5GaFyiQKBgC6tuE7llmvdsMnzTuxH77Kl4naCWyWajySes9fPWs1mWodpnqcSDVttT1GI+G0BzINLqSgy9G1zxtQ6NqdxckMUbVwY907xToPBcGbtcyI/agNYMseQuSZLKKevchVpxGFN+Vqa2m5yvyqrFPFTVY3HjfKB8MEe3hRRWyDRR1JfAoGAJV/4UYH26GfzdxlcDlrWsmVSFRCGEUV9ZYtplnkot8M2YLAGa2UuDBZzsukdGajIg6IN8gGXK3YL7YVbP6uX25Gv3IkBvV6LFeMI2lA6aCNdc3r6beMXphHA/JLmceJ5JC4PrMUOqs4MPXEtJ5yt8Z2I+g+9afb790bLkQAJhIkCgYEAzyYCF47U+csbRzGb/lszRwg1QvGtTvzQWuNAcAKclCuN7xplJJ+DUyvVA00WCz/z8MMa/PK8nB0KoUDfuFvo8bbNEAPcGK0l/He7+hF4wdm4S8fX22up5GgJUdV/dv8KZdE2U7yIU/i8BKw6Z3vJB7RB900yfjt56VlgsKspAB0=",
  "pubKey": "CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDKNKwPX4DJhYdGreAVaJy+efhIfbyczR0Mfyi/JfzszY9INH83Veo2s/yOKv+YOP4y7OWpkXL5G6K8fLgxwq5gtTc78W07uz5ZUrxfOT0R4QJuiiQHjQSxYKw08yLIP9JaR2ztL46DOO/Nvzl9gCWHGsAb+w+RLWa0R0SRyvaDiw8aZW9G70yYTGF/SPkEoYN26sioVDwppmKxZ9mTuKsujG0AGAMVPnmjhDI5WmBD3gnOiqCECqlgxl29Qlc1fCIbojcUVE9eWFWassFLicGdo/iMacsVvoTav9JvHZsMvg1HXeK0khQWluCUfdcR6coijDMDWBa77dTI6+b2ybZXAgMBAAE="
}

const getPeerInfo = async () => {
  return PeerInfo.create(peerJSON)
}


//////////////// INITIALIZE  ////////////////////////

// const peers = process.argv;

const main = async () => {

		const peerInfo = await getPeerInfo()

		const signaller = await Signaller.start({
		  port: 9998
		})

		let signallerAddress = `/ip4/${signaller.info.host}/tcp/${signaller.info.port}/ws/p2p-webrtc-star`

		console.info(`Signaling server running at ${signallerAddress}`)
		console.info(`Signaling server Peer ID is ${signallerAddress}/p2p/${peerInfo.id.toB58String()}`)

		/*
		const node = await Libp2p.create({
				addresses:      {
						// add a listen address (localhost) to accept TCP connections on a random port
						listen: [
							'/ip4/0.0.0.0/tcp/0'
						],

				},
				modules:        {
						transport: [WebSockets, TCP, WebRTCStar],
						connEncryption: [NOISE],
						streamMuxer: [MPLEX],
						peerDiscovery: [MulticastDNS],
				},
				config: {
					relay: {           // Circuit Relay options (this config is part of libp2p core configurations)
		        enabled: true,   // Allows you to dial and accept relayed connections. Does not make you a relay.
		        hop: {
		          enabled: true, // Allows you to be a relay for other peers
		          active: true   // You will attempt to dial destination peers if you are not connected to them
		        }
		      },
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
*/
}


main()
