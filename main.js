import five from 'johnny-five';
import Firebase from 'firebase';
import pixel from 'node-pixel';

const firebase = new Firebase("https://fiery-inferno-7517.firebaseio.com/gadgets/neopixel");
const fblight = new Firebase("https://fiery-inferno-7517.firebaseio.com/gadgets/lamp");
const board = new five.Board();

board.on("ready", function() {

    console.log("Board ready, lets add light");

    // setup the node-pixel strip.
    let strip = new pixel.Strip({
        strips: [{pin: 6, length: 50}],
        board: this,
        controller: "FIRMATA"
    });

    function isNumberMax(n, max) {
        return (n && parseInt(n) === n && parseInt(n) <= max && parseInt(n) >= 0);
    }

    strip.on("ready", function () {
        firebase.child('light').on('value', d => {
                console.log(d.val());
                var data = d.val();
                // Due to power draw, dont allow more than 15 lights
                if (!data || data.length > 59) {
                    return;
                }

                console.log(data);
                data.forEach(([id, r, g, b]) => {
                    if (isNumberMax(id, 59) && isNumberMax(r, 255) && isNumberMax(g, 255) && isNumberMax(b, 255)) {
                        r = parseInt(r);
                        g = parseInt(g);
                        b = parseInt(b);
                        id = parseInt(id);
                        strip.pixel(id).color(`rgba(${r}, ${g}, ${b}, 0)`);
                    } else {
                        console.log('Incorrect input');
                    }
                });
                strip.show();

        });
    });

    var relay = new five.Relay(10);
    fblight.child('switch').on('value', d => { 
        var data = d.val();
        console.log(data);

        if (!data) {
            relay.on();
        } else {
            relay.off();
        }
    });
});
