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

								# Node Server #

########################################################

##########  Expose Ports

EXPOSE 			80/tcp

##########  Git

WORKDIR			/usr/src
RUN 				mkdir app
WORKDIR 		/usr/src/app
RUN 				git clone https://github.com/jacobfriedman/p2p-prolog.git .

##########  Build Instance

WORKDIR 		/usr/src/app/srv/www
RUN 				npm i
CMD					node server.js