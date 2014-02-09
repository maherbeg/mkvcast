var os = require('os');

var ipAddress;

/**
 * Determines if this network address is a valid IPv4 address.
 * Stores the value in ipAddress.
 */
var ipv4Predicate = function(vals) {
   if (vals.family === 'IPv4' && !vals.internal) {
       ipAddress = vals.address;
   }
};

var ifaces = os.networkInterfaces();
for (var device in ifaces) {
    // TODO Replace with Array.prototype.find when V8 supports it
    ifaces[device].forEach(ipv4Predicate);
    
    if (ipAddress) { break; }
}

module.exports = {    
    /**
     * Get's the first IPv4 address available.
     * @return {String} IPv4 Address
     */
    ipAddress : ipAddress
};