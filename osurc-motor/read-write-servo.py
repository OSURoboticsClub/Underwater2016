import smbus
import sys
import socket
import threading
import time
import struct
import json



class readMotor(threading.Thread):
    """read the various addresses from the i2c; the refresh rate of send/receive info is set by receive rate"""

    def __init__(self, threadID, name, debug=False):
        threading.Thread.__init__(self)
        self.LOCAL_GOOD = True

        self.init_socket()
        self.threadID = threadID
        self.name = name

        self.debug = debug

    def init_socket(self):
    #initialize socket connections
        self.UDP_IP = "0.0.0.0"
        self.PORT = 33333
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        #set a timeout if no data is being found
        self.sock.setblocking(0)
        self.sock.settimeout(3)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind((self.UDP_IP, self.PORT))
        #mreq = struct.pack("=4sl", socket.inet_aton("224.51.105.104"), socket.INADDR_ANY)
        #self.sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)
        #self.sock.bind((self.UDP_IP, self.PORT))
        return

        #possible error catching?
        try:
            self.sock, addr = self.sock.accept()
        except socket.timeout:
            print "socket rejected"
            self.LOCAL_GOOD = False
            self.sock.close()
            self.sock = None
            return
        else:
            print "Connected by", addr

        return 1

    def send_current_vals(self):
        #Send out information to the sockets ports or whatever, meryl
        global I2C_VAL_DCT, MOTOR_READ_MAP
        global GLOBAL_BUS

        #update global dictionary of vals based on posted motor speeds
        for addr in I2C_VAL_DCT:
            for reading, cmd in MOTOR_READ_MAP.iteritems():
                try:
                    val = GLOBAL_BUS.read_word_data(int(addr, 16), cmd)
                except IOError:
                    #print "readMotor Error: ESC at %s not found" % addr
                    continue
                else:
                    I2C_VAL_DCT[addr][reading] = self.byteswap(val)

        #Broadcast changes via socket
        global OUTGOING
        out = {"values":I2C_VAL_DCT}
        OUTGOING = json.dumps(out, sort_keys=True)
        try:
            self.sock.sendto(OUTGOING, self.request_addr)
        except TypeError:
            print "readMotor Error: Could not send package to surface address", self.request_addr
        return 1
        #multicasting stuff?

    def post_motor_speeds(self, vals_dct):
    #post motor values decoded from json string
        global I2C_VAL_DCT, MOTOR_SET
        for motor_addr, motor_speed in vals_dct.iteritems():
            #save current motorspeed
            I2C_VAL_DCT[str(motor_addr)]["CURRENT"] = I2C_VAL_DCT[str(motor_addr)]["POSTED"]
            if self.debug:
                print motor_addr
                print "current:", I2C_VAL_DCT[str(motor_addr)]["CURRENT"]
                print "posted:", I2C_VAL_DCT[str(motor_addr)]["POSTED"]
                print "set:", MOTOR_SET[str(motor_addr)], "\n"
            try:
                I2C_VAL_DCT[str(motor_addr)]["POSTED"] = int(motor_speed)
            #If the surface sends an address we don't recognize
            except KeyError:
                print "Warning: i2c address \'%s\' not recognized - motor value will not be set" % motor_addr
                continue
                #print sys.exc_info()[0]
        return 1


    @staticmethod
    def byteswap(dec):
        #swap bytes on a 2 byte hex
        hi = dec >> 8 & 0xff
        lo = dec & 0xff
        lo = lo << 8
        out = lo | hi
        return out

    @staticmethod
    def unsign(dec):
        out = abs(dec) & 0x7FFF
        if dec < 0:
            out = out | 0x8000

        return out
        #map (-32000, 0) -> (64000, 32000)

    def run(self):
    #Main thread r
        global ALL_GOOD
        t0 = time.time()
        print "Starting Thread %s" % self.name
        #main running: get sockets and
        while ALL_GOOD and self.LOCAL_GOOD:
            data = None
            #see if we find something
            try:
                #get an incoming request and save the address
                data, self.request_addr = self.sock.recvfrom(1024) # buffer

            except socket.timeout:
                #reset writer calibration protocol
                writer.index = 0
                print "readMotor Warning: Socket timeout"

            #upon receiving data, respond with motor speeds
            global INCOMING
            if data:
                INCOMING = json.loads(data)
                #INCOMING HAS FORMAT {
                #                    "motors": {"addr": val, ...},
                #                    "servos": {int: val, ...},
                #                    "request": ?
                #                    }
                #SETTING MOTOR SPEEDS
                if "motors" in INCOMING.keys():
                #POST RECEIVED MOTOR SPEEDS
                    self.post_motor_speeds(INCOMING.get("motors"))
                #DIFFERENT COMMAND REQUESTS
                if "servos" in INCOMING.keys():
                    #export the servo job to the servo thread
                    servo.set_servos(INCOMING.get("servos"))
                #RESPOND WITH CURRENT VALUES OF THINGS, conditional on a valid operation
                if "request" in INCOMING.keys():
                    self.send_current_vals()

        else:
            print "Exiting Thread %s" % self.name
            return



class writeMotor(threading.Thread):
    """read the various addresses from the i2c; the refresh rate of send/receive info is set by receive rate"""

    def __init__(self, threadID, name, delta_t):
        threading.Thread.__init__(self)

        self.threadID = threadID
        self.name = name
        #motor set frequency
        self.delta_t = delta_t
        self.debug = True

    def write_motor_i2c(self, addr, val, index):
        #calibrate writing the first time, then write regularly
        if index == 0:
            GLOBAL_BUS.write_word_data(addr, 0x0, 0xffff)
            GLOBAL_BUS.write_word_data(addr, 0x0, 0x0000)

        #unsign, byteswap and write
        new_val = readMotor.unsign(val)
        new_val = readMotor.byteswap(new_val)
        GLOBAL_BUS.write_word_data(addr, 0x0, new_val)
        return 1

    def run(self):
        #Set motor values at a
        print "Starting Thread %s" % self.name
        global I2C_VAL_DCT, GLOBAL_BUS, MOTOR_SET
        global ALL_GOOD
        #controls calibration of i2c motor
        #Write motors at the refresh rate delta_t
        self.index = 0
        while ALL_GOOD:
            #write posted speeds to respective addresses, at a rate of delta_t
            for addr, val_dct in I2C_VAL_DCT.iteritems():
                #Get the motor set value
                val = MOTOR_SET.get(str(addr))
                try:
                    self.write_motor_i2c(int(addr, 16), val, self.index)
                    #write current set speed
                    I2C_VAL_DCT[addr]["CURRENT"] = val
                except TypeError:
                    print sys.exc_info()[0]
                except IOError:
                    if self.index==0:
                        print "writeMotor Error: ESC at %s not found" % addr
                    continue

            self.index += 1
            time.sleep(self.delta_t)

        print "Exiting Thread %s" % self.name
        return


class writeServo(threading.Thread):

    def __init__(self, threadID, name, delta_t):
        threading.Thread.__init__(self)

        self.threadID = threadID
        self.name = name
        #motor set frequency
        self.delta_t = delta_t

        #servo calibration happens once in thread lifetime
        self.addr_str = "0x40"
        self.addr = int(self.addr_str, 16)
        self.max_pulse_length = 20000 #micros, from a freq of 50 Hz
        self.calibrate()

    def calibrate(self):
    #Calibrate with some commands...
        for pair in [(0x00, 0x10), (0xFE, 0x79), (0x00, 0x00)]:
            GLOBAL_BUS.write_byte_data(self.addr, pair[0], pair[1])

    def set_servos(self, servo_dct):
    #write posted speeds to respective addresses, at a rate of delta_t
        for sub_addr, pulse_val in servo_dct.iteritems():
            #set to 'subaddress' 6-69
            start_reg = int(sub_addr) * 4 + 6
            try:
                self.write_servo_i2c(self.addr, start_reg, int(pulse_val))
            except TypeError:
                print sys.exc_info()
            except IOError:
                print sys.exc_info()

        return 1

    def write_servo_i2c(self, addr, start, pulse_width):
        #Write a series of four values to four registers at the subaddr

        #set the start value for the pulse
        GLOBAL_BUS.write_byte_data(addr, start, 0)
        GLOBAL_BUS.write_byte_data(addr, start+1, 0)

        #map values of 0-max_pulse -> 0-12 bytes
        new_val = pulse_width * (2**12-1)/self.max_pulse_length
        hi = new_val >> 8
        lo = new_val & 0xff
        GLOBAL_BUS.write_byte_data(addr, start+2, lo)
        GLOBAL_BUS.write_byte_data(addr, start+3, hi)
        return 1

    def run(self):
        #Set motor values at a
        print "Starting Thread %s" % self.name
        global ALL_GOOD

        while ALL_GOOD:
        #stay awake little buddy...
            pass

        print "Exiting Thread %s" % self.name
        return



class globalManagement(threading.Thread):
    """dealing with some global stuff"""

    def __init__(self, threadID, name, delta_t,  motor_inc, refresh):
        threading.Thread.__init__(self)

        self.threadID = threadID
        self.name = name

        self.delta_t = delta_t
        self.inc = motor_inc
        self.refresh = refresh
    def run(self):
        global MOTOR_SET
        print "Starting Thread %s" % self.name

        t0 = time.time()
        #Look at all current speeds, and where they're going
        while ALL_GOOD:
            for addr, val_dct in I2C_VAL_DCT.iteritems():
                posted = val_dct.get("POSTED")
                current = val_dct.get("CURRENT")
                #print posted, current, MOTOR_SET[str(addr)]
                #walking upwards
                if current <= posted:
                #incrementing by self.inc to get to posted values
                    if (current + self.inc) < posted:
                        MOTOR_SET[str(addr)] += self.inc
                    elif (current + self.inc) >= posted:
                        MOTOR_SET[str(addr)] = posted
                #walking downwards
                elif current > posted:
                    if (current - self.inc) > posted:
                        MOTOR_SET[str(addr)] -= self.inc
                    elif (current - self.inc) <= posted:
                        MOTOR_SET[str(addr)] = posted

            #Post a summary of what's going on
            global reader, INCOMING, OUTGOING
            if t0 - time.time() > self.refresh:
                print "Values", OUTGOING
                print "Surface Address", reader.request_addr
                print "Last Request", INCOMING, "\n"
                t0 = time.time()

            time.sleep(self.delta_t)
        else:
            print "Exiting Thread %s" % self.name
            return





def main():

    #Open threads
    reader.start()
    writer.start()
    servo.start()
    glob_thread.start()
    #Wait for a keyboard interrupt or threads to die
    while True and threading.active_count() > 1:
        #IMPLEMENT RESET ON THREADS THAT DIE; e.g setMotor with index>1
        time.sleep(1)

if __name__ == "__main__":
    ALL_GOOD = True #if this goes true, threads die
    GLOBAL_BUS = smbus.SMBus(1)
    MOTOR_READ_MAP = {"T": 0x06, "Rev": 0x02, "V": 0x04}
    addr_lst = ["0x2a", "0x29", "0x2b", "0x2c"]
    SERVO_ADDR = "0x40"
    #Construct dictionaries corresponding to motor values at addresses
    I2C_VAL_DCT = {}

    MOTOR_SET = {} #these are values that the motors are 'chasing'
    OUTGOING = {}
    INCOMING = {} #incoming dictionary of set vals
    for addr in addr_lst:
        I2C_VAL_DCT[addr] = {"T": None, "Rev": None, "V": None, "POSTED": 0, "CURRENT": 0}
        MOTOR_SET[addr] = 0



    #initialize threads
    reader = readMotor(1, "motor-read", debug=True)
    writer = writeMotor(2, "motor-write", .02)
    servo  = writeServo(3, "servo-write", .02)
    glob_thread = globalManagement(4, "globals-management", .02, 30, 5)
    try:
        main()

    except KeyboardInterrupt:
        print "TERMINATING THREADS"
        ALL_GOOD = False
        #close sockets?
        #reader.sock.shutdown(socket.SHUT_WR)
        time.sleep(1)
        sys.exit()
