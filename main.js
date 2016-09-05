import five from 'johnny-five';
import Firebase from 'firebase';
import pixel from 'node-pixel';

const firebase = new Firebase("https://fiery-inferno-7517.firebaseio.com/gadgets/neopixel");
const fblight = new Firebase("https://fiery-inferno-7517.firebaseio.com/gadgets/lamp");
const board = new five.Board();

const RELAY_PIN = 10;
const STRIP_PIN = 6;

board.on("ready", function() {

    console.log("Board ready, lets add light");

    // setup the node-pixel strip.
    let strip = new pixel.Strip({
        strips: [{pin: STRIP_PIN, length: 60}],
        board: this,
        controller: "FIRMATA"
    });

    const isNumberRange = (n, min, max) => {
        try {
            return parseInt(n) === n && n >= min && n <= max;
        } catch(e) {
            return false;
        }
    };

    const setColor = (strip, id, r, g, b) => {
        if (isNumberRange(id, 0, 59) && isNumberRange(r, 0, 255) && isNumberRange(g, 0, 255) && isNumberRange(b, 0, 255)) {
            r = parseInt(r);
            g = parseInt(g);
            b = parseInt(b);
            id = parseInt(id);
            strip.pixel(id).color(`rgba(${r}, ${g}, ${b}, 0)`);
            console.log(`Interacted with: ${id}`);
        } else {
            console.log('Incorrect numeric-value input');
        }
    };

    strip.on("ready", function () {
        firebase.child('light').on('value', d => {
                // console.log(d.val());
                var data = d.val();
                if (data == null || typeof data != 'object') {
                    console.log('Incorrect data-type');
                    return;
                }
                data.forEach(data => {
                    if (!data || data.length != 4) {
                        console.log('Incorrect data-format');
                        return;
                    }
                    setColor(strip, ...data);
                });
                strip.show();
        });
    });

    var relay = new five.Relay(RELAY_PIN);
    fblight.child('switch').on('value', d => { 
        var data = d.val();
        console.log(data);

        if (data) {
            relay.on();
        } else {
            relay.off();
        }
    });
});
