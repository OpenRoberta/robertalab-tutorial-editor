const getResponseFromRestEndpoint = function(path, cbFunc) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', path, false);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === xhr.DONE && xhr.status === 200) cbFunc(xhr.response);
        if (xhr.status === 404) throw new Error('Der Pfad konnte nicht gefunden werden. Überprüfen Sie bitte die in properties.js enthaltenen Eigenschaften.');
    };

    xhr.send();
};

window.addEventListener('load', function() {
    let robotList;

    if (FraunhoferIAIS.Blockly && Object.keys(FraunhoferIAIS.Blockly.robotGroups).length === 0) {
        robotList = [];

        getResponseFromRestEndpoint(paths.orLabRest + 'robot/whitelist', function(resp) {
            robotList = JSON.parse(resp);
        });

        robotList.forEach(function(robot) {
            if (robot.group) {
                FraunhoferIAIS.Blockly.robotGroups[robot.group] = FraunhoferIAIS.Blockly.robotGroups[robot.group] || {};
                FraunhoferIAIS.Blockly.robotGroups[robot.group][robot.name] = robot;
            }
        });
    }

    if (FraunhoferIAIS.Blockly && Object.keys(FraunhoferIAIS.Blockly.robotCache).length === 0) {
        let robotXML = {};

        robotList.forEach(function(robot) {
            if (robot.name !== 'sim') {
                let xmlData = {};
                getResponseFromRestEndpoint(paths.orLabRest + 'robot/xml?robotName=' + robot.name, function(resp) {
                    let res = JSON.parse(resp)[robot.name];
                    xmlData['robot'] = robot.name;
                    xmlData['program'] = { 'toolbox': res.toolbox, 'prog': res.prog };
                    xmlData['configuration'] = res.configuration;
                });
                robotXML[robot.name] = xmlData;
            }
        });

        FraunhoferIAIS.Blockly.robotCache = robotXML;
    }
});
