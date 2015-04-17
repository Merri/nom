/* RequestAnimationFrame polyfill version 1.0.0, @license MIT, (c) 2015 Vesa Piittinen */

!function(w, raf, caf){
    var lastTime = 0, vendor, vendors = ['o', 'moz', 'ms', 'webkit']
    while (!w[raf] && (vendor = vendors.pop())) {
        w[raf] = w[vendor + 'R' + raf.slice(1)]
        w[caf] = w[vendor + 'C' + caf.slice(1)] || w[vendor + 'CancelR' + raf.slice(1)]
    }
    if (!w[raf] || !w[caf]) {
        w[raf] = function(callback, element) {
            var currTime = Date.now(), timeToCall = Math.max(0, 16 - (currTime - lastTime))
            lastTime = currTime + timeToCall
            return w.setTimeout(callback.bind(w, currTime + timeToCall), timeToCall)
        };
        w[caf] = w.clearTimeout
    }
}(this, 'requestAnimationFrame', 'cancelAnimationFrame');