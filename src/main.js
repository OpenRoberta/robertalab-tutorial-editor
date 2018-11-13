
var workspace = null,
    configuration = null,
    defaultStep = {
        header: '',
        tip: '',
        instruction: '',
        toolbox: null,
        maxBlocks: null,
        solution: null,
        program: null,
        quiz: []
    },
    tutorial = {
        name: '',
        robot: 'ev3',
        language: 'DE',
        step : [
            JSON.parse(JSON.stringify(defaultStep))
        ]
    },
    robots = {
        ev3: {
            groupName: 'LEGO Mindstorms EV3',
            project: 'RobotEV3',
            filename: 'ev3lejosv1'
        },
        nxt: {
            groupName: 'LEGO Mindstorms NXT',
            project: 'RobotNXT',
            filename: 'nxt'
        },
        /*
        wedo: {
            groupName: 'LEGO Education WeDo 2.0',
            project: 'RobotWeDo',
            filename: 'wedo'
        },
        arduino: {
            groupName: 'NEPO4Arduino',
            project: 'RobotArdu',
            filename: 'nano'
        },
        */
        calliope: {
            groupName: 'Calliope Mini',
            project: 'RobotMbed',
            filename: 'calliope2017'
        },
        nao: {
            groupName: 'NAO',
            project: 'RobotNAO',
            filename: 'nao'
        },
        microbit: {
            groupName: 'micro:bit',
            project: 'RobotMbed',
            filename: 'microbit'
        },
        bob3: {
            groupName: 'BOB3',
            project: 'RobotArdu',
            filename: 'bob3'
        },
        botnroll: {
            groupName: 'Bot\'n Roll',
            project: 'RobotArdu',
            filename: 'botnroll'
        },
        mbot: {
            groupName: 'Mbot',
            project: 'RobotArdu',
            filename: 'mbot'
        },
        vorwerk: {
            groupName: 'Vorwerk',
            project: 'RobotVorwerk',
            filename: 'vorwerk'
        },
    },
    currentStep = null,
    emptyQuestion = {
        question: '',
        answer: ['']
    },
    refreshing = false,
    templates = {};

window.onload = function () {
    loadRobotData();
    loadTemplates();
    initBlockly();
    initSettings();
    initGlobalEvents();
    loadStep(0);
}

function loadTemplates() {
    var templateContainer = document.getElementById('templates');
    
    while(templateContainer.childNodes.length > 0) {
        if (templateContainer.firstChild.nodeType === 1 && templateContainer.firstChild.classList.item(0)) {
            templates[templateContainer.firstChild.classList.item(0)] = templateContainer.firstChild;
        }
        templateContainer.removeChild(templateContainer.firstChild);
    }
    
    templateContainer.parentNode.removeChild(templateContainer);
}

function getTemplate(key) {
    return templates[key] ? templates[key].cloneNode(true) : document.createElement('div');
}

function initSettings() {
    var robotSelection = document.getElementById('tutorial-robot');
    
    for (var robotName in robots) {
        if (!robots.hasOwnProperty(robotName)) {
            continue;
        }
        var option = document.createElement('option');
        option.value = robotName;
        option.textContent = robots[robotName].groupName;
        if (tutorial.robot === robotName) {
            option.selected = true;
        }
        robotSelection.append(option);
    }
}

function initGlobalEvents() {
    var toggles = document.querySelectorAll('button.toggle');
    for(var i = 0; i < toggles.length; i++) {
        toggles[i].addEventListener('click', function(evt) {
            evt.preventDefault();
            if (this.dataset.target) {
                var target = document.getElementById(this.dataset.target);
                if (target) {
                    if (target.style.display !== 'none') {
                        target.style.display = 'none';
                    } else {
                        target.style.display = '';
                    }
                }
            }
        });
        if (toggles[i].dataset.initial === 'none') {
            document.getElementById(toggles[i].dataset.target).style.display = 'none';
        }
    }
    
    var closeButtons = document.querySelectorAll('button.close');
    for(var i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function(evt) {
            evt.preventDefault();
            this.parentElement.style.display = 'none';
        });
    }
    
    CKEDITOR.on('instanceCreated', function(event) {
        event.editor.on('change', function () {
            var textarea = document.getElementById(event.editor.name),
                changeEvent = new Event('change');
            textarea.value = event.editor.getData();
            textarea.dispatchEvent(changeEvent);
        });
    });
    
    CKEDITOR.replaceAll('rich-text-edit');
    
    var formFields = document.querySelectorAll('input, select, textarea');
    
    for (var i = 0; i < formFields.length; i++) {
        formFields[i].addEventListener('change', handleSettingsChange);
    }
    
    var downloadButton = document.getElementById('download');
    downloadButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        persistCurrentProgramInStep(currentStep);
        var downloadElement = document.createElement('a');
        downloadElement.href= 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tutorial, null, 4));
        downloadElement.setAttribute('download', 'tutorial.json');
        downloadElement.style.display = 'none';
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
    });
    
    var uploadInput = document.getElementById('upload');
    uploadInput.removeEventListener('change', handleSettingsChange);
    uploadInput.addEventListener('change', function(evt) {
        evt.preventDefault();
        if (this.files.length > 0) {
            var file = this.files[0];
            if (file.type !== 'application/json') {
                return;
            }
            var fileReader = new FileReader();
            fileReader.onload = function(evt) {
                if (evt.target.result.trim() !== '') {
                    tutorial = JSON.parse(evt.target.result);
                    currentStep = null;
                    loadStep(0);
                }
            }
            fileReader.readAsText(file);
        }
    });

    var addQuestionButton = document.getElementById('step-quiz-add-question');
    addQuestionButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        var newQuestion = JSON.parse(JSON.stringify(emptyQuestion));
        currentStep.quiz.push(newQuestion);
        refreshQuizForm();
    });

    var injectStepBefore = document.getElementById('inject-step-before');
    injectStepBefore.addEventListener('click', function(evt) {
        evt.preventDefault();
        injectStep(tutorial.step.indexOf(currentStep), true);
    });

    var injectStepAfter = document.getElementById('inject-step-after');
    injectStepAfter.addEventListener('click', function(evt) {
        evt.preventDefault();
        injectStep(tutorial.step.indexOf(currentStep), false);
    });

    var removeStep = document.getElementById('remove-step-button');
    removeStep.addEventListener('click', function(evt) {
        evt.preventDefault();
        if (tutorial.step.length < 2) {
            return;
        }
        
        var currentStepIndex = tutorial.step.indexOf(currentStep),
            popup = getTemplate('double-opt-popup');
        
        popup.querySelector('.double-opt-header').textContent = 'Soll Schritt ' + (currentStepIndex + 1) + ' wirklich gelöscht werden?';
        popup.querySelector('.double-opt-info').textContent = 'Indem Sie diesen Schritt löschen werden alle damit verbundenen Daten unwideruflich gelöscht. Nur das Laden eines vorherigen Stands kann dies wieder korrigieren.';
        popup.querySelector('.double-opt-accept').addEventListener('click', function (evt) {
            evt.preventDefault();
            document.body.removeChild(popup);
            if (currentStepIndex === 0) {
                loadStep(1);
            } else {
                loadStep(currentStepIndex - 1);
            }
            tutorial.step.splice(currentStepIndex, 1);

            refreshStepNavigation();
        });
        popup.querySelector('.double-opt-deny').addEventListener('click', function (evt) {
            evt.preventDefault();
            document.body.removeChild(popup);
        });
        
        document.body.appendChild(popup);
    });

    var stepSettingsGeneralToggle = document.getElementById('view-step-general');
    stepSettingsGeneralToggle.addEventListener('click', function(evt) {
        evt.preventDefault();
        document.getElementById('step-general').classList.add('visible');
        document.getElementById('view-step-general').classList.add('active');
        document.getElementById('step-quiz').classList.remove('visible');
        document.getElementById('view-step-quiz').classList.remove('active');
    });

    var stepSettingsQuizToggle = document.getElementById('view-step-quiz');
    stepSettingsQuizToggle.addEventListener('click', function(evt) {
        evt.preventDefault();
        document.getElementById('step-general').classList.remove('visible');
        document.getElementById('view-step-general').classList.remove('active');
        document.getElementById('step-quiz').classList.add('visible');
        document.getElementById('view-step-quiz').classList.add('active');
    });

    var robotSelection = document.getElementById('tutorial-robot');
    robotSelection.removeEventListener('change', handleSettingsChange);
    robotSelection.addEventListener('change', function(evt){
        evt.preventDefault();
        
        if (tutorial.robot === robotSelection.value) {
            return;
        }
        
        tutorial.robot = robotSelection.value;
        
        if (!robots[tutorial.robot].toolbox) {
            loadRobotData();
        }

        if (workspace !== null) {
            if (configuration !== null) {
                configuration.updateToolbox(robots[tutorial.robot].configurationToolbox);
                workspace.setDevice({
                    group : tutorial.robot
                });
                workspace.clear();
                Blockly.Xml.domToWorkspace(robots[tutorial.robot].configuration, configuration);
            }
            workspace.updateToolbox(robots[tutorial.robot].toolbox);
            workspace.setDevice({
                group : tutorial.robot
            });
            workspace.clear();
            Blockly.Xml.domToWorkspace(robots[tutorial.robot].program, workspace);
        }
    });
}

function initBlockly() {
    initBrickly();
    workspace = Blockly.inject('workspace', {
        comments: true,
        disable: true,
        collapse: false,
        grid: false,
        maxBlocks: Infinity,
        media: './../robertalab/OpenRobertaParent/OpenRobertaServer/staticResources/blockly/media/',
        readOnly: false,
        rtl: false,
        scrollbars: true,
        toolbox: robots[tutorial.robot].toolbox,
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0,
            maxScale: 4,
            minScale: .25,
            scaleSpeed: 1.1
        },
        checkInTask: ['start', '_def', 'event', '-Brick'],
        variableDeclaration: true,
        robControls: true
    });
    workspace.setDevice({
        group : tutorial.robot
    });

    Blockly.Xml.domToWorkspace(robots[tutorial.robot].program, workspace);
}

function initBrickly() {
    configuration = Blockly.inject(document.getElementById('bricklyDiv'), {
        path : './../robertalab/OpenRobertaParent/OpenRobertaServer/staticResources/blockly/',
        toolbox : robots[tutorial.robot].configurationToolbox,
        trashcan : true,
        scrollbars : true,
        media : './../robertalab/OpenRobertaParent/OpenRobertaServer/staticResources/blockly/media/',
        zoom : {
            controls : true,
            wheel : false,
            startScale : 1.0,
            maxScale : 4,
            minScale : .25,
            scaleSpeed : 1.1
        },
        checkInTask : [ '-Brick', 'robConf' ],
        variableDeclaration : true,
        robControls : true
    });
    
    configuration.setDevice({
        group : tutorial.robot
    });
    configuration.setVersion('2.0');
    
    // Configurations can't be executed
    configuration.robControls.runOnBrick.setAttribute("style", "display : none");
    configuration.robControls.disable('saveProgram');
    
    Blockly.Xml.domToWorkspace(robots[tutorial.robot].configuration, configuration);
}

function loadRobotData() {
    
    if (!tutorial.robot || !robots[tutorial.robot]) {
        return;
    }
    
    var ajaxRequest = new XMLHttpRequest(),
        relativePropertiesFilePath = window.location.href.slice(0, -10) + 'robertalab/OpenRobertaParent/' + robots[tutorial.robot].project + '/src/main/resources/' + robots[tutorial.robot].filename + '.properties';
    
    ajaxRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200 && this.responseText !== '') {
            var lines = this.responseText.split("\n");
            for (var i = 0; i < lines.length; i++) {
                if (lines[i] === '' || lines[i].indexOf('#') === 0 || lines[i].indexOf('=') === -1) {
                    continue;
                }
                
                var lineParts = lines[i].match(/^\s*([^\=\s]+)\s*\=\s*(.+)\s*$/);
                
                if (lineParts[1] === 'robot.program.toolbox.expert') {
                    robots[tutorial.robot].toolbox = lineParts[2];
                } else if (lineParts[1] === 'robot.program.default') {
                    try {
                        robots[tutorial.robot].program = Blockly.Xml.textToDom(lineParts[2]);
                    } catch (error) {
                        //Ignore program
                    }
                } else if (lineParts[1] === 'robot.configuration.default') {
                    try {
                        robots[tutorial.robot].configuration = Blockly.Xml.textToDom(lineParts[2]);
                    } catch (error) {
                        //Ignore program
                    }
                } else if (lineParts[1] === 'robot.configuration.toolbox') {
                    robots[tutorial.robot].configurationToolbox = lineParts[2];
                }
            }
        }
    }
    
    ajaxRequest.open('GET', relativePropertiesFilePath, false);
    ajaxRequest.overrideMimeType('text/plain');
    ajaxRequest.send();
}

/* Step settings handling functions */
function refreshStepNavigation() {
    var stepNavigation = document.getElementById('step-navigation');

    //First remove all steps
    while(stepNavigation.firstChild.id != 'step-menu') {
        stepNavigation.removeChild(stepNavigation.firstChild);
    }
    
    for(var i = 0; i < tutorial.step.length; i++) {
        addStepNavigationButton(i);
    }
    
    if (currentStep === null || tutorial.step.indexOf(currentStep) === -1) {
        if (tutorial.step.length === 0) {
            addStep();
        }
        currentStep = tutorial.step[0];
    }
    
    document.getElementById('step-menu').style['margin-left'] = stepNavigation.children[tutorial.step.indexOf(currentStep)].offsetLeft + 'px';
}

function addStepNavigationButton(stepIndex) {
    var container = document.getElementById('step-navigation'),
        stepMenu = container.querySelector('#step-menu'),
        stepButton = getTemplate('step-button'),
        currentIndex = tutorial.step.indexOf(currentStep);
    
    stepButton.textContent = stepIndex + 1;
    if (currentIndex === stepIndex) {
        stepButton.classList.add('active');
    }
    
    stepButton.addEventListener('click', function (evt) {
        evt.preventDefault();
        loadStep(stepIndex);
    });
    
    container.insertBefore(stepButton, stepMenu);
}

function addStep(stepData) {
    var newIndex = tutorial.step.length;
    tutorial.step.push(stepData || JSON.parse(JSON.stringify(defaultStep)));
    loadStep(newIndex);
}

/**
 * 
 * @param stepIndex The index of the step from which this function is called
 * @param before Whether the new step shall be injected before or after the step defined in the first parameter
 * @returns
 */
function injectStep(stepIndex, before) {
    if (!before) {
        stepIndex++;
    }
    
    if (stepIndex >= tutorial.step.length) {
        addStep();
    } else {
        tutorial.step.splice(stepIndex, 0, JSON.parse(JSON.stringify(defaultStep)));
        refreshStepNavigation();
        loadStep(stepIndex);
    }
}

function loadStep(stepIndex) {
    if (stepIndex >= tutorial.step.length) {
        stepIndex = tutorial.step.length - 1;
    }
    
    if (tutorial.step[stepIndex] === currentStep) {
        return;
    }
    
    if (currentStep !== null) {
        persistCurrentProgramInStep(currentStep);
    }
    
    currentStep = tutorial.step[stepIndex];
    
    loadProgramOfStep(currentStep);

    refreshStepView();
}

function persistCurrentProgramInStep(step) {
     var xml = Blockly.Xml.workspaceToDom(workspace);
     step.program = Blockly.Xml.domToText(xml);
     
     if (step.solution) {
         workspace.cleanUp_();
         var rootBlocks = workspace.getTopBlocks().filter(function(svg) {
                 return svg.inTask;
             }),
             svgImage = rootBlocks.map(function (svgImage) {
                 return svgImage.svgGroup_.outerHTML;
             }).join(''),
             height = Math.max(... rootBlocks.map(function(rootBlock){
                 return rootBlock.height + rootBlock.xy_.y;
             })),
             width = Math.max(... rootBlocks.map(function(rootBlock){
                 return rootBlock.width + rootBlock.xy_.x;
             })),
             svg = document.createElement('svg');
         
         svg.innerHTML = svgImage;
         svg.setAttribute('viewBox', "0 0 " + width + " " + height);
         
         step.solution = svg.outerHTML;
     }

     if (step.toolbox) {
         var usedBlockTypes = getDistinctBlockTypeListForProgram(xml),
             defaultBlockTypes = getDistinctBlockTypeListForProgram(robots[tutorial.robot].program),
             toolBoxBlockTypes = usedBlockTypes.filter(function(usedBlockType) {
                 return defaultBlockTypes.indexOf(usedBlockType) === -1;
             }),
             toolBox = Blockly.Xml.textToDom(robots[tutorial.robot].toolbox),
             toolBoxBlocks = toolBox.querySelectorAll('block[type]'),
             blockParent;
         
         for (var i = 0; i < toolBoxBlocks.length; i++) {
             if (toolBoxBlockTypes.indexOf(toolBoxBlocks[i].attributes.type.value) === -1) {
                 blockParent = toolBoxBlocks[i].parentNode;
                 blockParent.removeChild(toolBoxBlocks[i]);
                 if (blockParent.children.length === 0) {
                     blockParent.parentNode.removeChild(blockParent);
                 }
             }
         }
         
         var innerCategories = toolBox.querySelectorAll('category category');
         
         for (var i = 0; i < innerCategories.length; i++) {
             while (innerCategories[i].children.length > 0) {
                 innerCategories[i].parentNode.appendChild(innerCategories[i].children[0]);
             }
             innerCategories[i].parentNode.removeChild(innerCategories[i]);
         }
         
         var categories = toolBox.querySelectorAll('category');
         
         for (var i = 0; i < categories.length; i++) {
             if (categories[i].children.length === 0 
                 && (categories[i].attributes.name.value !== 'TOOLBOX_PROCEDURE' || (
                         toolBoxBlockTypes.indexOf('robProcedures_defnoreturn') === -1
                         && toolBoxBlockTypes.indexOf('robProcedures_defreturn') === -1)
                     )
                 && (categories[i].attributes.name.value !== 'TOOLBOX_VARIABLE' || (
                         toolBoxBlockTypes.indexOf('robGlobalVariables_declare') === -1 
                         && toolBoxBlockTypes.indexOf('robLocalVariables_declare') === -1)
                     )
                 ) {
                 categories[i].parentNode.removeChild(categories[i]);
             }
         }
         
         currentStep.toolbox = Blockly.Xml.domToText(toolBox);
     }
     
     if (step.maxBlocks) {
         step.maxBlocks = calculateMaxBlocks();
     }
     
     var blockTypes = getDistinctBlockTypeListForProgram(xml);
}

function getDistinctBlockTypeListForProgram(rootElement) {
    var blocks = rootElement.querySelectorAll('block[type]'),
        blockTypes = [];

    //Check if the root itself is a block
    if (rootElement.tagName.toUpperCase() === 'block' && rootElement.attributes.type && rootElement.attributes.type.value !== '') {
        blocks.push(rootElement);
    }
    
    for(var i = 0; i < blocks.length; i++) {
        blockTypes.push(blocks[i].attributes.type.value);
    }
    
    return blockTypes.filter(function(blockType, index, blockTypes) {
            return blockTypes.indexOf(blockType) === index;
        });
}

function loadProgramOfStep(step) {
    if (step.program) {
        try {
            var xml = Blockly.Xml.textToDom(step.program);
            workspace.clear();
            Blockly.Xml.domToWorkspace(xml, workspace);
        } catch(e) {
            //TODO: Show hint, that the XML for the step is malformed
            return;
        }
    }
}

function refreshStepView() {
    refreshStepNavigation();
    refreshSettings('tutorial.step.');
}

function refreshSettings(filter) {
    var formFields = document.querySelectorAll('input, select, textarea'),
        stepIndex = tutorial.step.indexOf(currentStep);
    
    filter = filter || [];
    refreshing = true;
    for (var i = 0; i < formFields.length; i++) {
        if (formFields[i].name.indexOf(filter) !== 0) {
            continue;
        }
        
        var identifierChain = formFields[i].name.split('.'),
            checkType = formFields[i].tagName.toUpperCase() === 'INPUT' && ['checkbox', 'radio'].indexOf(formFields[i].type.toLowerCase()) !== -1;
            parent = tutorial;
        
        //Replace old with new stepIndex
        identifierChain.splice(2, 1, stepIndex);
        formFields[i].name = identifierChain.join('.');
        
        //Remove tutorial, because parent starts at tutorial and not at window
        identifierChain.shift();
        
        for (var j = 0; j < identifierChain.length; j++) {
            if (typeof parent === 'undefined' || parent === null) {
                if (checkType) {
                    formFields[i].checked = false;
                } else {
                    formFields[i].value = '';
                }
                break;
            }
            
            if (j + 1 === identifierChain.length) {
                if (typeof window[identifierChain[j] + 'ToDom'] === 'function') {
                    window[identifierChain[j] + 'ToDom'](parent, formFields[i]);
                } else {
                    if (checkType) {
                        formFields[i].checked = !!parent[identifierChain[j]];
                    } else if (formFields[i].tagName.toUpperCase() === 'TEXTAREA' && formFields[i].classList.contains('rich-text-edit')) {
                        CKEDITOR.instances[formFields[i].id].setData(parent[identifierChain[j]]);
                    } else {
                        formFields[i].value = parent[identifierChain[j]];
                    }
                }
            } else {
                parent = parent[identifierChain[j]];
            }
        }

    }
    refreshing = false;
    
    refreshQuizForm();
    
}

function refreshQuizForm() {
    
    var stepQuiz = document.getElementById('step-quiz'),
        oldQuestions = stepQuiz.querySelectorAll('.step-quiz-question'),
        newQuestions = currentStep.quiz,
        stepIndex = tutorial.step.indexOf(currentStep),
        i = 0;
    
    
    for(i = 0; i < oldQuestions.length; i++) {
        stepQuiz.removeChild(oldQuestions[i]);
    }

    if (typeof newQuestions === 'undefined' || newQuestions === null || newQuestions.length === 0) {
        currentStep.quiz = []; //Sanitize data structure
        return;
    }
    
    for(i = 0; i < newQuestions.length; i++) {
        addQuizQuestion(stepIndex, newQuestions[i], i);
    }
}

function addQuizQuestion(stepIndex, questionData, questionIndex) {
    var questionContainer = getTemplate('step-quiz-question'),
        questionLabel = questionContainer.querySelector('.step-quiz-question-label'),
        questionInput = questionContainer.querySelector('.step-quiz-question-input'),
        addAnswerButton = questionContainer.querySelector('.step-quiz-answer-button'),
        questionIdentifier = 'tutorial.step.' + stepIndex + '.quiz.' + questionIndex + '.',
        answerContainer = questionContainer.querySelector('.step-quiz-answers');
    
    questionLabel.htmlFor = questionIdentifier + 'question';
    
    questionInput.id = questionLabel.htmlFor;
    questionInput.name = questionIdentifier + 'question';
    questionInput.value = questionData.question;
    questionInput.addEventListener('change', handleSettingsChange);
    
    addAnswerButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        questionData.answer.push('');
        addQuizAnswer(answerContainer, questionIdentifier, '', questionData.answer.length - 1);
    });

    
    for (var i = 0; i < questionData.answer.length; i++) {
        addQuizAnswer(answerContainer, questionIdentifier, questionData.answer[i], i);
    }
    
    document.getElementById('step-quiz').append(questionContainer);
}

function addQuizAnswer(container, questionIdentifier, answer, answerIndex) {
    var answerContainer = getTemplate('step-quiz-answer'),
        answerLabel = answerContainer.querySelector('.step-quiz-answer-label'),
        answerInput = answerContainer.querySelector('.step-quiz-answer-input'),
        correctLabel = answerContainer.querySelector('.step-quiz-answer-correct-label'),
        correctInput = answerContainer.querySelector('.step-quiz-answer-correct-input'),
        addAnswerButton = container.querySelector('.step-quiz-answer-button'),
        answerIdentifier = questionIdentifier + 'answer.' + answerIndex,
        answerCorrect = answer.indexOf('!') !== 0 && answer !== '',
        answer = answerCorrect ? answer : answer.substring(1);
    
    answerLabel.htmlFor = answerIdentifier + '.answer';
    
    answerInput.id = answerLabel.htmlFor;
    answerInput.name = answerIdentifier + '.setAnswer';
    answerInput.value = answer;
    answerInput.addEventListener('change', handleSettingsChange);

    correctLabel.htmlFor = answerIdentifier + '.correct';
    
    correctInput.id = correctLabel.htmlFor;
    correctInput.name = answerIdentifier + '.setAnswerCorrectState';
    correctInput.checked = answerCorrect;
    correctInput.addEventListener('change', handleSettingsChange);
    
    container.insertBefore(answerContainer, addAnswerButton);
}

function handleSettingsChange(evt) {
    //Do not prevent default, because this is necessary for the textarea.
    
    if (refreshing || this.name.indexOf('tutorial.') !== 0) {
        return;
    }
    
    var attribute = this.name.substring(9),
        value = this.value;
    
    if (this.tagName.toUpperCase() === 'INPUT' && ['checkbox', 'radio'].indexOf(this.type.toLowerCase()) !== -1) {
        value = this.checked;
    }
    
    if (attribute.indexOf('.') === -1) {
        tutorial[attribute] = value;
        return;
    }
    
    var fields = attribute.split('.'),
        parent = tutorial;
    
    for (var j = 0; j < fields.length; j++) {
        if (j + 1 === fields.length) {
            if (typeof window[fields[j]] === 'function') {
                window[fields[j]](parent, value, attribute);
            } else {
                parent[fields[j]] = value;
            }
        } else {
            parent = parent[fields[j]];
        }
    }
}

function setAnswer(answer,  newValue, fullIdentifier) {
    var answerCorrect = answer.indexOf('!') !== 0 && answer !== '';
    if (!answerCorrect) {
        answer = answer.substring(1);
    }
    
    if (answer === newValue) {
        return;
    }
    
    var parent = tutorial,
        keys = fullIdentifier.split('.');
    for (var i = 0; i < keys.length - 2; i++) {
        parent = parent[keys[i]];
    }
    
    parent[keys[i]] = (answerCorrect ? '' : '!') + newValue;
}

function setAnswerToDom(answer, formField) {
    if (answer.indexOf('!') === 0) {
        formField.value = answer.substring(1);
    } else {
        formField.value = answer;
    }
}

function setAnswerCorrectState(answer,  newCorrect, fullIdentifier) {
    var answerCorrect = answer.indexOf('!') !== 0 && answer !== '',
        newCorrect = !!newCorrect;
    
    if (answerCorrect === newCorrect) {
        return;
    }
    
    var parent = tutorial,
        keys = fullIdentifier.split('.');
    for (var i = 0; i < keys.length - 2; i++) {
        parent = parent[keys[i]];
    }
    
    parent[keys[i]] = newCorrect ? answer.substring(1) : '!' + answer;
}

function setAnswerCorrectStateToDom(answer, formField) {
    formField.checked = answer.indexOf('!') === 0;
}

function toggleMaxBlocks(step, useMaxBlocks, fullIdentifier) {
    if (useMaxBlocks) {
        step.maxBlocks = calculateMaxBlocks();
    } else {
        step.maxBlocks = null;
    }
}

function toggleMaxBlocksToDom(step, formField) {
    formField.checked = !!step.maxBlocks;
}

function addMaxBlocks(step, extraBlocks, fullIdentifier) {
    if (step.maxBlocks) {
        step.maxBlocks = calculateMaxBlocks();
    }
}

function addMaxBlocksToDom(step, formField) {
    if (!step.maxBlocks) {
        formField.value = 0;
        return;
    }

    formField.value = step.maxBlocks - Blockly.Xml.workspaceToDom(workspace).querySelectorAll('block[intask="true"]').length;
}

function calculateMaxBlocks() {
    var maxBlocksExtraInput = document.getElementById('step-maxBlocks-add'),
        usedBlocksWithDuplicates = Blockly.Xml.workspaceToDom(workspace).querySelectorAll('block[intask="true"]').length;
    
    maxBlocksExtraInput = maxBlocksExtraInput.value === '' ? 0 : parseInt(maxBlocksExtraInput.value);
    
    return usedBlocksWithDuplicates + maxBlocksExtraInput;
}

function toggleToolboxLimit(step, toolBoxActive, fullIdentifier) {
    if (!!step.toolbox !== toolBoxActive) {
        step.toolbox = toolBoxActive ? true : null;
    }
}

function toggleToolboxLimitToDom(step, formField) {
    formField.checked = !!step.toolbox;
}

function toggleSolution(step, solutionActive, fullIdentifier) {
    if (!!step.solution !== solutionActive) {
        step.solution = solutionActive ? true : null;
    }
}

function toggleSolutionToDom(step, formField) {
    formField.checked = !!step.solution;
}


// Solution image: 
// 

// OLD FUNCTIONS

function toXml() {
    var output = document.getElementById('importExport');
    var xml = Blockly.Xml.workspaceToDom(workspace);
    output.value = Blockly.Xml.domToPrettyText(xml);
    output.focus();
    output.select();
    taChange();
}

function fromXml() {
    var input = document.getElementById('importExport');
    var xml = Blockly.Xml.textToDom(input.value);
    Blockly.Xml.domToWorkspace(xml, workspace);
    taChange();
}

// Disable the "Import from XML" button if the XML is invalid.
// Preserve text between page reloads.
function taChange() {
    var textarea = document.getElementById('importExport');
    if (sessionStorage) {
        sessionStorage.setItem('textarea', textarea.value);
    }
    var valid = true;
    try {
        Blockly.Xml.textToDom(textarea.value);
    } catch (e) {
        valid = false;
    }
    document.getElementById('import').disabled = !valid;
}

function logEvents(state) {
    var checkbox = document.getElementById('logCheck');
    checkbox.checked = state;
    if (sessionStorage) {
        sessionStorage.setItem('logEvents', Number(state));
    }
    if (state) {
        workspace.addChangeListener(logger);
    } else {
        workspace.removeChangeListener(logger);
    }
}

function logger(e) {
    console.log(e);
}