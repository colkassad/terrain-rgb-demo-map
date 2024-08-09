# terrain-rgb-demo-map
Demo map for [terrain-rgb-height](https://github.com/colkassad/terrain-rgb-height) and [terrain-rgb-slope](https://github.com/colkassad/terrain-rgb-slope) repositories. These tiles are useful for game engines and game editors. See an example of using it in Unreal Engine [here](https://imgur.com/a/ENsZXHN).

![alt text](https://github.com/colkassad/terrain-rgb-demo-map/blob/main/ui.jpeg?raw=true)

# Prerequisites
* Nodejs
* npm
* A MapBox API token (you can obtain one with a free acount)

# Getting Started
* Open public/javascripts/map.js and replace `<your MapBox API Token here>`  with your Mapbox API token
* Navigate to the terrain-rgb-demo folder: `cd terrain-rgb-demo`
* Run `npm install` to install dependences
* Run `npm start` to start the application
* Navigate to `localhost:3000`
* In the map interface, select a tile and click `Download Heightmap` or `Download Slope` on the left sidebar to download a 16-bit elevation tile, or a 16-bit slope tile, respectively.
* Alternatively, in the map interface, double-click a tile to immediately download the 16-bit PNG elevation version of the tile

# Docker
* if you wish to use Docker for this application, run `docker-compose build && docker-compose up` from the root of the repository and navigate to `localhost:3000`
