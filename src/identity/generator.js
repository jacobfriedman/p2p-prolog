const fs 						= require('fs');

//////////////// 		LIBP2P Helpers
const PeerInfo 			= require('peer-info')


//////////////// INITIALIZE  ////////////////////////

const main = async () => {

		console.clear();

	  console.log('\n ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n')

		////////// Create Identity File & Save Locally

		let identityFilePath = '.identity-signaller',
				identity 
		// 

	  if (fs.existsSync(identityFilePath)) {
	   	identity = JSON.parse(fs.readFileSync('.identity-signaller',{ encoding:'utf8'} ));
	   	console.info(` 🔑 ID (preset):\t ${identity.id.id}`)
	  } else {
	  	identity = await PeerInfo.create()
			await fs.writeFileSync('.identity-signaller', JSON.stringify(identity, null, 2))
			console.info(` 🔑 ID (reset):\t ${identity.id.id}`)
	  }

}


main()
