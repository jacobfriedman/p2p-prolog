########################################################

					FROM node:14

########################################################    
						

# Update Instance
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

ADD 			package.json /app/
WORKDIR 		/app
RUN 			npm install


# Expose Ports
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

EXPOSE 		80


# Write Files
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

COPY . .


# Build Instance
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈


CMD			node server.js