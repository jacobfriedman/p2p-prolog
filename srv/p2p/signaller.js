//////////////// 		WebRTC Signalling Server
const Signaller 		= require('libp2p-webrtc-star/src/sig-server')

//////////////// INITIALIZE  ////////////////////////
const main = async () => {

	console.clear();
	console.info(`
 ___  __   ___    ___  ____ ____ _    ____ ____
 |--'  /_  |--'   |--' |--< [__] |___ [__] |__,  
		 `)

	console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')

	const signaller = await Signaller.start({
	  port: 9998
	})

	let multiAddress 		 = `/ip4/${signaller.info.host}/tcp/${signaller.info.port}/ws/p2p-webrtc-star`

	console.info(`\n 💫 Signaling:\t\t${multiAddress}`)

}

main()
