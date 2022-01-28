var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Blockly = FraunhoferIAIS.Blockly || {};

FraunhoferIAIS.Blockly.blocklyPath = FraunhoferIAIS.Blockly.blocklyPath || paths.blockly;

FraunhoferIAIS.Blockly.programWorkspace = FraunhoferIAIS.Blockly.programWorkspace || null;

FraunhoferIAIS.Blockly.setProgramWorkspace = function (programWorkspace) {
    FraunhoferIAIS.Blockly.programWorkspace = programWorkspace;
}

FraunhoferIAIS.Blockly.initProgramWorkspace = function() {
    if (FraunhoferIAIS.Blockly.programWorkspace !== null) {
        return;
    }
    if (!FraunhoferIAIS.Blockly.currentRobot || !FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot]) {
        console.log('In order to initialize the program-workspace, you have to load a robot system first by calling "FraunhoferIAIS.Blockly.replaceRobot(\'robotID\')"');
        FraunhoferIAIS.Notification.showNotification('warning', 'NEPO-Programmierfläche konnte nicht erstellt werden:','Es konnte kein geeignetes Roboter-System geladen werden. Laden Sie die Seite bitte neu und versuchen Sie es erneut.');
        return;
    }
    
    if (!document.getElementById('blocklyDiv')) {
        console.log('In order to make the connection between the configuration and program work, the program-workspace needs to be placed in a container with the id "blocklyDiv", which does not exist.');
        FraunhoferIAIS.Notification.showNotification('warning', 'NEPO-Programmierfläche konnte nicht erstellt werden:','Die Seite ist nicht korrekt aufgebaut worden. Laden Sie die Seite bitte neu und versuchen Sie es erneut.');
        return;
    }
    
    if (FraunhoferIAIS.Blockly.configuration === null) {
        FraunhoferIAIS.Blockly.initConfiguration();
    }
    
    var robotData = FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot],
        robotGroupName = FraunhoferIAIS.Blockly.getRobotGroupName(robotData.robot);
    
    FraunhoferIAIS.Blockly.programWorkspace = Blockly.inject('blocklyDiv', {
        comments: false,
        disable: true,
        collapse: false,
        grid: false,
        maxBlocks: Infinity,
        media: FraunhoferIAIS.Blockly.blocklyPath + '/media/',
        readOnly: false,
        rtl: false,
        scrollbars: true,
        toolbox: robotData.program.toolbox.expert,
        zoom: {
            controls: true,
            wheel: false,
            startScale: 1.0,
            maxScale: 4,
            minScale: .25,
            scaleSpeed: 1.1
        },
        checkInTask: [ 'start', '_def', 'event', '-Brick' ],
        variableDeclaration: true,
        robControls: true
    });

    FraunhoferIAIS.Blockly.programWorkspace.setDevice({
        group: robotGroupName,
        robot: robotData.robot
    });
    
    //You can not save in this editor
    FraunhoferIAIS.Blockly.programWorkspace.robControls.disable('saveProgram');
    FraunhoferIAIS.Blockly.programWorkspace.robControls.saveProgram.setAttribute("style", "display : none");
    FraunhoferIAIS.Blockly.programWorkspace.robControls.disable('runOnBrick');
    FraunhoferIAIS.Blockly.programWorkspace.robControls.runOnBrick.setAttribute("style", "display : none");
    
    FraunhoferIAIS.Blockly.setProgram(robotData.program.prog);
    
    FraunhoferIAIS.Blockly.programWorkspace.addChangeListener(function(event) {
        if (event.type !== Blockly.Events.UI && !FraunhoferIAIS.Blockly.programChanged) {
            FraunhoferIAIS.Blockly.programChanged = true
        }
    });
}


FraunhoferIAIS.Blockly.configurationWorkspace = FraunhoferIAIS.Blockly.configurationWorkspace || null;

FraunhoferIAIS.Blockly.setConfigurationWorkspace = function (configurationWorkspace) {
    FraunhoferIAIS.Blockly.configurationWorkspace = configurationWorkspace;
}

FraunhoferIAIS.Blockly.initConfigurationWorkspace = function() {
    if (!FraunhoferIAIS.Blockly.currentRobot || !FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot]) {
        console.log('In order to initialize the configuration-workspace, you have to load a robot system first by calling "FraunhoferIAIS.Blockly.replaceRobot(\'robotID\')"');
        FraunhoferIAIS.Notification.showNotification('warning', 'NEPO-Programmierfläche konnte nicht erstellt werden:','Es konnte kein geeignetes Roboter-System geladen werden. Laden Sie die Seite bitte neu und versuchen Sie es erneut.');
        return;
    }
    
    if (!document.getElementById('bricklyDiv')) {
        console.log('In order to make the connection between the configuration and program work, the configuration-workspace needs to be placed in a container with the id "bricklyDiv", which could not be found in the document.');
        FraunhoferIAIS.Notification.showNotification('warning', 'NEPO-Programmierfläche konnte nicht erstellt werden:','Die Seite ist nicht korrekt aufgebaut worden. Laden Sie die Seite bitte neu und versuchen Sie es erneut.');
        return;
    }

    var robotData = FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot],
        robotGroupName = FraunhoferIAIS.Blockly.getRobotGroupName(robotData.robot);

    FraunhoferIAIS.Blockly.configurationWorkspace = Blockly.inject(document.getElementById('bricklyDiv'), {
        path : FraunhoferIAIS.Blockly.blocklyPath + '/media/',
        comments: false,
        disable: true,
        toolbox : robotData.configuration.toolbox,
        trashcan : true,
        scrollbars : true,
        media : FraunhoferIAIS.Blockly.blocklyPath + '/media/',
        zoom : {
            controls : true,
            wheel : false,
            startScale : 1.0,
            maxScale : 4,
            minScale : .25,
            scaleSpeed : 1.1
        },
        checkInTask : [ 'start', '_def', 'event', '-Brick' ],
        variableDeclaration : true,
        robControls : true
    });
    

    FraunhoferIAIS.Blockly.configurationWorkspace.setDevice({
        group: robotGroupName,
        robot: robotData.robot
    });
    
    FraunhoferIAIS.Blockly.configurationWorkspace.setVersion('2.0');

    FraunhoferIAIS.Blockly.configurationWorkspace.robControls.disable('saveProgram');
    FraunhoferIAIS.Blockly.configurationWorkspace.robControls.saveProgram.setAttribute("style", "display : none");
    FraunhoferIAIS.Blockly.configurationWorkspace.robControls.disable('runOnBrick');
    FraunhoferIAIS.Blockly.configurationWorkspace.robControls.runOnBrick.setAttribute("style", "display : none");

    FraunhoferIAIS.Blockly.setConfiguration(robotData.configuration.default);

    FraunhoferIAIS.Blockly.configurationWorkspace.addChangeListener(function(event) {
        if (event.type !== Blockly.Events.UI) {
            if (!FraunhoferIAIS.Blockly.configurationChanged) {
                FraunhoferIAIS.Blockly.configurationChanged = true;
            }
            
            //If the configuration has changed, some blocks in the program might have changed as well.
            if (!FraunhoferIAIS.Blockly.programChanged) {
                FraunhoferIAIS.Blockly.programChanged = true;
            }
        }
    });
}


FraunhoferIAIS.Blockly.robotGroups = FraunhoferIAIS.Blockly.robotGroups || {};

FraunhoferIAIS.Blockly.initRobotGroups = function() {
    return new Promise(function(resolve, reject) {
        var ajaxRequest = new XMLHttpRequest(),
            adminEndpoint = 'https://lab.open-roberta.org/admin',
            postData = {
                data: {
                    cmd: 'init'
                }
            };
        
        ajaxRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                debugger;
                var serverData = JSON.parse(this.responseText);
                
                //Check for correct result
                
                for (var key in serverData.server.robots) {
                    if (!serverData.server.robots.hasOwnProperty(key) || !serverData.server.robots[key].group) {
                        continue;
                    }
                    FraunhoferIAIS.Blockly.robotGroups[serverData.server.robots[key].group] = FraunhoferIAIS.Blockly.robotGroups[serverData.server.robots[key].group] || {};
                    FraunhoferIAIS.Blockly.robotGroups[serverData.server.robots[key].group][serverData.server.robots[key].name] = serverData.server.robots[key];
                }
                
                resolve();
            } else if (this.readyState === 4 && this.status > 200) {
                debugger;
                reject();
            }
        }
        
        ajaxRequest.open('POST', adminEndpoint, true);
        ajaxRequest.setRequestHeader('Content-Type', 'application/json');
        ajaxRequest.setRequestHeader('Accept', 'application/json');
        ajaxRequest.overrideMimeType('application/json');
        ajaxRequest.send(JSON.stringify(postData));
    });
}

FraunhoferIAIS.Blockly.getDefaultRobotOfGroup = function(robotGroup) {
    if (!FraunhoferIAIS.Blockly.robotGroups || !FraunhoferIAIS.Blockly.robotGroups[robotGroup]) {
        console.log('The robot group ' + robotGroup + ' was not whitelisted by the server.');
        FraunhoferIAIS.Notification.showNotification('warning', 'Roboter-System konnte nicht geladen werden:','Das angegebene Roboter-System ist dem Server nicht bekannt.');
        return '';
    }
    
    for (var robotName in FraunhoferIAIS.Blockly.robotGroups[robotGroup]) {
        if (!FraunhoferIAIS.Blockly.robotGroups[robotGroup].hasOwnProperty(robotName)) {
            continue;
        }
        if (!FraunhoferIAIS.Blockly.robotGroups[robotGroup][robotName].beta) {
            return robotName;
        }
    }
    
    //All robots are in beta status. Return the first real robot.
    for (var robotName in FraunhoferIAIS.Blockly.robotGroups[robotGroup]) {
        if (!FraunhoferIAIS.Blockly.robotGroups[robotGroup].hasOwnProperty(robotName)) {
            continue;
        }
        return robotName;
    }
    
    //No robots
    return '';
}

FraunhoferIAIS.Blockly.getRobotGroupName = function(robotName) {
    for (var groupName in FraunhoferIAIS.Blockly.robotGroups) {
        if (!FraunhoferIAIS.Blockly.robotGroups.hasOwnProperty(groupName)) {
            continue;
        }
        
        if (FraunhoferIAIS.Blockly.robotGroups[groupName][robotName]) {
            return groupName;
        }
    }
}

FraunhoferIAIS.Blockly.getRobotListForFrontend = function() {
    var robots = [];
    
    if (!FraunhoferIAIS.Blockly.robotGroups) {
        FraunhoferIAIS.Blockly.initRobotGroups();
    }
    
    for(var group in FraunhoferIAIS.Blockly.robotGroups) {
        if (!FraunhoferIAIS.Blockly.robotGroups.hasOwnProperty(group)) {
            continue;
        }
        
        for (var robot in FraunhoferIAIS.Blockly.robotGroups[group]) {
            if (!FraunhoferIAIS.Blockly.robotGroups[group].hasOwnProperty(robot)) {
                continue;
            }
            robots.push({
                value: FraunhoferIAIS.Blockly.robotGroups[group][robot].name,
                textContent:FraunhoferIAIS.Blockly.robotGroups[group][robot].realName
            });
        }
    }
    return robots;
}

FraunhoferIAIS.Blockly.getRobotGroupListForFrontend = function() {
    var robotGroups = [],
        defaultGroupRobot = '';
    
    if (!FraunhoferIAIS.Blockly.robotGroups) {
        FraunhoferIAIS.Blockly.initRobotGroups();
    }
    
    for(var group in FraunhoferIAIS.Blockly.robotGroups) {
        if (!FraunhoferIAIS.Blockly.robotGroups.hasOwnProperty(group)) {
            continue;
        }
        
        defaultGroupRobot = FraunhoferIAIS.Blockly.getDefaultRobotOfGroup(group);
        if (currentRobot !== '') {
            robotGroups.push({
                value: group,
                textContent: FraunhoferIAIS.Blockly.robotGroups[group][defaultGroupRobot].realName
            });
        }
    }
    return robotGroups;
}


FraunhoferIAIS.Blockly.robotCache = FraunhoferIAIS.Blockly.robotCache || {};

FraunhoferIAIS.Blockly.currentRobot = FraunhoferIAIS.Blockly.currentRobot || '';

FraunhoferIAIS.Blockly.loadRobot = function (robotIdentifier) {
    if (!robotIdentifier) {
        console.log('FraunhoferIAIS.Blockly.loadRobot was called without providing a valid robot identifier.')
        FraunhoferIAIS.Notification.showNotification('warning', 'Roboter-System konnte nicht geladen werden:','Es wurde versucht ein Robotersystem zu laden, ohne eines anzugeben.');
        return Promise.reject(robotIdentifier);
    }

    if (FraunhoferIAIS.Blockly.robotCache[robotIdentifier]) {
        return Promise.resolve(FraunhoferIAIS.Blockly.robotCache[robotIdentifier]);
    }
    
    return new Promise(function(resolve, reject) {
        var ajaxRequest = new XMLHttpRequest(),
            adminEndpoint = 'https://lab.open-roberta.org/admin',
            postData = {
                data: {
                    cmd: 'setRobot',
                    robot: robotIdentifier
                }
            };
        
        ajaxRequest.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                debugger;
                var robotData = JSON.parse(this.responseText);
                FraunhoferIAIS.Blockly.robotCache[robotIdentifier] = robotData;
                resolve(robotData);
            } else if (this.readyState === 4 && this.status > 200) {
                debugger;
                reject(new Error('Das Roboter-System "' + robotIdentifier + '" konnte nicht geladen werden.'));
            }
        }
        
        ajaxRequest.open('POST', adminEndpoint, true);
        ajaxRequest.setRequestHeader('Content-Type', 'application/json');
        ajaxRequest.setRequestHeader('Accept', 'application/json');
        ajaxRequest.overrideMimeType('application/json');
        ajaxRequest.send(JSON.stringify(postData));
    });
}

FraunhoferIAIS.Blockly.replaceRobot = function(robotName, strict) {
    if (!strict && robotName === FraunhoferIAIS.Blockly.currentRobot) {
        return Promise.resolve();
    }
    
    var robotDataPromise = FraunhoferIAIS.Blockly.loadRobot(robotName);
    
    return robotDataPromise.then(function(data) {
            var robotGroupName = FraunhoferIAIS.Blockly.getRobotGroupName(robotName);

            FraunhoferIAIS.Blockly.currentRobot = robotName;
            if (FraunhoferIAIS.Blockly.configurationWorkspace !== null) {
                FraunhoferIAIS.Blockly.configurationWorkspace.updateToolbox(data.configuration.toolbox);
                FraunhoferIAIS.Blockly.configurationWorkspace.setDevice({
                    group: robotGroupName,
                    robot: robotName
                });
            }
            
            if (FraunhoferIAIS.Blockly.programWorkspace !== null) {
                FraunhoferIAIS.Blockly.programWorkspace.updateToolbox(data.program.toolbox.expert);
                FraunhoferIAIS.Blockly.programWorkspace.setDevice({
                    group: robotGroupName,
                    robot: robotName
                });
            }
            

            if (FraunhoferIAIS.Blockly.configurationWorkspace !== null) {
                FraunhoferIAIS.Blockly.setConfiguration(data.configuration.default);
            }
            if (FraunhoferIAIS.Blockly.programWorkspace !== null) {
                FraunhoferIAIS.Blockly.setProgram(data.program.prog);
            }

        }).catch(function(error) {
            FraunhoferIAIS.Notification.showNotification('warning', 'Roboter-System konnte nicht geladen werden:',error.message);
        });
}

FraunhoferIAIS.Blockly.getCurrentProgramToolbox = function (toolBoxIdentifier = '') {
    if (!FraunhoferIAIS.Blockly.currentRobot 
        || !FraunhoferIAIS.Blockly.robotCache 
        || !FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot]) {
        return null;
    }
    
    //Set expert as default
    if (toolBoxIdentifier !== 'beginner') {
        toolBoxIdentifier = 'expert';
    }
    
    return FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox[toolBoxIdentifier];
}

FraunhoferIAIS.Blockly.getCurrentConfigurationToolbox = function () {
    if (!FraunhoferIAIS.Blockly.currentRobot 
        || !FraunhoferIAIS.Blockly.robotCache 
        || !FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot]) {
        return null;
    }
    return FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].configuration.toolbox;
}

FraunhoferIAIS.Blockly.languageCache = FraunhoferIAIS.Blockly.languageCache || {};

FraunhoferIAIS.Blockly.currentLanguage = FraunhoferIAIS.Blockly.currentLanguage || {};

FraunhoferIAIS.Blockly.replaceLanguage = function(languageIdentifier, strict) {
    languageIdentifier = languageIdentifier.toLowerCase();
    
    if (!strict && !!FraunhoferIAIS.Blockly.currentLanguage && languageIdentifier === FraunhoferIAIS.Blockly.currentLanguage) {
        return;
    }
    
    var languageDataPromise = FraunhoferIAIS.Blockly.loadLanguage(languageIdentifier);
    var robotDataPromise = Promise.resolve(null);

    if (FraunhoferIAIS.Blockly.currentRobot != '') {
        robotDataPromise = FraunhoferIAIS.Blockly.loadRobot(FraunhoferIAIS.Blockly.currentRobot);
    }
    
    return Promise.all([languageDataPromise, robotDataPromise]).then(function(data) {
        FraunhoferIAIS.Blockly.currentLanguage = languageIdentifier;
        if (FraunhoferIAIS.Blockly.programWorkspace !== null) {
            FraunhoferIAIS.Blockly.reloadProgram();
            FraunhoferIAIS.Blockly.programWorkspace.updateToolbox(data[1].program.toolbox.expert);
        }
        if (FraunhoferIAIS.Blockly.configurationWorkspace !== null) {
            FraunhoferIAIS.Blockly.reloadConfiguration();
            FraunhoferIAIS.Blockly.configurationWorkspace.updateToolbox(data[1].configuration.toolbox);
        }
    }).catch(function(error) {
        FraunhoferIAIS.Notification.showNotification('warning', 'Sprache konnte nicht geladen werden:',error.message);
    });
}

FraunhoferIAIS.Blockly.loadLanguage = function(languageIdentifier) {
    if (!languageIdentifier) {
        console.log('FraunhoferIAIS.Blockly.loadLanguage was called without providing a valid language identifier.')
        FraunhoferIAIS.Notification.showNotification('warning', 'Sprache konnte nicht geladen werden:', 'Es wurde versucht eine Sprache zu laden, ohne den Namen der Sprache anzugeben.');
        return Promise.reject(languageIdentifier);
    }
    
    languageIdentifier = languageIdentifier.toLowerCase();

    if (FraunhoferIAIS.Blockly.languageCache[languageIdentifier]) {
        Blockly.Msg = JSON.parse(FraunhoferIAIS.Blockly.languageCache[languageIdentifier]);
        return Promise.resolve(languageIdentifier);
    }
    
    return new Promise(function(resolve, reject) {
        var scriptTag = document.createElement('script');
        
        scriptTag.setAttribute('type', 'text/javascript');
        scriptTag.setAttribute('src', FraunhoferIAIS.Blockly.blocklyPath + '/msg/js/' + languageIdentifier + '.js');
        scriptTag.onload = function() {
            FraunhoferIAIS.Blockly.languageCache[languageIdentifier] = JSON.stringify(Blockly.Msg);
            resolve();
        };
        scriptTag.onerror = reject;
        
        document.head.appendChild(scriptTag);
    });
}

FraunhoferIAIS.Blockly.currentProgram = FraunhoferIAIS.Blockly.currentProgram || null;
FraunhoferIAIS.Blockly.programChanged = FraunhoferIAIS.Blockly.programChanged || false;

FraunhoferIAIS.Blockly.clearProgramWorkspace = function () {
    if (FraunhoferIAIS.Blockly.programWorkspace) {
        FraunhoferIAIS.Blockly.programWorkspace.clear();
    }

    FraunhoferIAIS.Blockly.currentProgram = null;
    FraunhoferIAIS.Blockly.programChanged = false;
}

FraunhoferIAIS.Blockly.setProgram = function(programXmlString) {
    
    try {
        var program = Blockly.Xml.textToDom(programXmlString);
    } catch (error) {
        FraunhoferIAIS.Notification.showNotification('warning', 'Programm konnte nicht geladen werden:', 'Das angegebene Programm enthält in seiner XML-Struktur Syntax-Fehler und kann daher nicht geladen werden.');
        return;
    }
    
    if (FraunhoferIAIS.Blockly.programWorkspace) {
        FraunhoferIAIS.Blockly.clearProgramWorkspace();
        Blockly.Xml.domToWorkspace(program, FraunhoferIAIS.Blockly.programWorkspace);
    }
    
    FraunhoferIAIS.Blockly.currentProgram = programXmlString;
    FraunhoferIAIS.Blockly.programChanged = false;
}

FraunhoferIAIS.Blockly.reloadProgram = function() {
    if (!FraunhoferIAIS.Blockly.programWorkspace) {
        return;
    }

    var programXmlString = FraunhoferIAIS.Blockly.currentProgram;

    FraunhoferIAIS.Blockly.clearProgramWorkspace();
    
    if (programXmlString !== null) {
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(programXmlString), FraunhoferIAIS.Blockly.programWorkspace);
        FraunhoferIAIS.Blockly.currentProgram = programXmlString;
    }

    FraunhoferIAIS.Blockly.programChanged = false;
}

FraunhoferIAIS.Blockly.saveProgramAsCurrent = function() {
    if (FraunhoferIAIS.Blockly.programChanged) {
        FraunhoferIAIS.Blockly.currentProgram = FraunhoferIAIS.Blockly.programWorkspace ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(FraunhoferIAIS.Blockly.programWorkspace)) : null;
        FraunhoferIAIS.Blockly.programChanged = false;
    }
}

FraunhoferIAIS.Blockly.currentConfiguration = FraunhoferIAIS.Blockly.currentConfiguration || null;
FraunhoferIAIS.Blockly.configurationChanged = FraunhoferIAIS.Blockly.configurationChanged || false;

FraunhoferIAIS.Blockly.clearConfigurationWorkspace = function() {
    if (FraunhoferIAIS.Blockly.configurationWorkspace) {
        FraunhoferIAIS.Blockly.configurationWorkspace.clear();
    }
    
    FraunhoferIAIS.Blockly.currentConfiguration = null;
    FraunhoferIAIS.Blockly.configurationChanged = false;
}

FraunhoferIAIS.Blockly.setConfiguration = function (configurationXmlString) {
    
    try {
        var configuration = Blockly.Xml.textToDom(configurationXmlString);
    } catch (error) {
        //Show that setting the configuration was not possible, because it is malformed
        FraunhoferIAIS.Notification.showNotification('warning', 'Roboter-Konfiguration konnte nicht geladen werden:', 'Die angegebene Roboter-Konfiguration enthält in ihrer XML-Struktur Syntax-Fehler und kann daher nicht geladen werden.');
        return;
    }
    
    if (FraunhoferIAIS.Blockly.configurationWorkspace) {
        FraunhoferIAIS.Blockly.clearConfigurationWorkspace();
        Blockly.Xml.domToWorkspace(configuration, FraunhoferIAIS.Blockly.configurationWorkspace);
    }

    FraunhoferIAIS.Blockly.currentConfiguration = configurationXmlString;
    FraunhoferIAIS.Blockly.configurationChanged = false;
}

FraunhoferIAIS.Blockly.reloadConfiguration = function() {
    if (!FraunhoferIAIS.Blockly.configurationWorkspace) {
        return;
    }

    var configurationXmlString = FraunhoferIAIS.Blockly.currentConfiguration;

    FraunhoferIAIS.Blockly.clearConfigurationWorkspace();
    
    if (configuration !== null) {
        Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(configurationXmlString), FraunhoferIAIS.Blockly.configurationWorkspace);
        FraunhoferIAIS.Blockly.currentConfiguration = configurationXmlString;
    }
    
    FraunhoferIAIS.Blockly.configurationChanged = false;
}

FraunhoferIAIS.Blockly.saveConfigurationAsCurrent = function() {
    if (FraunhoferIAIS.Blockly.configurationChanged) {
        FraunhoferIAIS.Blockly.currentConfiguration = FraunhoferIAIS.Blockly.configurationWorkspace ? Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(FraunhoferIAIS.Blockly.configurationWorkspace)) : null;
        FraunhoferIAIS.Blockly.configurationChanged = false;
    }
}

FraunhoferIAIS.Blockly.checkLabExport = function (labExportFileContent, allowRobotChange) {
    var xmlParser = new DOMParser(),
        importedXml = xmlParser.parseFromString(labExportFileContent, 'text/xml'),
        robot,
        program,
        configuration;
    
    //type safe check to set a default value
    allowRobotChange = allowRobotChange === true;
    
    if (!importedXml || importedXml.documentElement.tagName.toLowerCase() === 'parsererror') {
        return Promise.reject(new Error('Die angegebene XML-Datei enthält XML-Syntax-Fehler und kann daher nicht geladen werden.'));
    }
    
    if (importedXml.documentElement.getAttribute('xmlns') !== 'http://de.fhg.iais.roberta.blockly') {
        return Promise.reject(new Error('Die angegebene XML-Datei ist in einem unbekannten Format verfasst und kann daher nicht interpretiert werden.'));
    }
    
    program = importedXml.documentElement.querySelector('export > program > block_set');
    configuration = importedXml.documentElement.querySelector('export > config > block_set');
    
    if (!program || !configuration) {
        return Promise.reject(new Error('Das Programm konnte aus der angegebenen XML-Datei nicht ausgelesen werden.'));
    }
    
    if (program.getAttribute('robottype') !== configuration.getAttribute('robottype')) {
        return Promise.reject(new Error('Die XML-Datei enthält semantische Fehler und wurde daher nicht geladen.'));
    }
    
    robot = FraunhoferIAIS.Blockly.getDefaultRobotOfGroup(program.getAttribute('robottype'));
    
    if (!robot) {
        return Promise.reject(new Error('Das in der Datei angegebene Robotersystem wurde nicht erkannt. Das Programm kann daher nicht geladen werden.'));
    }
    
    if (!allowRobotChange) {
        var currentRobotGroup = FraunhoferIAIS.Blockly.getRobotGroupName(FraunhoferIAIS.Blockly.currentRobot);
        if (currentRobotGroup !== program.getAttribute('robottype')) {
            return Promise.reject(new Error('Das in der Datei enthaltene Programm wurde für ein anderes Robotersystem erstellt und wurde daher nicht geladen.'));
        }
        robot = FraunhoferIAIS.Blockly.currentRobot;
    }
    
    return Promise.resolve();
}

FraunhoferIAIS.Blockly.importFromLab = function (labExportFileContent, changeRobot) {
    var xmlParser = new DOMParser(),
        importedXml = xmlParser.parseFromString(labExportFileContent, 'text/xml'),
        robot,
        program,
        configuration;
    
    //type safe check to set a default value
    if (changeRobot !== false) {
        changeRobot = true;
    }
    
    if (!importedXml || importedXml.documentElement.tagName.toLowerCase() === 'parsererror') {
        return Promise.reject(new Error('Die angegebene XML-Datei enthält XML-Syntax-Fehler und kann daher nicht geladen werden.'));
    }
    
    if (importedXml.documentElement.getAttribute('xmlns') !== 'http://de.fhg.iais.roberta.blockly') {
        return Promise.reject(new Error('Die angegebene XML-Datei ist in einem unbekannten Format verfasst und kann daher nicht interpretiert werden.'));
    }
    
    program = importedXml.documentElement.querySelector('export > program > block_set');
    configuration = importedXml.documentElement.querySelector('export > config > block_set');
    
    if (!program || !configuration) {
        return Promise.reject(new Error('Das Programm konnte aus der angegebenen XML-Datei nicht ausgelesen werden.'));
    }
    
    if (program.getAttribute('robottype') !== configuration.getAttribute('robottype')) {
        return Promise.reject(new Error('Das in der XML-Datei angegebene Programm ist für einen anderen Roboter geschrieben worden als für die enbenfalls enthaltene Roboter-Konfiguration.'));
    }
    
    robot = FraunhoferIAIS.Blockly.getDefaultRobotOfGroup(program.getAttribute('robottype'));
    
    if (!robot) {
        return Promise.reject(new Error('Das in der Datei angegebene Robotersystem wurde nicht erkannt. Das Programm kann daher nicht geladen werden.'));
    }
    
    if (!changeRobot) {
        var currentRobotGroup = FraunhoferIAIS.Blockly.getRobotGroupName(FraunhoferIAIS.Blockly.currentRobot);
        if (currentRobotGroup !== program.getAttribute('robottype')) {
            return Promise.reject(new Error('Das in der Datei enthaltene Programm wurde für ein anderes Robotersystem erstellt und wurde daher nicht importiert.'));
        }
        robot = FraunhoferIAIS.Blockly.currentRobot;
    }

    return FraunhoferIAIS.Blockly.replaceRobot(robot).then(function() {
        var configurationStartBlocks = configuration.querySelectorAll('instance'),
            topLeftConfigBlock = Array.prototype.slice.call(configurationStartBlocks).reduce(function(minimum, currentInstance){
                var x = parseFloat(currentInstance.getAttribute('x') || 0),
                    y = parseFloat(currentInstance.getAttribute('y') || 0),
                    minX = parseFloat(minimum.getAttribute('x') || 0),
                    minY = parseFloat(minimum.getAttribute('y') || 0);
                if (Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5) < Math.pow((Math.pow(minX, 2) + Math.pow(minY, 2)), 0.5)) {
                    return currentInstance;
                }
                return minimum;
            }, configurationStartBlocks[0]),
            configurationOffset = {
                x : parseFloat(topLeftConfigBlock.getAttribute('x') || 0), 
                y : parseFloat(topLeftConfigBlock.getAttribute('y') || 0)
            },
            programStartBlocks = program.querySelectorAll('instance'),
            topLeftProgramBlock = Array.prototype.slice.call(programStartBlocks).reduce(function(minimum, currentInstance){
                var x = parseFloat(currentInstance.getAttribute('x') || 0),
                    y = parseFloat(currentInstance.getAttribute('y') || 0),
                    minX = parseFloat(minimum.getAttribute('x') || 0),
                    minY = parseFloat(minimum.getAttribute('y') || 0);
                if (Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5) < Math.pow((Math.pow(minX, 2) + Math.pow(minY, 2)), 0.5)) {
                    return currentInstance;
                }
                return minimum;
            }, programStartBlocks[0]),
            programOffset = {
                x : parseFloat(topLeftProgramBlock.getAttribute('x') || 0), 
                y : parseFloat(topLeftProgramBlock.getAttribute('y') || 0)
            };
        
        if (FraunhoferIAIS.Blockly.programWorkspace === null) {
            FraunhoferIAIS.Blockly.initProgramWorkspace();
        }
        
        if (FraunhoferIAIS.Blockly.configurationWorkspace === null) {
            FraunhoferIAIS.Blockly.initConfigurationWorkspace();
        }
        
        FraunhoferIAIS.Blockly.setConfiguration(configuration.outerHTML || new XMLSerializer().serializeToString(program));
        FraunhoferIAIS.Blockly.setProgram(program.outerHTML || new XMLSerializer().serializeToString(program));
        
        if (!isNaN(FraunhoferIAIS.Blockly.configurationWorkspace.scrollX) && !isNaN(FraunhoferIAIS.Blockly.configurationWorkspace.scrollY)) {
            FraunhoferIAIS.Blockly.configurationWorkspace.resize();
            FraunhoferIAIS.Blockly.configurationWorkspace.scrollbar.set(0, 0);
            FraunhoferIAIS.Blockly.configurationWorkspace.scrollbar.set(
                    FraunhoferIAIS.Blockly.configurationWorkspace.scrollX + configurationOffset.x - 15, 
                    FraunhoferIAIS.Blockly.configurationWorkspace.scrollY + configurationOffset.y - 15
            );
        } else {
            FraunhoferIAIS.Blockly.configurationWorkspace.scrollX = 15 - configurationOffset.x;
            FraunhoferIAIS.Blockly.configurationWorkspace.scrollY = 15 - configurationOffset.y;
        }
        
        if (!isNaN(FraunhoferIAIS.Blockly.programWorkspace.scrollX) && !isNaN(FraunhoferIAIS.Blockly.programWorkspace.scrollY)) {
            FraunhoferIAIS.Blockly.programWorkspace.resize();
            FraunhoferIAIS.Blockly.programWorkspace.scrollbar.set(0, 0);
            FraunhoferIAIS.Blockly.programWorkspace.scrollbar.set(
                    FraunhoferIAIS.Blockly.programWorkspace.scrollX + programOffset.x - 15, 
                    FraunhoferIAIS.Blockly.programWorkspace.scrollY + programOffset.y - 15
            );
        } else {
            FraunhoferIAIS.Blockly.programWorkspace.scrollX = 15 - programOffset.x;
            FraunhoferIAIS.Blockly.programWorkspace.scrollY = 15 - programOffset.y;
        }
    });
}

FraunhoferIAIS.Blockly.exportForLab = function () {
    console.log('FraunhoferIAIS.Blockly.exportForLab is currently not implemented.');
    FraunhoferIAIS.Notification.showNotification('warning', 'Export-Datei kann nicht erstellt werden.', 'Diese Funktion wird aktuell nicht unterstützt');
    return '';
}