// Check OS to set the host name accordingly.
let HOSTNAME = ""
if (navigator.userAgent.indexOf("Linux") !== -1) {
    HOSTNAME = "http://0.0.0.0:1999/"
} else if (navigator.userAgent.indexOf("Win") !== -1) {
    HOSTNAME = "http://localhost:1999/"
}

// Paths for use in the tutorial editor application.
const paths = {
    orLabRest: HOSTNAME + 'rest/data/',
    blockly: HOSTNAME + 'blockly'
};

// Generate script tags for HTML
let scriptBlockly = '<script src="' + paths.blockly + '/blockly_compressed.js"></script>',
    scriptBlocklyMsgDE = '<script src="' + paths.blockly + '/msg/js/de.js"></script>';

document.write(scriptBlockly);
document.write(scriptBlocklyMsgDE);
