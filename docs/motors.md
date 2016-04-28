# Motor/Servo Commands


## Motor/Servo Control Request
A packet for changing the current output values.

- Control values should not change between requests.
- Sent frequently (up to 20Hz).
- The `motors` and `servos` keys are optional.
- The keys within each dictionary are optional.
- `motors.hex` is an integer from [-32768,32767]
- `servos.id` is an integer from [0,20000]
- Only respond if there were errors: halts the surface.

```json
{
  "uuid": "967cb0d7-678c-4928-962c-ca88398dfc11",
  "motors": {
    "0x29": 0,
    "0x2d": 1000
  },
  "servos": {
    "0": 500,
    "2": 1400
  }
}
```

```json
{
  "uuid": "967cb0d7-678c-4928-962c-ca88398dfc11",
  "errors": [
    "write failed to 0x2d: address invalid"
  ]
}
```


## Motor/Servo Status Request
A packet for requesting all state information.

- Keeps the surface in sync with the robot.
- Sent infrequently (~2Hz).

```json
{
  "uuid": "967cb0d7-678c-4928-962c-ca88398dfc11",
  "status": true
}
```

```json
{
  "uuid": "967cb0d7-678c-4928-962c-ca88398dfc11",
  "motors": {
    "0x29": 0,
    "0x2a": 4400,
    "0x2b": 1000,
    "0x2c": 4400
  },
  "servos": {
    "0": 500,
    "1": 720,
    "2": 1400
  }
}
```
