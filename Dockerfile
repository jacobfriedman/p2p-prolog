########################################################

               FROM node:15 as build

########################################################    		

			# Install Peer-Id/Generator #

########################################################   					

WORKDIR 	/app

COPY 		./src/www .

########## 	Generate Server-Node Identity

RUN 		npm install -g peer-id
RUN 		peer-id > .identity.json

########## 	Install Browser/Client-Node dependencies

RUN 		npm i
RUN 		npm run build

########################################################

	           FROM scratch as export

########################################################   

			# Copy files to top-level build dir # 		

########################################################   

COPY 		--from=build /app/.identity.json .
COPY 		--from=build /app/.identity.json ./src/www/
COPY 		--from=build /app/.build ./srv/www


