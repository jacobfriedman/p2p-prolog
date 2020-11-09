########################################################

               FROM node:14

########################################################    				

RUN       	apt-get update && apt-get install -y \ 
git \
&& rm -rf /var/lib/apt/lists/*

########################################################

##########  Expose Ports

EXPOSE 			80/tcp

##########  Build Instance

RUN 				ls -l

##########  RUN

RUN 				npm i
CMD					node server.js