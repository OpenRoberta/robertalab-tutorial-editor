
var workspace = null,
    defaultStep = {
        header: '',
        tip: '',
        instruction: '',
        toolbox: false,
        maxBlocks: false,
        solution: false,
        quiz: []
    },
    tutorial = {
        name: '',
        robot: '',
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
            filename: 'nao'
        },
    },
    currentStep = null,
    emptyQuestion = {
        question: '',
        answer: ['']
    },
    refreshing = false,
    templates = {},
    toolbox;

window.onload = function () {
    initBlockly();
    loadTemplates();
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
    
    var formFields = document.querySelectorAll('input, select, textarea');
    
    for (var i = 0; i < formFields.length; i++) {
        formFields[i].addEventListener('change', handleSettingsChange);
    }
    
    var downloadButton = document.getElementById('download');
    downloadButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        persistCurrentProgramForStep(currentStep);
        download(JSON.stringify(tutorial));
    });
    
    var uploadButton = document.getElementById('upload');
    uploadButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        upload();
    });
    
    var addStepButton = document.getElementById('add-step');
    addStepButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        addStep();
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
        
        var currentStepIndex = tutorial.step.indexOf(currentStep);
        
        if (currentStepIndex === 0) {
            loadStep(1);
        } else {
            loadStep(currentStepIndex - 1);
        }
        tutorial.step.splice(currentStepIndex, 1);

        refreshStepNavigation();
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
    robotSelection.addEventListener('change', function(evt){
        //Do not preventDefault to make sure the handleSettingsChange is called as well.
        //Also: tutorial.robot is set in the handleSettingsChange. This might be called before this one, 
        //so tutorial.robot might already be changed.
        
        var rootUrl = window.location.href.slice(0, -10);
        
        if (!robots[tutorial.robot].toolbox) {
            var ajaxRequest = new XMLHttpRequest(),
                relativePropertiesFilePath = rootUrl + '../robertalab/OpenRobertaParent/' + robots[tutorial.robot].project + '/src/main/resources/' + robots[tutorial.robot].filename + '.properties';
            ajaxRequest.onreadystatechange = function () {
                debugger;
            }
            ajaxRequest.open('GET', relativePropertiesFilePath, true);
            ajaxRequest.send();
        }
    });
}

function initBlockly() {
    toolbox = document.getElementById('toolbox');
    workspace = Blockly.inject('workspace', {
        comments: true,
        disable: true,
        collapse: true,
        grid: false,
        maxBlocks: Infinity,
        media: './blockly/media/',
        readOnly: false,
        rtl: false,
        scrollbars: true,
        toolbox: toolbox,
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
    workspace.setDevice(tutorial.robot);
    
    /*
    // Restore previously displayed text.
    if (sessionStorage) {
        var text = sessionStorage.getItem('textarea');
        if (text) {
            document.getElementById('importExport').value = text;
        }
        // Restore event logging state.
        var state = sessionStorage.getItem('logEvents');
        logEvents(Boolean(Number(state)));
    } else {
        // MSIE 11 does not support sessionStorage on file:// URLs.
        logEvents(false);
    }
    taChange();
    */
}

/* Step settings handling functions */
function refreshStepNavigation() {
    var stepNavigation = document.getElementById('step-navigation');

    //First remove all steps
    while(stepNavigation.firstChild.id != 'add-step') {
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
        addButton = container.querySelector('#add-step'),
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
    
    container.insertBefore(stepButton, addButton);
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
        persistCurrentProgramForStep(currentStep);
    }
    
    currentStep = tutorial.step[stepIndex];

    refreshStepNavigation();
    refreshStepView();
}

function persistCurrentProgramForStep(step) {
     var xml = Blockly.Xml.workspaceToDom(workspace);
     step.solution = Blockly.Xml.domToPrettyText(xml);
}

function refreshStepView() {
    refreshSettings('tutorial.step.');
    
    if (currentStep.solution) {
        //loadProgram(currentStep.solution);
    }
    
    if (currentStep.toolbox) {
        //loadToolbox(currentStep.toolbox);
    }
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
        
        //Remove tutorial, because we always strt at tutorial
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
                if (typeof window[identifierChain[j]] === 'function') {
                    window[identifierChain[j] + 'ToDom'](parent, formFields[i]);
                } else {
                    if (checkType) {
                        formFields[i].checked = !!parent[identifierChain[j]];
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
    
    if (newQuestions.length === 0) {
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

function toCode(lang) {
    var output = document.getElementById('importExport');
    output.value = Blockly[lang].workspaceToCode(workspace);
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