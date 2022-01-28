/*
Default locations for the lab and blockly repos. In case your installation is different from this configuration,
or if you have a custom setup, please update these paths accordingly.
*/
var paths = {
    orLab: "../openroberta-lab/",
    blockly: "../blockly",
};

/*
Schema to aid in fetching the relevant toolboxes and configuration XMLs.
Each <robot name> contains the following attributes:
    <robot name>: {
        basePath: <path of the resources folder containing the XMLs, default ORLab>,
        defaultProg: <path of the default program XML file>,
        configuration: {
            default: <path of the default config XML file>,
            toolbox: <path of the config toolbox XML file>
        },
        toolbox: {
            beginner: <path of the beginner program toolbox XML file>,
            expert: <path of the expert program toolbox XML file>
        }
    }
*/
var robots = {
    arduino: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/arduino/",
        configuration: {},
        toolbox: {},
    },
    bob3: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/bob3/",
        configuration: {},
        toolbox: {},
    },
    botnroll: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/botnroll/",
        configuration: {},
        toolbox: {},
    },
    festobionic: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/festobionic/",
        configuration: {},
        toolbox: {},
    },
    mbot: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/mbot/",
        configuration: {},
        toolbox: {},
    },
    nano33blesense: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/nano33blesense/",
        configuration: {},
        toolbox: {},
    },
    sensebox: {
        basePath: paths.orLab + "RobotArdu/src/main/resources/sensebox/",
        configuration: {},
        toolbox: {},
    },
    edison: {
        basePath: paths.orLab + "RobotEdison/src/main/resources/",
        configuration: {},
        toolbox: {},
    },
    ev3: {
        basePath: paths.orLab + "RobotEV3/src/main/resources/",
        configuration: {},
        toolbox: {},
    },
    calliope: {
        basePath: paths.orLab + "RobotMbed/src/main/resources/calliope/",
        configuration: {},
        toolbox: {},
    },
    microbit: {
        basePath: paths.orLab + "RobotMbed/src/main/resources/microbit/",
        configuration: {},
        toolbox: {},
    },
    nao: {
        basePath: paths.orLab + "RobotNAO/src/main/resources/",
        configuration: {},
        toolbox: {},
    },
    nxt: {
        basePath: paths.orLab + "RobotNXT/src/main/resources/",
        configuration: {},
        toolbox: {},
    },
    wedo: {
        basePath: paths.orLab + "RobotWeDo/src/main/resources/",
        configuration: {},
        toolbox: {},
    },
};

/*
The different configuration files are populated in the following section.
To specify your own XML file, edit the relevant filename (in quotes) and ensure the
*basePath* for the respective robot is defined as per requirement.
*/
robots.arduino.configuration = {
    default: robots.arduino.basePath + "configuration.default.xml",
    toolbox: robots.arduino.basePath + "configuration.toolbox.xml"
};
robots.arduino.toolbox = {
    beginner: robots.arduino.basePath + "program.toolbox.beginner.xml",
    expert: robots.arduino.basePath + "program.toolbox.expert.xml"
};
robots.arduino.defaultProg = robots.arduino.basePath + "program.default.xml";

robots.bob3.configuration = {
    default: robots.bob3.basePath + "configuration.default.xml",
    toolbox: robots.bob3.basePath + "configuration.toolbox.xml"
};
robots.bob3.toolbox = {
    beginner: robots.bob3.basePath + "program.toolbox.beginner.xml",
    expert: robots.bob3.basePath + "program.toolbox.expert.xml"
};
robots.bob3.defaultProg = robots.arduino.defaultProg;

robots.botnroll.configuration = {
    default: robots.botnroll.basePath + "configuration.default.xml",
    toolbox: robots.botnroll.basePath + "configuration.toolbox.xml"
};
robots.botnroll.toolbox = {
    beginner: robots.botnroll.basePath + "program.toolbox.beginner.xml",
    expert: robots.botnroll.basePath + "program.toolbox.expert.xml"
};
robots.botnroll.defaultProg = robots.arduino.defaultProg;

robots.festobionic.configuration = {
    default: robots.festobionic.basePath + "configuration.default.xml",
    toolbox: robots.festobionic.basePath + "configuration.toolbox.xml"
};
robots.festobionic.toolbox = {
    beginner: robots.festobionic.basePath + "program.toolbox.beginner.xml",
    expert: robots.festobionic.basePath + "program.toolbox.expert.xml"
};
robots.festobionic.defaultProg = robots.arduino.defaultProg;

robots.sensebox.configuration = {
    default: robots.sensebox.basePath + "configuration.default.xml",
    toolbox: robots.sensebox.basePath + "configuration.toolbox.xml"
};
robots.sensebox.toolbox = {
    beginner: robots.sensebox.basePath + "program.toolbox.beginner.xml",
    expert: robots.sensebox.basePath + "program.toolbox.expert.xml"
};
robots.sensebox.defaultProg = robots.arduino.defaultProg;

robots.mbot.configuration = {
    default: robots.mbot.basePath + "configuration.default.xml",
    toolbox: robots.mbot.basePath + "configuration.toolbox.xml"
};
robots.mbot.toolbox = {
    beginner: robots.mbot.basePath + "program.toolbox.beginner.xml",
    expert: robots.mbot.basePath + "program.toolbox.expert.xml"
};
robots.mbot.defaultProg = robots.arduino.defaultProg;

robots.nano33blesense.configuration = {
    default: robots.nano33blesense.basePath + "configuration.default.xml",
    toolbox: robots.arduino.basePath + "configuration.toolbox.xml"
};
robots.nano33blesense.toolbox = {
    beginner: robots.nano33blesense.basePath + "program.toolbox.beginner.xml",
    expert: robots.nano33blesense.basePath + "program.toolbox.expert.xml"
};
robots.nano33blesense.defaultProg = robots.arduino.defaultProg;

robots.edison.configuration = {
    default: robots.edison.basePath + "edison.configuration.default.xml",
    toolbox: robots.edison.basePath + "edison.configuration.toolbox.xml"
};
robots.edison.toolbox = {
    beginner: robots.edison.basePath + "edison.program.toolbox.beginner.xml",
    expert: robots.edison.basePath + "edison.program.toolbox.expert.xml"
};
robots.edison.defaultProg = robots.edison.basePath + "edison.program.default.xml";

robots.ev3.configuration = {
    default: robots.ev3.basePath + "ev3.configuration.default.xml",
    toolbox: robots.ev3.basePath + "ev3.configuration.toolbox.xml"
};
robots.ev3.toolbox = {
    beginner: robots.ev3.basePath + "ev3.program.toolbox.beginner.xml",
    expert: robots.ev3.basePath + "ev3.program.toolbox.expert.xml"
};
robots.ev3.defaultProg = robots.ev3.basePath + "ev3.program.default.xml";

robots.calliope.configuration = {
    default: robots.calliope.basePath + "configuration.default.xml",
    toolbox: robots.calliope.basePath + "configuration.toolbox.xml"
};
robots.calliope.toolbox = {
    beginner: robots.calliope.basePath + "program.toolbox.beginner.xml",
    expert: robots.calliope.basePath + "program.toolbox.expert.xml"
};
robots.calliope.defaultProg = robots.calliope.basePath + "program.default.xml";

robots.microbit.configuration = {
    default: robots.microbit.basePath + "configuration.default.xml",
    toolbox: robots.microbit.basePath + "configuration.toolbox.xml"
};
robots.microbit.toolbox = {
    beginner: robots.microbit.basePath + "program.toolbox.beginner.xml",
    expert: robots.microbit.basePath + "program.toolbox.expert.xml"
};
robots.microbit.defaultProg = robots.microbit.basePath + "program.default.xml";

robots.nao.configuration = {
    default: robots.nao.basePath + "nao.configuration.default.xml",
    toolbox: robots.nao.basePath + "nao.configuration.toolbox.xml"
};
robots.nao.toolbox = {
    beginner: robots.nao.basePath + "nao.program.toolbox.beginner.xml",
    expert: robots.nao.basePath + "nao.program.toolbox.expert.xml"
};
robots.nao.defaultProg = robots.nao.basePath + "nao.program.default.xml";

robots.nxt.configuration = {
    default: robots.nxt.basePath + "nxt.configuration.default.xml",
    toolbox: robots.nxt.basePath + "nxt.configuration.toolbox.xml"
};
robots.nxt.toolbox = {
    beginner: robots.nxt.basePath + "nxt.program.toolbox.beginner.xml",
    expert: robots.nxt.basePath + "nxt.program.toolbox.expert.xml"
};
robots.nxt.defaultProg = robots.nxt.basePath + "nxt.program.default.xml";

robots.wedo.configuration = {
    default: robots.wedo.basePath + "wedo.configuration.default.xml",
    toolbox: robots.wedo.basePath + "wedo.configuration.toolbox.xml"
};
robots.wedo.toolbox = {
    beginner: robots.wedo.basePath + "wedo.program.toolbox.beginner.xml",
    expert: robots.wedo.basePath + "wedo.program.toolbox.expert.xml"
};
robots.wedo.defaultProg = robots.wedo.basePath + "wedo.program.default.xml";

// Generate script tags for HTML
var scriptBlockly = "<script src=\"" + paths.blockly + "/blockly_compressed.js\"></script>",
    scriptBlocklyMsgDE = "<script src=\"" + paths.blockly + "/msg/js/de.js\"></script>";

document.write(scriptBlockly);
document.write(scriptBlocklyMsgDE);
