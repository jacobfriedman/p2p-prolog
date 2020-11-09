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

COPY . .

##########  Build Instance

RUN 				npm i
CMD					node server.js