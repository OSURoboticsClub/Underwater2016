# OSURC ROV 2016
> Controls Oregon State University's Robotics Club 2016 ROV.

## ROV Requirements

- [Python](https://www.python.org/downloads/release/python-2710/)
- [Node.js](https://nodejs.org/en/)
- [PM2](https://www.npmjs.com/package/pm2)
- [mjpeg-streamer](https://github.com/jacksonliam/mjpg-streamer)

## ROV Services

- [x] [Query](docs/query.md) - network discovery service
- [x] [PM2 Web](docs/pm2_web.md) - running services
- [x] [Cameras](docs/cameras.md) - streams each USB camera
- [ ] [Sensors](docs/sensors.md) - temps, voltages, etc
- [x] [Motors](docs/motors.md) - writes to I2C devices
