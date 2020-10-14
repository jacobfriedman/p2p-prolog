const process = require('process')
//////////////// LIBP2P

const Libp2p = require('libp2p')

//////////////// LIBP2P Libraries
const TCP = require('libp2p-tcp')
const NOISE = require('libp2p-noise')
const MPLEX = require('libp2p-mplex')

//////////////// LIBP2P Helpers
const multiaddr = require('multiaddr')



//////////////// INITIALIZE  ////////////////////////

const main = async () => {

        const node = await Libp2p.create({
                addresses:      {
                        // add a listen address (localhost) to accept TCP connections on a random port
                        listen: ['/ip4/127.0.0.1/tcp/0']
                },
                modules:        {
                        transport: [TCP],
                        connEncryption: [NOISE],
                        streamMuxer: [MPLEX]
                }
        })

        // start libp2p
        await node.start()
        console.log('libp2p has started')

        // print out listening addresses
        const advertiseAddrs = node.multiaddrs
        console.log('libp2p is advertising the following addresses: ', advertiseAddrs)

        const listenAddrs = node.transportManager.getAddrs()
        console.log('libp2p is listening on the following addresses: ', listenAddrs)

        // ping peer if received multiaddr
        if (process.argv.length >= 3) {
                const ma = multiaddr(process.argv[2])
                console.log(`pinging remote peer at ${process.argv[2]}`)
                const latency = await node.ping(ma)
                console.log(`pinged ${process.argv[2]} in ${latency}ms`)
        } else {
                console.log('no remote peer address given, skipping ping')
        }

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

