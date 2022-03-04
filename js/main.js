var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Tutorial = function(Tutorial) { //Tutorial = FraunhoferIAIS.Tutorial
    Tutorial.defaults = {
        robot: 'ev3lejosv1',
        language: 'DE',
        step: {
            header: ''
        },
        question: {
            question: '',
            answer: ['']
        }
        /*
        oldStep: {
            header: '',
            tip: '',
            instruction: '',
            toolbox: null,
            maxBlocks: null,
            solution: null,
            program: null,
            quiz: []
        },
        */
    };

    Tutorial.tutorial = Tutorial.tutorial || {
        name: '',
        overview: {
            goal: '',
            previous: '',
            description: ''
        },
        robot: Tutorial.defaults.robot,
        language: Tutorial.defaults.language,
        step: [JSON.parse(JSON.stringify(Tutorial.defaults.step))]
    };

    Tutorial.currentStep = Tutorial.currentStep || Tutorial.tutorial.step[0];

    Tutorial.getCurrentStepIndex = function() {
        return Tutorial.getStepIndex(Tutorial.currentStep);
    };

    Tutorial.getStepIndex = function(selectedStep) {
        return Tutorial.tutorial.step.indexOf(selectedStep);
    };

    Tutorial.initFormFields = function() {

        if (!FraunhoferIAIS.Blockly || !FraunhoferIAIS.Input || !CKEDITOR) {
            console.error('Required FraunhoferIAIS.Blockly and FraunhoferIAIS.Input were not provided.');
            return;
        }

        var robotSelection = document.getElementById('tutorial-robot'),
            robotList = FraunhoferIAIS.Blockly.getRobotListForFrontend();

        robotList.forEach(function(robot) {
            var option = document.createElement('option');
            option.value = robot.value;
            option.textContent = robot.textContent;
            if (robot.value === Tutorial.tutorial.robot) {
                option.selected = true;
            }
            robotSelection.appendChild(option);
        });

        FraunhoferIAIS.Input.addHandleInputChangeCallback('tutorial.robot', function(oldRobot, newRobot) {
            FraunhoferIAIS.Blockly.replaceRobot(newRobot);
        });

        FraunhoferIAIS.Input.addHandleInputChangeCallback('tutorial.language', function(oldLanguage, newLanguage) {
            FraunhoferIAIS.Blockly.replaceLanguage(newLanguage)
                .then(Tutorial.refreshProgramSVGs());
        });

        CKEDITOR.on('instanceCreated', function(event) {
            event.editor.on('change', function() {
                var textarea = document.getElementById(event.editor.name),
                    changeEvent = new Event('change');
                textarea.value = event.editor.getData();
                textarea.dispatchEvent(changeEvent);
            });
        });

        CKEDITOR.replaceAll('rich-text-edit');

        FraunhoferIAIS.Input.initSpecificInputs(
            Tutorial,
            document.querySelectorAll('input[name^="tutorial."], select[name^="tutorial."], textarea[name^="tutorial."]'));
    };

    return Tutorial;
}(FraunhoferIAIS.Tutorial || {});

//Above is refactored code.

FraunhoferIAIS.Tutorial.refreshProgramSVGs = function() {
    var currentStepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex(),
        chainPromise = FraunhoferIAIS.Tutorial.persistCurrentProgramInStep();

    FraunhoferIAIS.Tutorial.tutorial.step.forEach(function(step) {
        if (!step.solution || step === FraunhoferIAIS.Tutorial.currentStep) {
            return;
        }

        chainPromise = chainPromise.then(function() {
            FraunhoferIAIS.Tutorial.loadProgramOfStep(step);
            return FraunhoferIAIS.Tutorial.persistCurrentProgramInStep(step);
        });
    });

    chainPromise = chainPromise.then(function() {
        FraunhoferIAIS.Tutorial.loadProgramOfStep();
    });

    return chainPromise;
};

FraunhoferIAIS.Tutorial.loadProgramOfStep = function(step) {
    if (!step) {
        step = FraunhoferIAIS.Tutorial.currentStep;
    }

    if (step.program) {
        FraunhoferIAIS.Blockly.setProgram(step.program);
    }
};

FraunhoferIAIS.Tutorial.persistCurrentProgramInStep = function(step) {
    if (!step) {
        step = FraunhoferIAIS.Tutorial.currentStep;
    }

    var promises = [];

    FraunhoferIAIS.Blockly.saveProgramAsCurrent();

    step.program = FraunhoferIAIS.Blockly.currentProgram;

    if (step.solution) {
        promises.push(FraunhoferIAIS.Roberta.getCurrentProgramAsSvg(FraunhoferIAIS.Blockly.programWorkspace, 6).then(function(svg) {
            step.solution = svg.outerHTML;
        }));
    }

    if (!step.toolbox) {
        step.toolbox = FraunhoferIAIS.Blockly.getCurrentProgramToolbox('beginner');
    } else if (step.toolbox === true
        || step.toolbox != FraunhoferIAIS.Blockly.getCurrentProgramToolbox('beginner')
        && step.toolbox != FraunhoferIAIS.Blockly.getCurrentProgramToolbox('beginner')) {
        step.toolbox = FraunhoferIAIS.Toolbox.getUsedBlocksSubsetFromCurrentToolbox();
    }

    if (step.maxBlocks) {
        step.maxBlocks = FraunhoferIAIS.Tutorial.calculateMaxBlocks();
    }

    return Promise.all(promises);
};

FraunhoferIAIS.Tutorial.calculateMaxBlocks = function() {
    var maxBlocksExtraInput = document.getElementById('step-maxBlocks-add'),
        usedBlocksWithDuplicates = Blockly.Xml.workspaceToDom(FraunhoferIAIS.Blockly.programWorkspace).querySelectorAll('block[intask="true"]').length;

    maxBlocksExtraInput = parseInt(maxBlocksExtraInput.value) || 0;

    return usedBlocksWithDuplicates + maxBlocksExtraInput;
};

FraunhoferIAIS.Tutorial.initStepSettings = function() {
    var addQuestionButton = document.getElementById('step-quiz-add-question'),
        addTipButton = document.getElementById('step-tip-add-button');
    addQuestionButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        var newQuestion = JSON.parse(JSON.stringify(FraunhoferIAIS.Tutorial.defaults.question)),
            currentStep = FraunhoferIAIS.Tutorial.currentStep;

        if (!currentStep.quiz) {
            currentStep.quiz = [];
        }

        currentStep.quiz.push(newQuestion);
        FraunhoferIAIS.Tutorial.refreshQuizForm();
    });
    addTipButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        if (!FraunhoferIAIS.Tutorial.currentStep.tip) {
            FraunhoferIAIS.Tutorial.currentStep.tip = [];
        }

        FraunhoferIAIS.Tutorial.currentStep.tip.push('');
        FraunhoferIAIS.Tutorial.refreshTips();
    });
};

FraunhoferIAIS.Tutorial.refreshTips = function() {
    var oldTips = [].slice.call(document.querySelectorAll('.step-tip')),
        newTips = FraunhoferIAIS.Tutorial.currentStep.tip || [],
        i = 0;

    for (i = 0; i < oldTips.length; i++) {
        oldTips[i].parentNode.removeChild(oldTips[i]);
    }

    if (newTips.length === 0) {
        if (typeof FraunhoferIAIS.Tutorial.currentStep.tip !== 'undefined') {
            delete FraunhoferIAIS.Tutorial.currentStep.tip; //Sanitize data structure
        }
        return;
    }

    for (i = 0; i < newTips.length; i++) {
        FraunhoferIAIS.Tutorial.addTipToForm(newTips[i], i);
    }
};
FraunhoferIAIS.Tutorial.addTipToForm = function(tip, tipIndex) {
    var addTipButton = document.getElementById('step-tip-add-button'),
        stepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex(),
        tipContainer = FraunhoferIAIS.Template.getTemplate('step-tip'),
        tipLabel = tipContainer.querySelector('label'),
        tipInput = tipContainer.querySelector('textarea'),
        removeTipButton = tipContainer.querySelector('button'),
        tipObjectPath = 'tutorial.step.' + stepIndex + '.tip.' + tipIndex;

    tipLabel.setAttribute('for', tipObjectPath);
    tipLabel.textContent = (tipIndex + 1) + '. Hinweis';

    tipInput.setAttribute('id', tipObjectPath);
    tipInput.setAttribute('name', tipObjectPath);
    tipInput.value = tip || '';

    removeTipButton.addEventListener('click', function(clickEvent) {
        clickEvent.preventDefault();

        var step = FraunhoferIAIS.Tutorial.tutorial.step[stepIndex],
            currentTipValue = step.tip && step.tip[tipIndex],
            removeTipHandler = function() {
                if (currentTipValue === false) {
                    return;
                }

                if (step.tip.length > 1) {
                    step.tip.splice(tipIndex, 1);
                } else {
                    delete step.tip;
                }
                FraunhoferIAIS.Tutorial.refreshTips();
            };

        if (currentTipValue) {
            var step = FraunhoferIAIS.Tutorial.tutorial.step[stepIndex],
                modalHeadline = 'Möchten Sie den Hinweis tatsächlich löschen?',
                modalContent = 'Der Hinweis wird unwiderruflich gelöscht.';

            FraunhoferIAIS.Modal.showConfirmationModal(modalHeadline, modalContent, removeTipHandler);
        } else {
            removeTipHandler();
        }
    });

    addTipButton.parentNode.insertBefore(tipContainer, addTipButton);

    CKEDITOR.replace(tipInput);

    FraunhoferIAIS.Input.initSpecificInputs(FraunhoferIAIS.Tutorial, [tipInput]);
};

FraunhoferIAIS.Tutorial.refreshQuizForm = function() {
    var stepQuiz = document.getElementById('step-quiz'),
        oldQuestions = [].slice.call(stepQuiz.querySelectorAll('.step-quiz-question')),
        newQuestions = FraunhoferIAIS.Tutorial.currentStep.quiz || [],
        i = 0;

    for (i = 0; i < oldQuestions.length; i++) {
        stepQuiz.removeChild(oldQuestions[i]);
    }

    if (newQuestions.length === 0) {
        if (typeof FraunhoferIAIS.Tutorial.currentStep.quiz !== 'undefined') {
            delete FraunhoferIAIS.Tutorial.currentStep.quiz; //Sanitize data structure
        }
        return;
    }

    for (i = 0; i < newQuestions.length; i++) {
        FraunhoferIAIS.Tutorial.addQuizQuestionToForm(newQuestions[i], i);
    }
};

FraunhoferIAIS.Tutorial.addQuizQuestionToForm = function(questionData, questionIndex) {
    var stepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex(),
        questionContainer = FraunhoferIAIS.Template.getTemplate('step-quiz-question'),
        questionLabel = questionContainer.querySelector('.step-quiz-question-label'),
        questionInput = questionContainer.querySelector('.step-quiz-question-input'),
        addAnswerButton = questionContainer.querySelector('.step-quiz-answer-button'),
        removeQuestionButton = questionContainer.querySelector('.step-quiz-remove-question-button'),
        questionObjectPath = 'tutorial.step.' + stepIndex + '.quiz.' + questionIndex,
        answerContainer = questionContainer.querySelector('.step-quiz-answers');

    questionLabel.setAttribute('for', questionObjectPath + '.question');

    questionInput.setAttribute('id', questionObjectPath + '.question');
    questionInput.setAttribute('name', questionObjectPath + '.question');
    questionInput.value = questionData.question || '';

    FraunhoferIAIS.Input.initSpecificInputs(FraunhoferIAIS.Tutorial, [questionInput]);

    addAnswerButton.addEventListener('click', function(evt) {
        evt.preventDefault();

        if (!questionData.answer) {
            questionData.answer = [];
        }

        questionData.answer.push('');

        FraunhoferIAIS.Tutorial.addQuizAnswer(answerContainer, questionObjectPath, '', questionData.answer.length - 1);
    });

    removeQuestionButton.addEventListener('click', function(clickEvent) {
        clickEvent.preventDefault();

        var step = FraunhoferIAIS.Input.traversePathToNodeParent((questionObjectPath.substring(0, questionObjectPath.lastIndexOf('.'))).split('.'), FraunhoferIAIS.Tutorial),
            modalHeadline = 'Möchten Sie die Frage mit allen Antworten tatsächlich löschen?',
            modalContent = 'Die Frage und alle Antworten zu dieser Frage werden unwiderruflich gelöscht.',
            modalSuccessHandler = function() {
                if (!step || !step.quiz || step.quiz.length <= questionIndex || questionIndex < 0) {
                    return;
                }
                if (step.quiz.length > 1) {
                    step.quiz.splice(questionIndex, 1);
                } else {
                    delete step.quiz;
                }

                FraunhoferIAIS.Tutorial.refreshQuizForm();
            };

        FraunhoferIAIS.Modal.showConfirmationModal(modalHeadline, modalContent, modalSuccessHandler);
    });

    for (var i = 0; i < (questionData.answer || []).length; i++) {
        FraunhoferIAIS.Tutorial.addQuizAnswer(answerContainer, questionObjectPath, questionData.answer[i], i);
    }

    document.getElementById('step-quiz').insertBefore(questionContainer, document.getElementById('step-quiz-add-question'));
};
FraunhoferIAIS.Tutorial.addQuizAnswer = function(container, questionObjectPath, answer, answerIndex) {
    if (!container || questionObjectPath == '' || answerIndex < 0) {
        return;
    }

    var answerContainer = FraunhoferIAIS.Template.getTemplate('step-quiz-answer'),
        answerLabel = answerContainer.querySelector('.step-quiz-answer-label'),
        answerInput = answerContainer.querySelector('.step-quiz-answer-input'),
        correctLabel = answerContainer.querySelector('.step-quiz-answer-correct-label'),
        correctInput = answerContainer.querySelector('.step-quiz-answer-correct-input'),
        addAnswerButton = container.querySelector('.step-quiz-answer-button'),
        removeAnswerButton = answerContainer.querySelector('.iais-close'),
        answerObjectPath = questionObjectPath + '.answer.' + answerIndex,
        answerCorrect = answer.indexOf('!') !== 0 && answer !== '',
        answer = answerCorrect ? answer : answer.substring(1);

    answerLabel.setAttribute('for', answerObjectPath + '.answer');
    answerInput.setAttribute('id', answerObjectPath + '.answer');
    answerInput.setAttribute('name', answerObjectPath + '.setAnswer');
    answerInput.value = answer;
    FraunhoferIAIS.Input.initSpecificInputs(FraunhoferIAIS.Tutorial, [answerInput]);

    correctLabel.setAttribute('for', answerObjectPath + '.correct');
    correctInput.setAttribute('id', answerObjectPath + '.correct');
    correctInput.setAttribute('name', answerObjectPath + '.setAnswerCorrectState');
    correctInput.checked = answerCorrect;

    removeAnswerButton.addEventListener('click', function(clickEvent) {
        clickEvent.preventDefault();

        var question = FraunhoferIAIS.Input.traversePathToNodeParent((questionObjectPath + '.ignore').split('.'), FraunhoferIAIS.Tutorial);

        if (!question || !question.answer || question.answer.length <= answerIndex) {
            return;
        }

        question.answer.splice(answerIndex, 1);
        FraunhoferIAIS.Tutorial.refreshQuizForm();
    });

    FraunhoferIAIS.Input.initSpecificInputs(FraunhoferIAIS.Tutorial, [correctInput]);

    container.insertBefore(answerContainer, addAnswerButton);
};

FraunhoferIAIS.Tutorial.initTabs = function() {
    var groupWrapper = document.getElementById('step-settings'),
        generalTabToggle = document.getElementById('view-step-general'),
        generalTab = document.getElementById('step-general'),
        quizTabToggle = document.getElementById('view-step-quiz'),
        quizTab = document.getElementById('step-quiz');
    groupIdentifier = 'tutorial-step-tabs';

    FraunhoferIAIS.Tab.registerGroup(groupIdentifier, groupWrapper);
    FraunhoferIAIS.Tab.registerTab(groupIdentifier, generalTabToggle, generalTab);
    FraunhoferIAIS.Tab.registerTab(groupIdentifier, quizTabToggle, quizTab);
};

FraunhoferIAIS.Tutorial.initStepMenu = function() {
    var injectStepBefore = document.getElementById('inject-step-before'),
        injectStepAfter = document.getElementById('inject-step-after'),
        removeStep = document.getElementById('remove-step-button'),
        importProgramFromLabExport = document.getElementById('step-import-program-from-lab-input'),
        importProgramFromPreviousStep = document.getElementById('step-import-program-from-previous');

    injectStepBefore.addEventListener('click', function(evt) {
        evt.preventDefault();
        FraunhoferIAIS.Tutorial.injectStep(FraunhoferIAIS.Tutorial.getCurrentStepIndex(), true);
    });

    injectStepAfter.addEventListener('click', function(evt) {
        evt.preventDefault();
        FraunhoferIAIS.Tutorial.injectStep(FraunhoferIAIS.Tutorial.getCurrentStepIndex(), false);
    });

    removeStep.addEventListener('click', function(evt) {
        evt.preventDefault();
        if (FraunhoferIAIS.Tutorial.tutorial.step.length < 2) {
            return;
        }

        var stepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex(),
            step = FraunhoferIAIS.Tutorial.currentStep,
            modalHeadline = 'Soll Schritt ' + (stepIndex + 1) + ' wirklich gelöscht werden?',
            modalContent = 'Indem Sie diesen Schritt löschen werden alle damit verbundenen Daten unwideruflich gelöscht. Nur das Laden eines vorherigen Stands kann dies wieder korrigieren.',
            modalSuccessHandler = function() {
                var checkedStepIndex = FraunhoferIAIS.Tutorial.getStepIndex(step);

                if (checkedStepIndex === -1) {
                    //Step was already removed
                    return;
                }

                FraunhoferIAIS.Tutorial.tutorial.step.splice(stepIndex, 1);
                FraunhoferIAIS.Tutorial.currentStep = null;
                //stepIndex is now the index of the following step. If the last step was deleted, loadStep will make sure we load a valid step 
                FraunhoferIAIS.Tutorial.loadStep(stepIndex);
            };

        FraunhoferIAIS.Modal.showConfirmationModal(modalHeadline, modalContent, modalSuccessHandler);
    });

    importProgramFromPreviousStep.addEventListener('click', function(clickEvent) {
        clickEvent.preventDefault();

        var currentStepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex(),
            previousStep = null;

        if (FraunhoferIAIS.Tutorial.getCurrentStepIndex() < 1) {
            return;
        }

        FraunhoferIAIS.Tutorial.loadProgramOfStep(FraunhoferIAIS.Tutorial.tutorial.step[currentStepIndex - 1]);
    });

    importProgramFromLabExport.addEventListener('change', function(changeEvent) {
        changeEvent.preventDefault();

        if (importProgramFromLabExport.files.length === 0) {
            return;
        }

        FraunhoferIAIS.Loading.startIndicator();

        (new Promise(function(resolve, reject) {
            if (importProgramFromLabExport.files.length > 1) {
                reject(new Error('Bitte wählen Sie nur eine Datei aus.'));
                return;
            }
            var file = importProgramFromLabExport.files[0],
                fileName = file.name.substring(0, file.name.indexOf('.xml'));

            if (file.type !== 'text/xml') {
                reject(new Error('Die ausgewählte Datei entspricht nicht dem erwarteten Format. Es muss sich um eine .xml-Datei handeln.'));
                return;
            }

            var fileReader = new FileReader();
            fileReader.addEventListener('load', function(loadEvent) {
                if (fileReader.result.trim() === '') {
                    reject(new Error('Die ausgewählte Datei ist leer oder konnte nicht geladen werden.'));
                    return;
                }

                var doubleOptPromise = Promise.resolve();

                if (FraunhoferIAIS.Blockly.programWorkspace !== null) {
                    doubleOptPromise = new Promise(function(resolve, reject) {
                        FraunhoferIAIS.Modal.showConfirmationModal(
                            'Neues Programm laden',
                            'Wenn Sie ein neues Programm laden wird das bisherige Programm mit samt aller Änderungen verworfen. Bestätigen Sie daher bitte zunächst das Laden des neuen Programms.',
                            resolve,
                            reject
                        );
                    });
                }

                doubleOptPromise.then(function() {
                    resolve(fileReader.result);
                }).catch(function() {
                    reject(new Error(''));
                });
            });
            fileReader.addEventListener('error', function(error) {
                reject(new Error('Das Laden der Datei war nicht möglich.'));
            });
            fileReader.readAsText(file);

        })).then(function(labExport) {
            return FraunhoferIAIS.Blockly.importFromLab(labExport, false).then(function() {
                return FraunhoferIAIS.Tutorial.persistCurrentProgramInStep();
            });
        }).catch(function(error) {
            if (error && error.message) {
                FraunhoferIAIS.Notification.showNotification('warning', 'Fehler beim Hochladen eines Programm-Exports:', error.message);
            }
        }).then(function() {
            FraunhoferIAIS.Loading.stopIndicator();
        });
    });

    return FraunhoferIAIS.Tutorial.refreshStepNavigation();
};

/**
 *
 * @param stepIndex The index of the step from which this function is called
 * @param before Whether the new step shall be injected before or after the step defined in the first parameter
 * @returns
 */
FraunhoferIAIS.Tutorial.injectStep = function(stepIndex, before) {
    if (!before) {
        stepIndex++;
    }

    if (stepIndex >= FraunhoferIAIS.Tutorial.tutorial.step.length) {
        return FraunhoferIAIS.Tutorial.addStep();
    } else {
        FraunhoferIAIS.Tutorial.tutorial.step.splice(stepIndex, 0, JSON.parse(JSON.stringify(FraunhoferIAIS.Tutorial.defaults.step)));
        return FraunhoferIAIS.Tutorial.loadStep(stepIndex);
    }
};

FraunhoferIAIS.Tutorial.refreshStepNavigation = function() {
    var stepNavigation = document.getElementById('step-navigation'),
        addStepPromise = Promise.resolve();

    //First remove all steps
    while (!stepNavigation.firstChild.getAttribute || stepNavigation.firstChild.getAttribute('id') !== 'step-menu') {
        stepNavigation.removeChild(stepNavigation.firstChild);
    }

    for (var i = 0; i < FraunhoferIAIS.Tutorial.tutorial.step.length; i++) {
        FraunhoferIAIS.Tutorial.addStepNavigationButton(i);
    }

    if (FraunhoferIAIS.Tutorial.currentStep === null || FraunhoferIAIS.Tutorial.getCurrentStepIndex() === -1) {
        if (FraunhoferIAIS.Tutorial.tutorial.step.length === 0) {
            addStepPromise = FraunhoferIAIS.Tutorial.addStep();
        }

        addStepPromise = addStepPromise.then(function() {
            FraunhoferIAIS.Tutorial.currentStep = FraunhoferIAIS.Tutorial.tutorial.step[0];
        });
    }

    return addStepPromise.then(function() {
        document.getElementById('step-menu').style['margin-left'] = stepNavigation.children[FraunhoferIAIS.Tutorial.getCurrentStepIndex()].offsetLeft + 'px';
    });
};

FraunhoferIAIS.Tutorial.addStepNavigationButton = function(stepIndex) {
    var container = document.getElementById('step-navigation'),
        stepMenu = container.querySelector('#step-menu'),
        stepButton = FraunhoferIAIS.Template.getTemplate('step-button'),
        currentIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex();

    stepButton.querySelector('span:first-child').textContent = stepIndex + 1;
    if (currentIndex === stepIndex) {
        stepButton.classList.add('active');
    }

    if (FraunhoferIAIS.Tutorial.tutorial.step[stepIndex].quiz) {
        stepButton.classList.add('quiz');
    }

    stepButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        FraunhoferIAIS.Tutorial.loadStep(stepIndex);
    });

    container.insertBefore(stepButton, stepMenu);
};

FraunhoferIAIS.Tutorial.addStep = function(stepData) {
    var newIndex = FraunhoferIAIS.Tutorial.tutorial.step.length;

    FraunhoferIAIS.Tutorial.tutorial.step.push(stepData || JSON.parse(JSON.stringify(FraunhoferIAIS.Tutorial.defaults.step)));

    return FraunhoferIAIS.Tutorial.loadStep(newIndex);
};

FraunhoferIAIS.Tutorial.loadStep = function(stepIndex) {
    FraunhoferIAIS.Loading.startIndicator();

    var persistPromise = Promise.resolve(),
        currentStepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex();

    if (stepIndex >= FraunhoferIAIS.Tutorial.tutorial.step.length) {
        stepIndex = FraunhoferIAIS.Tutorial.tutorial.step.length - 1;
    }

    if (stepIndex < 0) {
        stepIndex = 0;
    }

    if (stepIndex === currentStepIndex) {
        FraunhoferIAIS.Loading.stopIndicator();
        return persistPromise;
    }

    if (FraunhoferIAIS.Tutorial.currentStep !== null) {
        persistPromise = FraunhoferIAIS.Tutorial.persistCurrentProgramInStep();
    }

    return persistPromise.then(function() {
        FraunhoferIAIS.Tutorial.currentStep = FraunhoferIAIS.Tutorial.tutorial.step[stepIndex];

        FraunhoferIAIS.Tutorial.loadProgramOfStep();

        return FraunhoferIAIS.Tutorial.refreshStepView();
    }).catch(function(error) {
        if (error && error.message) {
            FraunhoferIAIS.Notification.showNotification('warning', 'Fehler beim Hochladen eines Programm-Exports:', error.message);
        }
    }).then(function() {
        FraunhoferIAIS.Loading.stopIndicator();
    });
};

FraunhoferIAIS.Tutorial.refreshStepView = function() {
    return FraunhoferIAIS.Tutorial.refreshStepNavigation().then(function() {
        FraunhoferIAIS.Tutorial.refreshSettings('tutorial.step.');
        FraunhoferIAIS.Tutorial.refreshTips();
        FraunhoferIAIS.Loading.stopIndicator();
    });
};

FraunhoferIAIS.Tutorial.refreshSettings = function(filter) {
    var formFields = [].slice.call(document.querySelectorAll('[name^="tutorial."]')),
        refreshFields = [],
        stepIndex = FraunhoferIAIS.Tutorial.getCurrentStepIndex();

    filter = filter || '';

    formFields.forEach(function(formField) {
        var objectPath = formField.getAttribute('name');
        if (objectPath.indexOf(filter) !== 0) {
            return;
        }

        formField.setAttribute('name', objectPath.replace(/^tutorial.step\.(\d)+\./, 'tutorial.step.' + stepIndex + '.'));
        refreshFields.push(formField);
    });

    //Set the name attribute for all fields first, so fields that are connected to each other will be found. (mainly radio buttons)
    refreshFields.forEach(function(formField) {
        FraunhoferIAIS.Input.loadInputValueFromObject(FraunhoferIAIS.Tutorial, formField);
    });

    FraunhoferIAIS.Tutorial.refreshQuizForm();
};

FraunhoferIAIS.Tutorial.initGlobalEvents = function() {
    var downloadButton = document.getElementById('download'),
        uploadInput = document.getElementById('upload'),
        initXMLUpload = document.getElementById('initXML-upload'),
        initXMLDelete = document.getElementById('initXML-delete'),
        initXMLInsert = document.getElementById('initXML-insert');

    downloadButton.addEventListener('click', function(clickEvent) {
        clickEvent.preventDefault();
        let modalHeadline = 'Programm-Download fertig!',
            modalContent = 'Klicke mit der rechten Maustaste auf den untenstehenden Link,<br> ' +
                'wähle "Speichern unter...",<br> ' +
                'Navigiere zum Ordner "admin/tutorial" in dieser Applikation,<br>' +
                'klicke auf "Speichern" um das Tutorial zu speichern!<br> <br>';

        var fileName = 'tutorial',
            downloadDiv = document.createElement('div'),
            downloadElement = document.createElement('a');

        FraunhoferIAIS.Tutorial.persistCurrentProgramInStep().then(function() {
            if (FraunhoferIAIS.Tutorial.tutorial.name) {
                fileName = FraunhoferIAIS.Tutorial.tutorial.name.replace(/[^\w]+/g, '-').toLowerCase();
            }

            downloadElement.className = 'download-program';
            downloadElement.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(FraunhoferIAIS.Tutorial.tutorial, null, 4));
            downloadElement.setAttribute('download', fileName + '.json');
            downloadElement.innerText = `${fileName}.json`;
            downloadDiv.appendChild(downloadElement);

            FraunhoferIAIS.Modal.showMessageModal(modalHeadline, modalContent, downloadDiv);
        });
    });

    uploadInput.addEventListener('change', function(changeEvent) {
        changeEvent.preventDefault();
        if (this.files.length > 0) {
            var file = this.files[0];
            if (file.type !== 'application/json') {
                return;
            }
            var fileReader = new FileReader();
            fileReader.onload = function(loadEvent) {
                if (loadEvent.target.result.trim() === '') {
                    return;
                }

                var newTutorial = JSON.parse(loadEvent.target.result),
                    modalHeadline = 'Soll das Tutorial tatäschlich eingefügt werden?',
                    modalContent = 'Wenn das Tutorial eingespielt wird, werden alle aktuellen Daten überschrieben und gehen unwideruflich verloren. Nur das Laden eines vorherigen Stands kann dies wieder korrigieren. Erstellen Sie daher vorher eine Sicherheitskopie.',
                    modalSuccessHandler = function() {
                        var oldRobot = FraunhoferIAIS.Blockly.currentRobot,
                            oldLanguage = FraunhoferIAIS.Blockly.currentLanguage;

                        FraunhoferIAIS.Tutorial.tutorial = newTutorial;

                        if (FraunhoferIAIS.Tutorial.tutorial.step.length === 0) {
                            FraunhoferIAIS.Tutorial.tutorial.step.push(JSON.parse(JSON.stringify(FraunhoferIAIS.Tutorial.defaults.step)));
                        }

                        FraunhoferIAIS.Tutorial.currentStep = null;

                        FraunhoferIAIS.Blockly.replaceRobot(FraunhoferIAIS.Tutorial.tutorial.robot, true);
                        FraunhoferIAIS.Blockly.replaceLanguage(FraunhoferIAIS.Tutorial.tutorial.language);

                        FraunhoferIAIS.Tutorial.loadStep(0).then(function() {
                            FraunhoferIAIS.Tutorial.refreshSettings('tutorial.');
                        });
                        FraunhoferIAIS.Tutorial.showInitXMLButtons();
                    };

                FraunhoferIAIS.Modal.showConfirmationModal(modalHeadline, modalContent, modalSuccessHandler);
            };
            fileReader.readAsText(file);
        }
    });

    initXMLUpload.addEventListener('change', function(changeEvent) {
        changeEvent.preventDefault();
        FraunhoferIAIS.Loading.startIndicator();

        var context = this;

        (new Promise(function(resolve, reject) {
            if (context.files.length = 0) {
                reject(new Error('Konnte keine ausgewählte Datei finden.'));
                return;
            }

            var file = context.files[0];

            if (file.type.match(/(?:^|\/)?xml(?:$|\/)?/) === null) {
                reject(new Error('Falsches Dateiformat. Es wird ein XML Export des Labs erwartet.'));
                return;
            }

            var fileReader = new FileReader();
            fileReader.onload = function(loadEvent) {
                if (loadEvent.target.result.trim() === '') {
                    reject(new Error('Die ausgewählte Datei ist leer.'));
                    return;
                }

                FraunhoferIAIS.Blockly.checkLabExport(loadEvent.target.result, false).then(function() {
                    FraunhoferIAIS.Tutorial.tutorial.initXML = loadEvent.target.result;
                    resolve();
                }).catch(function(error) {
                    reject(error);
                });
            };
            fileReader.readAsText(file);
            setTimeout(function() {
                reject(new Error('Die Datei konnte nicht geladen werden.'));
            }, 5000);

        })).then(function() {
            FraunhoferIAIS.Tutorial.showInitXMLButtons();
        }).catch(function(error) {
            if (error && error.message) {
                FraunhoferIAIS.Notification.showNotification('warning', 'Fehler beim Laden des initialen Programms:', error.message);
            }
        }).then(function() {
            FraunhoferIAIS.Loading.stopIndicator();
        });
    });

    initXMLDelete.addEventListener('click', function(clickEvent) {
        clickEvent.preventDefault();
        delete (FraunhoferIAIS.Tutorial.tutorial.initXML);

        FraunhoferIAIS.Tutorial.showInitXMLButtons();

        checkInitialXMLToFormField(null, null);
    });

    initXMLInsert.addEventListener('click', function(changeEvent) {
        changeEvent.preventDefault();

        FraunhoferIAIS.Loading.startIndicator();

        (new Promise(function(resolve, reject) {
            if (!FraunhoferIAIS.Tutorial.tutorial.initXML) {
                reject(new Error('Es ist kein initiales Programm vorhanden.'));
                return;
            }

            var doubleOptPromise = Promise.resolve();

            if (FraunhoferIAIS.Blockly.programWorkspace !== null) {
                doubleOptPromise = new Promise(function(doubleOptResolve, doubleOptReject) {
                    FraunhoferIAIS.Modal.showConfirmationModal(
                        'Initiales Programm laden',
                        'Wenn Sie das initiale Programm in den aktuellen Schritt laden, wird das bisherige Programm in diesem Schritt verworfen.',
                        doubleOptResolve,
                        doubleOptReject
                    );
                });
            }

            doubleOptPromise.then(function() {
                resolve(FraunhoferIAIS.Tutorial.tutorial.initXML);
            }).catch(function() {
                reject();
            });

        })).then(function(labExport) {
            return FraunhoferIAIS.Blockly.importFromLab(labExport, !FraunhoferIAIS.Blockly.programWorkspace).then(function() {
                return FraunhoferIAIS.Tutorial.persistCurrentProgramInStep();
            });
        }).catch(function(error) {
            if (error && error.message) {
                FraunhoferIAIS.Notification.showNotification('warning', 'Fehler beim Laden des initialen Programms:', error.message);
            }
        }).then(function() {
            FraunhoferIAIS.Loading.stopIndicator();
        });
    });

    FraunhoferIAIS.Tutorial.showInitXMLButtons();
};

FraunhoferIAIS.Tutorial.showInitXMLButtons = function() {
    var initXMLNew = document.getElementById('initXML-new'),
        initXMLEdit = document.getElementById('initXML-edit'),
        initXMLDelete = document.getElementById('initXML-delete'),
        initXMLInsert = document.getElementById('initXML-insert');

    if (FraunhoferIAIS.Tutorial.tutorial.initXML) {
        initXMLNew.style.display = 'none';
        initXMLEdit.style.display = '';
        initXMLDelete.style.display = '';
        initXMLInsert.style.display = '';
    } else {
        initXMLNew.style.display = '';
        initXMLEdit.style.display = 'none';
        initXMLDelete.style.display = 'none';
        initXMLInsert.style.display = 'none';
    }
};


FraunhoferIAIS.Tutorial.loadProgramFromCookie = function() {
    if (!Cookies || !Cookies.get('tutorial')) {
        return;
    }

    var currentTutorial = FraunhoferIAIS.Tutorial.tutorial;
    try {
        var newTutorial = JSON.parse(Cookies.get('tutorial'));
        if (!newTutorial.overview) {
            throw new Error('Incorrect tutorial format');
        }
        FraunhoferIAIS.Tutorial.tutorial = newTutorial;
    } catch (error) {
        if (FraunhoferIAIS.Notification) {
            FraunhoferIAIS.Notification.showNotification('warning', 'Fehler beim Laden des letzten Stands', 'Der letzte Stand des Tutorials konnte nicht wiederhergestellt werden.');
        }
    }
};

window.addEventListener('load', function() {
    FraunhoferIAIS.Template.loadTemplates();
    FraunhoferIAIS.Modal.initModalPopups();
    FraunhoferIAIS.Notification.initNotifications();
    FraunhoferIAIS.Loading.initIndicator();
    FraunhoferIAIS.Toggle.init();
    //FraunhoferIAIS.Tutorial.loadProgramFromCookie();
    Promise.all([
        FraunhoferIAIS.Blockly.replaceRobot(FraunhoferIAIS.Tutorial.tutorial.robot),
        FraunhoferIAIS.Blockly.replaceLanguage(FraunhoferIAIS.Tutorial.tutorial.language)
    ]).then(function() {
        FraunhoferIAIS.Blockly.initConfigurationWorkspace();
        FraunhoferIAIS.Blockly.initProgramWorkspace();
    });
    FraunhoferIAIS.Tutorial.initFormFields();
    FraunhoferIAIS.Tutorial.initStepSettings();
    FraunhoferIAIS.Tutorial.initTabs();
    FraunhoferIAIS.Tutorial.initGlobalEvents();
    FraunhoferIAIS.Tutorial.initStepMenu();
    /*
    FraunhoferIAIS.Input.addHandleInputChangeCallback('*', function(inputName, oldValue, newValue) {
        if (Cookies) {
            Cookies.set('tutorial', JSON.stringify(FraunhoferIAIS.Tutorial.tutorial));
        }
    });
    */
});

FraunhoferIAIS.Tutorial.setAnswer = function(currentValue, newAnswer, objectPath) {
    var answerCorrect = String(currentValue).indexOf('!') !== 0 && currentValue !== '',
        currentAnswer = answerCorrect ? currentValue : currentValue.substring(1);

    if (currentAnswer === newAnswer) {
        return;
    }

    var parent = FraunhoferIAIS.Tutorial,
        keys = objectPath.split('.');

    for (var i = 0; i < keys.length - 2; i++) {
        parent = parent[keys[i]];
    }

    parent[keys[i]] = (answerCorrect ? '' : '!') + newAnswer;
};

FraunhoferIAIS.Tutorial.setAnswerToFormField = function(answer, formField) {
    formFieldvalue = answer.indexOf('!') !== 0 ? answer : answer.substring(1);
};

FraunhoferIAIS.Tutorial.setAnswerCorrectState = function(currentValue, newCorrectState, objectPath) {
    var currentCorrectState = String(currentValue).indexOf('!') !== 0 && currentValue !== '';

    newCorrectState = !!newCorrectState;

    if (currentCorrectState === newCorrectState) {
        return;
    }

    var parent = FraunhoferIAIS.Tutorial,
        keys = objectPath.split('.');

    for (var i = 0; i < keys.length - 2; i++) {
        parent = parent[keys[i]];
    }

    parent[keys[i]] = newCorrectState ? currentValue.substring(1) : '!' + currentValue;
};

FraunhoferIAIS.Tutorial.setAnswerCorrectStatToFormField = function(answer, formField) {
    formField.checked = answer.indexOf('!') !== 0 && answer !== '';
};

FraunhoferIAIS.Tutorial.toggleMaxBlocks = function(step, useMaxBlocks, objectPath) {
    if (useMaxBlocks) {
        step.maxBlocks = FraunhoferIAIS.Tutorial.calculateMaxBlocks();
    } else {
        delete step.maxBlocks;
    }
};

FraunhoferIAIS.Tutorial.toggleMaxBlocksToFormField = function(step, formField) {
    formField.checked = !!step.maxBlocks;
};

FraunhoferIAIS.Tutorial.addMaxBlocks = function(step, extraBlocks, objectPath) {
    if (step.maxBlocks) {
        step.maxBlocks = FraunhoferIAIS.Tutorial.calculateMaxBlocks();
    }
};

FraunhoferIAIS.Tutorial.addMaxBlocksToFormField = function(step, formField) {
    formField.value = step.maxBlocks
        ? step.maxBlocks - Blockly.Xml.workspaceToDom(FraunhoferIAIS.Blockly.programWorkspace).querySelectorAll('block[intask="true"]').length
        : 0;
};

FraunhoferIAIS.Tutorial.toggleToolboxLimit = function(step, toolBoxState, objectPath) {
    switch (toolBoxState) {
        case 'expert':
        case 'beginner':
            step.toolbox = FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox[toolBoxState];
            break;
        default:
            //true means, that it will be gathered upon the next relevant event
            step.toolbox = true;
    }
};

FraunhoferIAIS.Tutorial.toggleToolboxLimitToFormField = function(step, formField) {
    if (!step.toolbox
        || !FraunhoferIAIS.Blockly
        || !FraunhoferIAIS.Blockly.robotCache
        || !FraunhoferIAIS.Blockly.currentRobot
        || !FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot]) {

        formField.checked = formField.value === 'beginner';
        return;
    }

    if (formField.value === 'expert') {
        formField.checked = step.toolbox === FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.expert;
        return;
    }

    if (formField.value === 'beginner') {
        formField.checked = step.toolbox === FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.beginner;
        return;
    }

    if (formField.value === 'program') {
        formField.checked = step.toolbox !== FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.beginner
            && step.toolbox !== FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.expert;
        return;
    }
};

FraunhoferIAIS.Tutorial.toggleSolution = function(step, solutionActive, objectPath) {
    if (!solutionActive) {
        delete step.solution;
    } else if (!step.solution) {
        //true means, that it will be rendered upon the next relevant event
        step.solution = true;
    }
};

FraunhoferIAIS.Tutorial.toggleSolutionToFormField = function(step, formField) {
    formField.checked = !!step.solution;
};

FraunhoferIAIS.Tutorial.setHeader = function(step, header, objectPath) {
    var addStepNumberCheckbox = document.getElementById('step-add-number-to-header');

    if (addStepNumberCheckbox.checked && header !== '') {
        header = 'Schritt '
            + (FraunhoferIAIS.Tutorial.tutorial.step.indexOf(step) + 1) + ': ' + header;
    }

    step.header = header;
};

FraunhoferIAIS.Tutorial.setHeaderToFormField = function(step, formField) {
    var parts = step.header.match(/^Schritt \d+\: (.+)/);

    formField.value = parts !== null && parts.length > 1 ? parts[1] : step.header;
};

FraunhoferIAIS.Tutorial.addStepNumberToHeader = function(step, addStepNumber, objectPath) {
    var parts = step.header.match(/^Schritt \d+\: (.+)/);

    if (parts !== null && parts.length > 1) {
        step.header = parts[1];
    }

    if (addStepNumber && step.header !== '') {
        step.header = 'Schritt ' + (FraunhoferIAIS.Tutorial.tutorial.step.indexOf(step) + 1) + ': ' + step.header;
    }
};

FraunhoferIAIS.Tutorial.addStepNumberToHeaderToFormField = function(step, formField) {
    formField.checked = step.header.match(/^Schritt \d+\: .+/);
};

FraunhoferIAIS.Tutorial.checkInitialXML = function(step, labExport, objectPath) {
    //TODO: Check is initialXML is actually a Lab Export
    debugger;
};

FraunhoferIAIS.Tutorial.checkInitialXMLToFormField = function(step, formField) {
    debugger;
};