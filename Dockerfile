########################################################

               FROM node:14

########################################################   


########################################################   		

						# Install Packages #

########################################################   					

#	Git

RUN       	apt-get update && apt-get install -y \ 
						git \
						&& rm -rf /var/lib/apt/lists/*


########################################################   		

								# P2P-Prolog #

########################################################

WORKDIR			/usr/src
RUN 				mkdir app
WORKDIR 		/usr/src/app

RUN 				git clone https://github.com/jacobfriedman/p2p-prolog.git .

WORKDIR 		/usr/src/app/srv/p2p
CMD 				npm i
#CMD					node index.js

# Expose Ports

EXPOSE 			9999



