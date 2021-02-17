########################################################

               FROM node:alpine

########################################################    		

			# Install Packages #

########################################################   					

ADD 			package.json /app/
WORKDIR 		/app
RUN 			npm install

########################################################   		

				# P2P-Node #

########################################################

##########  Expose Ports

# EXPOSE 		9998/tcp 
# EXPOSE 		9998/udp
# EXPOSE 		9999/tcp 
# EXPOSE 		9999/udp

# This is a multicast listener!

EXPOSE 			0-65535

##########  Write Files

COPY 			. .

##########  Build Instance

CMD				node index.js