var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Toolbox = FraunhoferIAIS.Toolbox || {};

FraunhoferIAIS.Toolbox.getUsedBlocksSubsetFromCurrentToolbox = function() {
    if (!FraunhoferIAIS.Toolbox.areRequirementsMet()){
        return;
    }
    
    var currentToolBoxDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.expert),
        usedToolBoxBlockTypes,
        toolBoxBlocks,
        blockParent,
        innerCategories,
        categories;
    
    usedToolBoxBlockTypes = FraunhoferIAIS.Toolbox.getUsedBlocksFromCurrentProgram(); 
    
    toolBoxBlocks = currentToolBoxDom.querySelectorAll('block[type]');
    
    for (var i = 0; i < toolBoxBlocks.length; i++) {
        if (usedToolBoxBlockTypes.indexOf(toolBoxBlocks[i].attributes.type.value) === -1) {
            blockParent = toolBoxBlocks[i].parentNode;
            blockParent.removeChild(toolBoxBlocks[i]);
            if (blockParent.children.length === 0) {
                blockParent.parentNode.removeChild(blockParent);
            }
        }
    }
    
    innerCategories = currentToolBoxDom.querySelectorAll('category category');
    
    for (var i = 0; i < innerCategories.length; i++) {
        while (innerCategories[i].children.length > 0) {
            innerCategories[i].parentNode.appendChild(innerCategories[i].children[0]);
        }
        innerCategories[i].parentNode.removeChild(innerCategories[i]);
    }
    
    categories = currentToolBoxDom.querySelectorAll('category');
    
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].children.length === 0 
            && (categories[i].attributes.name.value !== 'TOOLBOX_PROCEDURE' || (
                    usedToolBoxBlockTypes.indexOf('robProcedures_defnoreturn') === -1
                    && usedToolBoxBlockTypes.indexOf('robProcedures_defreturn') === -1)
                )
            && (categories[i].attributes.name.value !== 'TOOLBOX_VARIABLE' || (
                    usedToolBoxBlockTypes.indexOf('robGlobalVariables_declare') === -1 
                    && usedToolBoxBlockTypes.indexOf('robLocalVariables_declare') === -1)
                )
            ) {
            categories[i].parentNode.removeChild(categories[i]);
        }
    }
    
    return Blockly.Xml.domToText(currentToolBoxDom);
}

FraunhoferIAIS.Toolbox.getCurrentToolboxWithDeactivatedBlocks = function() {
    //TODO: Work in Progress
    if (!FraunhoferIAIS.Toolbox.areRequirementsMet()){
        return;
    }
    
    var beginnerToolboxDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.beginner),
        usedToolBoxBlockTypes,
        beginnerToolBoxBlocks,
        blockParent,
        innerCategories,
        categories;
    
    usedToolBoxBlockTypes = FraunhoferIAIS.Toolbox.getUsedBlocksFromCurrentProgram(); 
    
    beginnerToolBoxBlocks = beginnerToolboxDom.querySelectorAll('block[type]');
    
    for (var i = 0; i < beginnerToolBoxBlocks.length; i++) {
        if (usedToolBoxBlockTypes.indexOf(beginnerToolBoxBlocks[i].attributes.type.value) === -1) {
            beginnerToolBoxBlocks[i].setAttribute('disabled', true);
        }
    }
    
    innerCategories = currentToolBoxDom.querySelectorAll('category category');
    
    for (var i = 0; i < innerCategories.length; i++) {
        while (innerCategories[i].children.length > 0) {
            innerCategories[i].parentNode.appendChild(innerCategories[i].children[0]);
        }
        innerCategories[i].parentNode.removeChild(innerCategories[i]);
    }
    
    categories = currentToolBoxDom.querySelectorAll('category');
    
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].children.length === 0 
            && (categories[i].attributes.name.value !== 'TOOLBOX_PROCEDURE' || (
                    usedToolBoxBlockTypes.indexOf('robProcedures_defnoreturn') === -1
                    && usedToolBoxBlockTypes.indexOf('robProcedures_defreturn') === -1)
                )
            && (categories[i].attributes.name.value !== 'TOOLBOX_VARIABLE' || (
                    usedToolBoxBlockTypes.indexOf('robGlobalVariables_declare') === -1 
                    && usedToolBoxBlockTypes.indexOf('robLocalVariables_declare') === -1)
                )
            ) {
            categories[i].parentNode.removeChild(categories[i]);
        }
    }
    
    return Blockly.Xml.domToText(currentToolBoxDom);
}

FraunhoferIAIS.Toolbox.getUsedBlocksFromCurrentProgram = function() {
    if (!FraunhoferIAIS.Toolbox.areRequirementsMet()){
        return;
    }
    
    var currentProgramDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.currentProgram),
        defaultProgramDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.prog),
        currentToolBoxDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.toolbox.expert),
        usedBlockTypes = FraunhoferIAIS.Toolbox.getDistinctBlockTypesForProgram(currentProgramDom),
        defaultBlockTypes = FraunhoferIAIS.Toolbox.getDistinctBlockTypesForProgram(defaultProgramDom);
    
    return usedBlockTypes.filter(function(usedBlockType) {
        return defaultBlockTypes.indexOf(usedBlockType) === -1;
    });
}

FraunhoferIAIS.Toolbox.areRequirementsMet = function() {
    if (!Blockly 
            || !FraunhoferIAIS.Blockly 
            || !FraunhoferIAIS.Blockly.robotCache 
            || !FraunhoferIAIS.Blockly.currentRobot 
            || !FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot]) {
        
        if (FraunhoferIAIS.Notification) {
            var message = 'Die benötigten Softwarepakete konnten nicht geladen werden. Ein neues Laden der Seite könnte das Problem lösen.';
            if (Blockly && FraunhoferIAIS.Blockly) {
                if (!FraunhoferIAIS.Blockly.robotCache) {
                    message = 'Die Robotersysteme konnten nicht geladen werden. Ein neues Laden der Seite könnte das Problem lösen.';
                } else if (!FraunhoferIAIS.Blockly.currentRobot) {
                    message = 'Es scheint, als wäre aktuell kein Robotersystem ausgewählt. Es muss zunächst ein Robotersystem gewählt werden um die Toolbox zu erstellen.';
                } else {
                    message = 'Die Toolbox-Daten des ausgewählten Robotersystems konnten nicht gefunden werden. Dies scheint auf einen Bug zu schließen, der gemeldet werden sollte.';
                }
            }
            FraunhoferIAIS.Notification.showNotification('warning', 'Fehler beim Erstellen der Toolbox', message);
        }
        return false;
    }
    return true;
}

FraunhoferIAIS.Toolbox.getDistinctBlockTypesForProgram = function(rootElement) {
    var blocks = [].slice.call(rootElement.querySelectorAll('block[type]')),
        blockTypes = [];
    
    //Check if the root itself is a block
    if (rootElement.tagName.toUpperCase() === 'block' && rootElement.getAttribute('type')) {
        blocks.push(rootElement);
    }
    
    for (var i = 0; i < blocks.length; i++) {
        blockTypes.push(blocks[i].attributes.type.value);
    }
    
    return blockTypes.filter(function(blockType, index, blockTypes) {
            return blockTypes.indexOf(blockType) === index;
        });
}