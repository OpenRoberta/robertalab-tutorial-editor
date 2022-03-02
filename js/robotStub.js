var getJSONFromXML = function (path, cbFunc) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, false);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === xhr.DONE && xhr.status === 200) cbFunc(xhr.response);
      if (xhr.status === 404) throw new Error("Die XML-Datei konnte nicht gefunden werden. Überprüfen Sie bitte die in properties.js enthaltenen Eigenschaften und Dateipfade.")
    };

    xhr.send();
};

window.addEventListener('load', function(){
    if (FraunhoferIAIS.Blockly && Object.keys(FraunhoferIAIS.Blockly.robotGroups).length === 0) {
        let init = {"robots":{
                        "0":{"name":"sim"},
                        "1":{"name":"wedo","realName":"WeDo","group":"wedo"},
                        "2":{"name":"ev3lejosv1","realName":"EV3 leJOS 0.9.1","group":"ev3"},
                        "3":{"name":"ev3lejosv0","realName":"EV3 leJOS 0.9.0","group":"ev3"},
                        "4":{"name":"ev3dev","realName":"EV3dev","group":"ev3"},
                        "5":{"name":"ev3c4ev3","realName":"EV3 c4ev3","group":"ev3"},
                        "6":{"name":"nxt","realName":"NXT","group":"nxt"},
                        "7":{"name":"microbit","realName":"micro:bit","group":"microbit"},
                        "8":{"name":"botnroll","realName":"Bot'n Roll ","group":"botnroll"},
                        "9":{"name":"nao","realName":"NAO","group":"nao"},
                        "10":{"name":"bob3","realName":"BOB3","group":"bob3"},
                        "11":{"name":"sensebox","realName":"senseBox","group":"sensebox"},
                        "12":{"name":"mbot","realName":"mBot","group":"mbot"},
                        "13":{"name":"edison","realName":"Edison","group":"edison"},
                        "14":{"name":"festobionic","realName":"Bionics4Education","group":"festobionic"},
                        "15":{"name":"uno","realName":"Nepo4Arduino Uno","group":"arduino"},
                        "16":{"name":"unowifirev2","realName":"Nepo4Arduino Uno Wifi Rev2","group":"arduino"},
                        "17":{"name":"nano","realName":"Nepo4Arduino Nano","group":"arduino"},
                        "18":{"name":"mega","realName":"Nepo4Arduino Mega","group":"arduino"},
                        "19":{"name":"nano33blesense","realName":"Nepo4Nano33BLE","group":"arduino"},
                        "20":{"name":"calliope2017NoBlue","realName":"Calliope mini","group":"calliope"},
                        "21":{"name":"calliope2017","realName":"Calliope mini blue","group":"calliope"},
                        "22":{"name":"calliope2016","realName":"Calliope mini 2016","group":"calliope"}}},
            robots = init.robots || {};

        for (let key in robots) {
            if (!robots.hasOwnProperty(key) || !robots[key].group) {
                continue;
            }
            FraunhoferIAIS.Blockly.robotGroups[robots[key].group] = FraunhoferIAIS.Blockly.robotGroups[robots[key].group] || {};
            FraunhoferIAIS.Blockly.robotGroups[robots[key].group][robots[key].name] = robots[key];
        }
    }

    if (FraunhoferIAIS.Blockly && Object.keys(FraunhoferIAIS.Blockly.robotCache).length === 0) {

        var robotXML = {};
        Object.keys(robots).forEach(function (robot) {
            var attrXML = {};
            Object.keys(robots[robot]).forEach(function (attr) {
                var typeXML = {};
                if (attr.startsWith("default")) {
                    getJSONFromXML(robots[robot][attr], function(xml) {
                        attrXML[attr] = xml;
                    })
                } else if (!attr.startsWith("base")) {
                    Object.keys(robots[robot][attr]).forEach(function (type) {
                        getJSONFromXML(robots[robot][attr][type], function(xml) {
                            typeXML[type] = xml;
                        })
                    })
                    attrXML[attr] = typeXML;
                }
            })
            robotXML[robot] = attrXML
        })

        FraunhoferIAIS.Blockly.robotCache = {
            wedo: {"robot":"wedo","program": {"toolbox": robotXML.wedo.toolbox, "prog": robotXML.wedo.defaultProg}, "configuration": robotXML.wedo.configuration},
            ev3lejosv1: {"robot":"ev3lejosv1","program":{"toolbox": robotXML.ev3.toolbox, "prog": robotXML.ev3.defaultProg}, "configuration": robotXML.ev3.configuration},
            ev3lejosv0: {"robot":"ev3lejosv0","program":{"toolbox": robotXML.ev3.toolbox, "prog": robotXML.ev3.defaultProg}, "configuration": robotXML.ev3.configuration},
            ev3dev: {"robot":"ev3dev","program":{"toolbox": robotXML.ev3.toolbox, "prog": robotXML.ev3.defaultProg}, "configuration": robotXML.ev3.configuration},
            ev3c4ev3: {"robot":"ev3c4ev3","program":{"toolbox": robotXML.ev3.toolbox, "prog": robotXML.ev3.defaultProg}, "configuration": robotXML.ev3.configuration},
            nxt: {"robot":"nxt","program":{"toolbox": robotXML.nxt.toolbox, "prog": robotXML.nxt.defaultProg}, "configuration": robotXML.nxt.configuration},
            microbit: {"robot":"microbit","program":{"toolbox": robotXML.microbit.toolbox, "prog": robotXML.microbit.defaultProg}, "configuration": robotXML.microbit.configuration},
            botnroll: {"robot":"botnroll","program":{"toolbox": robotXML.botnroll.toolbox, "prog": robotXML.botnroll.defaultProg}, "configuration": robotXML.botnroll.configuration},
            nao: {"robot":"nao","program":{"toolbox": robotXML.nao.toolbox, "prog": robotXML.nao.defaultProg}, "configuration": robotXML.nao.configuration},
            bob3: {"robot":"bob3","program":{"toolbox": robotXML.bob3.toolbox, "prog": robotXML.bob3.defaultProg}, "configuration": robotXML.bob3.configuration},
            sensebox: {"robot":"sensebox","program":{"toolbox": robotXML.sensebox.toolbox, "prog": robotXML.sensebox.defaultProg}, "configuration": robotXML.sensebox.configuration},
            mbot: {"robot":"mbot","program":{"toolbox": robotXML.mbot.toolbox, "prog": robotXML.mbot.defaultProg}, "configuration": robotXML.mbot.configuration},
            edison: {"robot":"edison","program":{"toolbox": robotXML.edison.toolbox, "prog": robotXML.edison.defaultProg}, "configuration": robotXML.edison.configuration},
            festobionic: {"robot":"festobionic","program":{"toolbox": robotXML.festobionic.toolbox, "prog": robotXML.festobionic.defaultProg}, "configuration": robotXML.festobionic.configuration},
            uno: {"robot":"uno","program":{"toolbox": robotXML.arduino.toolbox, "prog": robotXML.arduino.defaultProg}, "configuration": robotXML.arduino.configuration},
            unowifirev2: {"robot":"unowifirev2","program":{"toolbox": robotXML.arduino.toolbox, "prog": robotXML.arduino.defaultProg}, "configuration": robotXML.arduino.configuration},
            nano: {"robot":"nano","program":{"toolbox": robotXML.arduino.toolbox, "prog": robotXML.arduino.defaultProg}, "configuration": robotXML.arduino.configuration},
            mega: {"robot":"mega","program":{"toolbox": robotXML.arduino.toolbox, "prog": robotXML.arduino.defaultProg}, "configuration": robotXML.arduino.configuration},
            nano33blesense: {"robot":"nano33blesense","program":{"toolbox": robotXML.nano33blesense.toolbox, "prog": robotXML.nano33blesense.defaultProg}, "configuration": robotXML.nano33blesense.configuration},
            calliope2017NoBlue: {"robot":"calliope2017NoBlue","program":{"toolbox": robotXML.calliope.toolbox, "prog": robotXML.calliope.defaultProg}, "configuration": robotXML.calliope.configuration},
            calliope2017: {"robot":"calliope2017","program":{"toolbox": robotXML.calliope.toolbox, "prog": robotXML.calliope.defaultProg}, "configuration": robotXML.calliope.configuration},
            calliope2016: {"robot":"calliope2016","program":{"toolbox": robotXML.calliope.toolbox, "prog": robotXML.calliope.defaultProg}, "configuration": robotXML.calliope.configuration}
        };
    }
});
