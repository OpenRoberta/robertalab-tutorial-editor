var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Toggle = FraunhoferIAIS.Toggle || {};

FraunhoferIAIS.Toggle.init = function () {
    [].slice.call(document.querySelectorAll('.iais-toggle')).forEach(function(toggle) {
        if (!toggle.dataset || !toggle.dataset.target) {
            return;
        }
        
        var target = document.getElementById(toggle.dataset.target);
        
        if (target) {
            FraunhoferIAIS.Toggle.registerToggleWithTargetElement(toggle, target, !toggle.dataset.state || toggle.dataset.state !== 'false');
        } else {
            FraunhoferIAIS.Toggle.registerToggleWithIdentifierString(toggle, toggle.dataset.target);
        }
    });
}

FraunhoferIAIS.Toggle.registerToggleWithTargetElement = function(toggle, target, initialState) {
    if (!toggle || !target) {
        return;
    }
    
    [].slice.call(target.querySelectorAll('.iais-close')).forEach(function(closeButton) {
        closeButton.addEventListener('click', function(evt) {
            evt.preventDefault();

            target.style.display = 'none';
            toggle.dataset.state = 'false';
        });
    });
    
    toggle.addEventListener('click', function(evt) {
        evt.preventDefault();
        
        if (toggle.dataset.state && toggle.dataset.state === 'true') {
            toggle.dataset.state = 'false';
            target.style.display = 'none';
        } else {
            toggle.dataset.state = 'true';
            target.style.display = '';
        }
    });
    
    if (initialState) {
        target.style.display = '';
        toggle.dataset.state = 'true';
    } else {
        target.style.display = 'none';
        toggle.dataset.state = 'false';
    }
}

FraunhoferIAIS.Toggle.registerToggleWithTargetIdentifier = function(toggle, targetIdentifier) {
    if (!toggle || !targetIdentifier) {
        return;
    }
    
    toggle.dataset.state = 'false';

    toggle.addEventListener('click', function(evt) {
        evt.preventDefault();
        
        var target = document.getElementById(toggle.dataset.target);
        
        if (!target) {
            toggle.dataset.state = 'false';
            return;
        }
        
        if (!target.dataset.toggleInitialized || target.dataset.toggleInitialized !== 'true') {
            [].slice.call(target.querySelectorAll('.iais-close')).forEach(function(closeButton) {
                closeButton.addEventListener('click', function(evt) {
                    evt.preventDefault();

                    target.style.display = 'none';
                    toggle.dataset.state = 'false';
                });
            });
            
            target.dataset.toggleInitialized = 'true'
        }
        
        if (toggle.dataset.state && toggle.dataset.state === 'true') {
            toggle.dataset.state = 'false';
            target.style.display = 'none';
        } else {
            toggle.dataset.state = 'true';
            target.style.display = '';
        }
    });
}