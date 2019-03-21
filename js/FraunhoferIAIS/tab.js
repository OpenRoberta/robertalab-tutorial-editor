var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Tab = FraunhoferIAIS.Tab || {};

FraunhoferIAIS.Tab.groups = FraunhoferIAIS.Tab.groups || {};

FraunhoferIAIS.Tab.registerGroup = function(groupIdentifier, wrapper) {
    if (!FraunhoferIAIS.Tab.groups[groupIdentifier]) {
        FraunhoferIAIS.Tab.groups[groupIdentifier] = {
                wrapper: wrapper,
                currentTab: null,
                tabs: []
        };
    }
};

FraunhoferIAIS.Tab.registerTab = function(group, toggleButton, tab) {
    if (!group || !FraunhoferIAIS.Tab.groups[group] || !toggleButton || !tab) {
        return;
    }
    
    var tabObject = {
            toggleButton: toggleButton,
            tab: tab
        };
    
    FraunhoferIAIS.Tab.groups[group].tabs.push(tabObject);
    
    toggleButton.addEventListener('click', function(evt) {
        evt.preventDefault();
        FraunhoferIAIS.Tab.showTab(group, tabObject);
    });
}

FraunhoferIAIS.Tab.removeTab = function(group, tab) {
    if (!group || !tab || !FraunhoferIAIS.Tab.groups[group]) {
        return;
    }
    
    FraunhoferIAIS.Tab.groups[group].tabs =  FraunhoferIAIS.Tab.groups[group].tabs.filter(function(groupTab) {
        return groupTab.tab !== tab;
    });
    
    if (FraunhoferIAIS.Tab.groups[group].currentTab.tab === tab) {
        if (FraunhoferIAIS.Tab.groups[group].tabs.length === 0) {
            FraunhoferIAIS.Tab.groups[group].currentTab = null;
        } else {
            FraunhoferIAIS.Tab.groups[group].currentTab = FraunhoferIAIS.Tab.groups[group].tabs[0];
            FraunhoferIAIS.Tab.showTab(group, FraunhoferIAIS.Tab.groups[group].currentTab);
        }
    }
}

FraunhoferIAIS.Tab.showTab = function(group, tabObject) {
    if (!group || !tabObject || !FraunhoferIAIS.Tab.groups[group] || FraunhoferIAIS.Tab.groups[group].tabs.indexOf(tabObject) === -1) {
        return;
    }
    
    FraunhoferIAIS.Tab.groups[group].tabs.forEach(function(groupTab) {
        groupTab.tab.classList.remove('iais-visible');
        groupTab.toggleButton.classList.remove('iais-active');
    });
    
    tabObject.tab.classList.add('iais-visible');
    tabObject.toggleButton.classList.add('iais-active');
    
    FraunhoferIAIS.Tab.groups[group].currentTab = tabObject;
};