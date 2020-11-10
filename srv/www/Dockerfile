########################################################

					FROM node:14

########################################################    
						

# Update Instance
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

RUN       	apt-get update


# Expose Ports
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

EXPOSE 		80


# Write Files
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

COPY 		. .


# Build Instance
# ┈┈┈┈┈┈┈┈┈┈┈┈┈┈

RUN 		npm i
CMD			node server.js