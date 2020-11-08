# libp2p in the browser

This example leverages the [Parcel.js bundler](https://parceljs.org/) to compile and serve the libp2p code in the browser. Parcel uses [Babel](https://babeljs.io/) to handle transpilation of the code. You can use other bundlers such as Webpack or Browserify, but we will not be covering them here.

## Setup

In order to run the example, first install the dependencies from same directory as this README:

```
cd ./examples/libp2p-in-the-browser
npm install
```

## Running the examples

Start by running the Parcel server:

```
npm start
```

The output should look something like this:

```log
$ npm start

> libp2p-in-browser@1.0.0 start
> parcel index.html --port 80

Server running at http://localhost
✨  Built in 1000ms.
```

This will compile the code and start a server listening on port [http://localhost:1234](http://localhost:1234). Now open your browser to `http://localhost:1234`. You should see a log of your node's Peer ID, the discovered peers from the Bootstrap module, and connections to those peers as they are created.

Now, if you open a second browser tab to `http://localhost:1234`, you should discover your node from the previous tab. This is due to the fact that the `libp2p-webrtc-star` transport also acts as a Peer Discovery interface. Your node will be notified of any peer that connects to the same signaling server you are connected to. Once libp2p discovers this new peer, it will attempt to establish a direct WebRTC connection.

**Note**: In the example we assign libp2p to `window.libp2p`, in case you would like to play around with the API directly in the browser. You can of course make changes to `index.js` and Parcel will automatically rebuild and reload the browser tabs.

## Going to production?

This example uses public `libp2p-webrtc-star` servers. These servers should be used for experimenting and demos, they **MUST** not be used in production as there is no guarantee on availability.

You can see how to deploy your own signaling server in [libp2p/js-libp2p-webrtc-star/DEPLOYMENT.md](https://github.com/libp2p/js-libp2p-webrtc-star/blob/master/DEPLOYMENT.md).

Once you have your own server running, you should add its listen address in your libp2p node configuration.
