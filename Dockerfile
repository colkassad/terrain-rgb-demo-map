# Use the official Node.js image as the base image
FROM node:14

# Create a user called 'app' to run the application
RUN useradd --user-group --create-home --shell /bin/false app

WORKDIR /app

# Set the owner of the copied directory to the 'app' user
RUN chown -R app:app /app

# Copy the "terrain-rgb-demo" directory to the root of the container
COPY --chown=app:app ./terrain-rgb-demo /app

# Switch to the 'app' user
USER app

# Set the working directory to the root of the copied directory
WORKDIR /app/terrain-rgb-demo

# Install dependencies
RUN npm install

# Expose a port (if the application needs it)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
