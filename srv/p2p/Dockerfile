########################################################

               FROM node:14

########################################################    		

			# Install Packages #

########################################################   					

RUN       	apt-get update

########################################################   		

				# P2P-Node #

########################################################

##########  Expose Ports

EXPOSE 			9998/tcp 
EXPOSE 			9998/udp
EXPOSE 			9999/tcp 
EXPOSE 			9999/udp

##########  Write Files

WORKDIR			/usr/src
RUN 			mkdir app
WORKDIR 		/usr/src/app
COPY 			. .

##########  Build Instance

RUN 			npm i
CMD				node client.js