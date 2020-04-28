var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Input = FraunhoferIAIS.Input || {};

FraunhoferIAIS.Input.init = function (objectContainer) {
    FraunhoferIAIS.Input.initSpecificInputs(objectContainer, document.querySelectorAll('input:not([type="file"]), select, textarea'));
}

FraunhoferIAIS.Input.initSpecificInputs = function (objectContainer, inputs) {
    [].slice.call(inputs).forEach(function(input) {
        input.addEventListener('change', function (event) {
            //Do not prevent default, because this is necessary for the textarea.
            FraunhoferIAIS.Input.handleInputChange(event, objectContainer, input);
        });
    });
}

FraunhoferIAIS.Input.refreshing = FraunhoferIAIS.Input.refreshing || false;

FraunhoferIAIS.Input.blockHandling = function() {
    FraunhoferIAIS.Input.refreshing = true;
}

FraunhoferIAIS.Input.continueHandling = function() {
    FraunhoferIAIS.Input.refreshing = false;
}

FraunhoferIAIS.Input.handleInputChangeCallbacks = FraunhoferIAIS.Input.handleInputChangeCallbacks || {};

FraunhoferIAIS.Input.addHandleInputChangeCallback = function (name, callback) {
    if (!FraunhoferIAIS.Input.handleInputChangeCallbacks[name]) {
        FraunhoferIAIS.Input.handleInputChangeCallbacks[name] = [];
    }
    FraunhoferIAIS.Input.handleInputChangeCallbacks[name].push(callback);
}

FraunhoferIAIS.Input.handleInputChange = function(changeEvent, objectContainer, input) {
    //Do not prevent default, because this is necessary for the textarea.
    if (FraunhoferIAIS.Input.refreshing) {
        return;
    }
    
    var attributePath = input.name.split('.'),
        parent = objectContainer,
        targetAttribute = attributePath[attributePath.length - 1],
        value = input.value,
        oldValue;
    
    if (input.tagName.toUpperCase() === 'INPUT' && ['checkbox'].indexOf(input.type.toLowerCase()) !== -1) {
        value = input.checked;
    }
    
    parent = FraunhoferIAIS.Input.traversePathToNodeParent(attributePath, objectContainer, true);
    
    if (typeof objectContainer[targetAttribute] === 'function') {
        oldValue = typeof parent === 'object' || typeof parent === 'array' ? '' : parent;
        objectContainer[targetAttribute](parent, value, input.name);
        value = typeof parent === 'object' || typeof parent === 'array' ? value : parent;
    } else {
        oldValue = parent[targetAttribute];
        parent[targetAttribute] = value;
    }
    
    if (FraunhoferIAIS.Input.handleInputChangeCallbacks[input.name]) {
        FraunhoferIAIS.Input.handleInputChangeCallbacks[input.name].forEach(function(callback){
            callback(oldValue, value);
        });
    }
    
    if (FraunhoferIAIS.Input.handleInputChangeCallbacks['*']) {
        FraunhoferIAIS.Input.handleInputChangeCallbacks['*'].forEach(function(callback) {
            callback(input.name, oldValue, value);
        });
    }
}

FraunhoferIAIS.Input.traversePathToNodeParent = function(pathArray, parentObject, forcePath) {
    for (var i = 0; i < pathArray.length - 1; i++) {
        if (!parentObject.hasOwnProperty(pathArray[i]) || parentObject[pathArray[i]] === undefined) {
            
            if (!forcePath) {
                return null;
            }
            
            parentObject[pathArray[i]] = 
                //If is numeric => new array : else new object
                !isNaN(parseFloat(pathArray[i + 1])) 
                && isFinite(pathArray[i + 1]) 
                    ? [] 
                    : {};
        }
        parentObject = parentObject[pathArray[i]];
    }
    
    return parentObject;
}

FraunhoferIAIS.Input.loadInputValueFromObject = function (objectContainer, input) {
    FraunhoferIAIS.Input.blockHandling();
    
    var attributePath = input.name.split('.'),
        parent = FraunhoferIAIS.Input.traversePathToNodeParent(attributePath, objectContainer, false),
        targetAttribute = attributePath[attributePath.length - 1],
        ckeditInput = (input.tagName.toUpperCase() === 'TEXTAREA' && input.classList.contains('rich-text-edit')),
        checkInput = !ckeditInput && input.tagName.toUpperCase() === 'INPUT' && ['checkbox'].indexOf(input.type.toLowerCase()) !== -1;
    
    if (parent === null) {
        if (checkInput) {
            input.checked = false;
        } else if (ckeditInput) {
            CKEDITOR.instances[input.id].setData('');
        } else {
            input.value = '';
        }
    } else {
        if (typeof objectContainer[targetAttribute + 'ToFormField'] === 'function') {
            objectContainer[targetAttribute + 'ToFormField'](parent, input);
        } else if (checkInput) {
            input.checked = !!parent[targetAttribute];
        } else if (ckeditInput) {
            CKEDITOR.instances[input.id].setData(parent[targetAttribute] || '');
        } else {
            input.value = parent[targetAttribute] || '';
        }
    }
    
    FraunhoferIAIS.Input.continueHandling();
}