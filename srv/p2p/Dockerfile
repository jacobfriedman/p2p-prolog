########################################################

               FROM node:14

########################################################    		

						# Install Packages #

########################################################   					

#	Git

RUN       	apt-get update && apt-get install -y \ 
						git \
						&& rm -rf /var/lib/apt/lists/*

########################################################   		

								# P2P-Node #

########################################################

##########  Expose Ports

EXPOSE 			9998/tcp 
EXPOSE 			9998/udp
EXPOSE 			9999/tcp 
EXPOSE 			9999/udp

##########  Git

WORKDIR			/usr/src
RUN 				mkdir app
WORKDIR 		/usr/src/app
RUN 				git clone https://github.com/jacobfriedman/p2p-prolog.git .

##########  Build Instance

WORKDIR 		/usr/src/app/srv/p2p
RUN 				npm i
CMD					node