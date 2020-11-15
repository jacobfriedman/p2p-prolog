########################################################

               FROM node:15 as build

########################################################    		

			# Install Peer-Id/Generator #

########################################################   					

ADD 			./src/www/package.json /app/
WORKDIR 		/app
RUN 			npm install

COPY 		./src/www .
COPY 		.peers.json .


########## 	Generate Server-Node Identity

RUN 		npm install -g peer-id
RUN 		peer-id > .identity.json

########## 	Install Browser/Client-Node dependencies

RUN 		npm run build

########################################################

	           FROM scratch as export

########################################################   

			# Copy files to top-level build dir # 		

########################################################   

COPY 		--from=build /app/.identity.json .
COPY 		--from=build /app/.identity.json ./src/www/
COPY 		--from=build /app/.peers.json	 ./src/www/
COPY 		--from=build /app/.identity.json ./srv/p2p/
COPY 		--from=build /app/.peers.json	 ./srv/p2p/
COPY 		--from=build /app/.build 		 ./srv/www


