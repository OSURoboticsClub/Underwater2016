# Postmortem
> A discussion about what worked and what didn't.

## Successes
- Pressure Housing Box
- Cable Bulkheads
- Ethernet (even when waterlogged)
- MJPEG USB camera streaming
- `balrog-kun`'s tgy firmware

## Failures
- I2C miscommunications (often halted system)
- Wire waterproofing
- Camera housing waterproofing

## Prospective Causes
- I2C was improperly wired
- Hot glue waterproofing
- `balrog-kun`'s firmware used the entire time

## Experiments

**The I2C failure only ever occurred while the motors were being used.**

*The Raspberry Pi would rarely reboot as a result of the error.*

Sometimes it seemed as though water exposure caused problems:
- ROV failed a lot at the bottom of the pool
- A re-waterproofed main I2C connection seemed to help prevent errors
- Errors seemed to never occur while in the lab, but sometimes did

Things that seemed to have NO effect on error occurrence:
- Changing rate at which motors were written to
- Changing rate at which motors speeds were changed
- Changing speed of motors
- Changing programming language used to control motors
- Changing how I2C libraries were used
- Changing whether or not motors were read from
- Changing Jetson, to Jetson, to Raspberry Pi
- Changing power sources (wall adapter, batteries, lab PSU)


## Talking Points
The USB camera/Raspberry Pi/I2C approach:
- Simple wiring necessary across bulkhead
- Pi was accessible over SSH, which allowed debugging while underwater
- Pi allowed multiple developers to work on bot at once
- Pi can be programmed in any language
- Video stream readable by whole network
- Video averaged 400ms latency or less: pilot approved of latency
- Video embeddable into control application
- Only 1 Ethernet line in tether necessary for any number of data streams
- Only 1 surface device (computer) necessary for full functionality

Costs of the approach:
- Significantly increased boot up time
- Setup works best with a good router, which we never had
- Encoded video stream is higher latency than analog streams on dedicated wires
- I2C is extremely picky, and both Pi and Jetson shutdown upon failure
- I2C mystery was never solved
