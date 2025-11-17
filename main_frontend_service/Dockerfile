FROM node:20   


WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy all the application files
COPY . .

RUN npm run build

EXPOSE 3000
# CMD ["npm", "run", "dev"] # enable while working on developement mode and need auto reload after code changes


#while working on production mode
CMD ["npm", "run", "start"]





