# Underwater2016
> Oregon State University Robotics Club MATE Competition ROV.

1. Plug in ROV.
2. Launch Lighthouse.
3. Wait for happy sounds. **Not finished. :P**


## ROV Services

- [x] [Discovery](docs/discovery.md) - network discovery service
- [x] [PM2 Web](docs/pm2_web.md) - displays running services
- [x] [Cameras](docs/cameras.md) - streams each USB camera
- [ ] [Sensors](docs/sensors.md) - temps, voltages, etc
- [ ] [Motors](docs/motors.md) - reads/writes from/to I2C devices


## Project Structure

- `surface/` is an Electron app, written in JavaScript.
- `underwater/` contains the above services as scripts.


## ROV Setup Sequence
*This stuff should already be done.*

1. SSH into ROV
2. Install system packages:
  - [python smbus-cffi](https://pypi.python.org/pypi/smbus-cffi)
  - [node.js](https://nodejs.org/en/download/package-manager/)
  - [mjpeg-streamer](https://github.com/jacksonliam/mjpg-streamer)
  - [pm2](https://www.npmjs.com/package/pm2)
3. `pm2 install`
4. `git clone ...`
5. `npm install`
6. `pm2 web start`
7. `pm2 start process.json`
8. `pm2 save`
9. Build desktop app and install on computer too.
