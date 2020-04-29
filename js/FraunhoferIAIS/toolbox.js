var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Toolbox = FraunhoferIAIS.Toolbox || {};

FraunhoferIAIS.Toolbox.toolBoxCache = FraunhoferIAIS.Toolbox.toolBoxCache || {};

FraunhoferIAIS.Toolbox.getUsedBlocksSubsetFromCurrentToolbox = function() {
    if (!FraunhoferIAIS.Toolbox.areRequirementsMet()){
        return;
    }
    
    var currentToolBoxDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.getCurrentProgramToolbox('expert')),
        usedToolBoxBlockTypes,
        usedToolBoxDuplicatesRelationPaths,
        toolBoxBlocks,
        blockType,
        blockParent,
        innerCategories,
        categories;
    
    usedToolBoxBlockTypes = FraunhoferIAIS.Toolbox.getUsedBlocksFromCurrentProgram(false); 
    usedDuplicateRelationPaths = FraunhoferIAIS.Toolbox.getDuplicateRelationPaths(usedToolBoxBlockTypes);
    
    //TODO: implement its usage in the while loop below
    
    toolBoxBlocks = currentToolBoxDom.querySelectorAll('block[type]');
    
    for (var i = 0; i < toolBoxBlocks.length; i++) {
        blockType = toolBoxBlocks[i].getAttribute('type');
        if (usedToolBoxBlockTypes.indexOf(blockType) === -1
                || usedDuplicateRelationPaths[blockType] && !usedDuplicateRelationPaths[blockType].reduce(function (found, relation) {
                    return found || FraunhoferIAIS.Toolbox.traverseTopDown(toolBoxBlocks[i], {[blockType]: relation});
                }, false)) {
            blockParent = toolBoxBlocks[i].parentNode;
            if (blockParent.tagName.toLowerCase() === 'category') {
                blockParent.removeChild(toolBoxBlocks[i]);
                if (blockParent.children.length === 0) {
                    blockParent.parentNode.removeChild(blockParent);
                }
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
        if (categories[i].attributes.name.value === 'TOOLBOX_ACTION' && usedToolBoxBlockTypes.length === 0) {
            continue;
        }
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

FraunhoferIAIS.Toolbox.getUsedBlocksFromCurrentProgram = function(includeImplicitBlocks = true) {
    if (!FraunhoferIAIS.Toolbox.areRequirementsMet()){
        return;
    }
    
    var currentProgramDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.currentProgram),
        defaultProgramDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.robotCache[FraunhoferIAIS.Blockly.currentRobot].program.prog),
        usedBlockTypes = FraunhoferIAIS.Toolbox.getDistinctBlockTypesForProgram(currentProgramDom, includeImplicitBlocks),
        defaultBlockTypes = FraunhoferIAIS.Toolbox.getDistinctBlockTypesForProgram(defaultProgramDom, includeImplicitBlocks);
    
    return usedBlockTypes.filter(function(usedBlockType) {
        return defaultBlockTypes.indexOf(usedBlockType) === -1;
    });
}

FraunhoferIAIS.Toolbox.getDuplicateRelationPaths = function (blockTypes) {
    var topDownRelations = FraunhoferIAIS.Toolbox.getBlockRelationObjectForCurrentRobot().topDownRelations,
        blockMatches = {},
        currentProgram = null,
        blocks,
        matchingRelations,
        distinctMatches = [];
    
    for (var blockType in topDownRelations) {
        if (blockTypes.indexOf(blockType) !== -1) {
            if (currentProgram === null) {
                currentProgram = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.currentProgram);
            }
            
            blocks = [].slice.call(currentProgram.querySelectorAll('block[type="' + blockType + '"]'));
            
            matchingRelations = blocks.map(function(block) {
                return FraunhoferIAIS.Toolbox.getMatchingTopDownRelations(block);
            });
            
            
            for (var i = 0; i < matchingRelations.length; i++) {
                if (matchingRelations[i].length === 0) {
                    distinctMatches = topDownRelations[blockType];
                    break;
                } else {
                    matchingRelations[i].forEach(function (relation) {
                        
                        if (distinctMatches.length === topDownRelations[blockType].length) {
                            return;
                        }
                        
                        if (!distinctMatches.reduce(function(found, distinctRelation) {
                            
                            return found || FraunhoferIAIS.Toolbox.compareTopDownRelations(relation, distinctRelation);
                            
                        }, false)) {
                            distinctMatches.push(relation);
                        }
                    });
                }
            }
            
            blockMatches[blockType] = distinctMatches;
        }
    }
    
    return blockMatches;
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

FraunhoferIAIS.Toolbox.getDistinctBlockTypesForProgram = function(rootElement, includeImplizitBlocks = true) {
    var blocks = [].slice.call(rootElement.querySelectorAll('block[type]')),
        blockTypes = [];
    
    if (!includeImplizitBlocks) {
        blocks = blocks.filter(FraunhoferIAIS.Toolbox.hasFullBottomUpRelation);
    }
    
    //Check if the root itself is a block
    if (rootElement.tagName.toLowerCase() === 'block' && rootElement.getAttribute('type')) {
        blocks.push(rootElement);
    }
    
    blockTypes = blocks.map(function(block) {
        return block.getAttribute('type');
    });
    
    return blockTypes.filter(function(blockType, index, blockTypes) {
            return blockTypes.indexOf(blockType) === index;
        });
}

FraunhoferIAIS.Toolbox.blockRelationCache = FraunhoferIAIS.Toolbox.blockRelationCache || [];

FraunhoferIAIS.Toolbox.getBlockRelationObjectForCurrentRobot = function () {
    if (!FraunhoferIAIS.Blockly.currentRobot) {
        return;
    }
    
    if (FraunhoferIAIS.Toolbox.blockRelationCache[FraunhoferIAIS.Blockly.currentRobot]) {
        return FraunhoferIAIS.Toolbox.blockRelationCache[FraunhoferIAIS.Blockly.currentRobot];
    }
    
    var currentToolboxDom = Blockly.Xml.textToDom(FraunhoferIAIS.Blockly.getCurrentProgramToolbox('expert')),
        blocks,
        bottomUpRelations = {},
        topDownRelations = [],
        currentNode = null,
        currentPathElement = null,
        blockType = '',
        currentDepth = 0,
        leafs,
        maxDepth = 0;
    
    //Create Bottom Up relations
    blocks = [].slice.call(currentToolboxDom.querySelectorAll('block[type]'));
    
    blocks.forEach(function (block) {
        currentNode = block;
        currentPathElement = bottomUpRelations;
        blockType = '';
        currentDepth = 0;
        
        while (currentNode !== null && currentNode.nodeName !== '#document') {
            if (currentNode.tagName.toLowerCase() === 'block' && currentNode.getAttribute('type')) {
                blockType = currentNode.getAttribute('type');
                if (!currentPathElement[blockType]) {
                    currentPathElement[blockType] = {};
                }
                currentPathElement = currentPathElement[blockType];
                currentDepth += 1;
            }
            currentNode = currentNode.parentNode || null;
        }
        
        if (currentDepth > maxDepth) {
            maxDepth = currentDepth;
        }
    });
    
    for (var relation in bottomUpRelations) {
        if (Object.keys(bottomUpRelations[relation]).length === 0) {
            delete bottomUpRelations[relation];
        }
    }
    
    //Create Top Down relations
    
    //Get all root blocks, but remove all blocks that do not have any children
    blocks = [].slice.call(currentToolboxDom.querySelectorAll('category > block[type]')).filter(function(block) {
        return block.querySelectorAll('block[type]').length > 0;
    });
    
    blocks.forEach(function(block) {
        topDownRelations.push(FraunhoferIAIS.Toolbox.buildTopDownRelation(block));
    });
    
    topDownRelations = topDownRelations.reduce(function(carry, relationObject) {
        if (!carry[relationObject.type]) {
            carry[relationObject.type] = [];
        }
        
        carry[relationObject.type].push(relationObject.nodeRelations);
        return carry;
    }, {});
    
    for (var topDownType in topDownRelations) {
        if (topDownRelations[topDownType].length < 2) {
            delete topDownRelations[topDownType];
        }
    }
    
    FraunhoferIAIS.Toolbox.blockRelationCache[FraunhoferIAIS.Blockly.currentRobot] = {
            bottomUpRelations: bottomUpRelations,
            topDownRelations: topDownRelations,
            maxDepth: maxDepth
    }
    
    return FraunhoferIAIS.Toolbox.blockRelationCache[FraunhoferIAIS.Blockly.currentRobot];
}

FraunhoferIAIS.Toolbox.buildTopDownRelation = function(block) {
    var leafRelations = [].slice.call(block.querySelectorAll('block[type]'))
        .filter(function(block) {
            //This filters out the block itself, too
            return block.querySelectorAll('block[type]').length === 0;
        }).map(function(leaf) {
            var currentNode = leaf,
                trackedRelations = {},
                blockType;
            while (currentNode !== block) {
                if (currentNode.tagName.toLowerCase() === 'block') {
                    blockType = currentNode.getAttribute('type');
                    if (blockType) {
                        trackedRelations = {[blockType]: trackedRelations};
                    }
                }
                currentNode = currentNode.parentNode;
            }
            return trackedRelations;
        }).reduce(function (carry, leafRelationObject) {
            var currentNode = carry,
                currentRelationNode = leafRelationObject,
                blockType;
            while (currentRelationNode !== null) {
                blockType = Object.keys(currentRelationNode)[0];
                if (!currentNode[blockType]) {
                    currentNode[blockType] = currentRelationNode[blockType];
                    break;
                }
                currentNode = currentNode[blockType];
                currentRelationNode = currentRelationNode[blockType];
            }
            return carry;
        }, {});
    
    return {
            type: block.getAttribute('type'),
            nodeRelations: leafRelations
    };
}

FraunhoferIAIS.Toolbox.hasFullBottomUpRelation = function (block) {
    var blockRelationObject = FraunhoferIAIS.Toolbox.getBlockRelationObjectForCurrentRobot(),
        depth = 0,
        currentRelationNode = blockRelationObject.bottomUpRelations,
        currentNode = block;
    
    if (!currentRelationNode[block.getAttribute('type')]) {
        return true;
    }
    
    while (depth <= blockRelationObject.maxDepth && currentNode !== null && currentNode.nodeName !== '#document') {
        if (currentNode.tagName.toLowerCase() === 'block' && currentNode.getAttribute('type')) {
            currentRelationNode = currentRelationNode[currentNode.getAttribute('type')] || null;
            
            if (currentRelationNode === null) {
                return true;
            } else if (Object.keys(currentRelationNode).length === 0) {
                return false;
            }
            
            depth += 1;
        }
        currentNode = currentNode.parentNode;
    }
    
    return true;
}

FraunhoferIAIS.Toolbox.getMatchingTopDownRelations = function (block) {
    var blockRelationObject = FraunhoferIAIS.Toolbox.getBlockRelationObjectForCurrentRobot(),
        topDownRelations = blockRelationObject.topDownRelations,
        blockType = block.getAttribute('type'),
        childNodes = [],
        onTrack = true,
        matched = false;
    
    if (!blockType || !topDownRelations[blockType]) {
        return null;
    }
    
    return topDownRelations[blockType].filter(function (topDownRelation) {
        return FraunhoferIAIS.Toolbox.traverseTopDown(block, {[blockType]: topDownRelation});
    });
}

FraunhoferIAIS.Toolbox.traverseTopDown = function (root, nextRelations) {
    if (!nextRelations || !root) {
        return false;
    }
    
    if (Object.keys(nextRelations).length === 0) {
        return true;
    }
    
    var childNodes = [root],
        onTrack = null,
        leftPossibilities = Object.keys(nextRelations).length,
        maxBlockDepth = 4;
    
    //breadth search through the child elements
    while (childNodes.length > 0 && leftPossibilities > 0 && maxBlockDepth > 0) {
        childNodes = childNodes.reduce(function (newChildNodes, childNode) {
            if (onTrack === false) {
                return [];
            }
            
            var childNodeType = childNode.getAttribute('type');
            
            if (childNodeType && childNode.tagName && childNode.tagName.toLowerCase() === 'block') {
                if (!nextRelations[childNodeType]) {
                    onTrack = false;
                    return [];
                }
                
                onTrack = childNode.children.length === 0 && Object.keys(nextRelations[childNodeType]).length === 0 
                            || childNode.children.length > 0 && [].slice.call(childNode.children).reduce(function(oneMatch, child) {
                                return oneMatch || FraunhoferIAIS.Toolbox.traverseTopDown(child, nextRelations[childNodeType]);
                            }, false);
                
                leftPossibilities -= 1;
                
                if (leftPossibilities <= 0 || !onTrack) {
                    return [];
                } else {
                    return newChildNodes;
                }
            }
            return newChildNodes.concat(childNode.children.length > 0  ? [].slice.call(childNode.children) : []);
        }, []);
        maxBlockDepth -= 1;
    }
    
    return onTrack || false;
}

FraunhoferIAIS.Toolbox.compareTopDownRelations = function (a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    
    for (var type in a) {
        if (!b[type] || !FraunhoferIAIS.Toolbox.compareTopDownRelations(a[type], b[type])) {
            return false;
        }
    }
    
    return true;
}