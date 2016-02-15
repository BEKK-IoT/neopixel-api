import five from 'johnny-five';
import Firebase from 'firebase';
import pixel from 'node-pixel';

const firebase = new Firebase("https://fiery-inferno-7517.firebaseio.com/gadgets/neopixel");
const board = new five.Board();

board.on("ready", function() {

    console.log("Board ready, lets add light");

    // setup the node-pixel strip.
    let strip = new pixel.Strip({
        strips: [{pin: 6, length: 60}],
        board: this,
        controller: "FIRMATA"
    });

    strip.on("ready", function () {
        firebase.child('light').on('value', d => {
            try {
                const data = JSON.parse(d.val());

                strip.off();
                data.forEach(([id, r, g, b]) => {
                    strip.pixel(id).color(`rgba(${r}, ${g}, ${b}, 0)`);
                });
                strip.show();
            } catch (ex) {

            }

        });
    });

});