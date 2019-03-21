var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Template = FraunhoferIAIS.Template || {};

FraunhoferIAIS.Template.templates = FraunhoferIAIS.Template.templates || {};

FraunhoferIAIS.Template.initialized = FraunhoferIAIS.Template.initialized || false;

FraunhoferIAIS.Template.loadTemplates = function () {
    var templateContainer = document.getElementById('templates'),
        templates = document.querySelectorAll('#templates > *');
    
    if (!templateContainer) {
        return;
    }
    
    [].slice.call(templates).forEach(function(template) {
        if (!template.getAttribute('id')) {
            return;
        }
        
        FraunhoferIAIS.Template.templates[template.getAttribute('id')] = template;
        template.removeAttribute('id');
        templateContainer.removeChild(template);
    });
    templateContainer.parentNode.removeChild(templateContainer);
    FraunhoferIAIS.Template.initialized = true;
}

FraunhoferIAIS.Template.getTemplate = function (templateKey) {
    if (!FraunhoferIAIS.Template.initialized) {
        FraunhoferIAIS.Template.loadTemplates();
    }
    
    if (!FraunhoferIAIS.Template.templates[templateKey]) {
        return null;
    }
    return FraunhoferIAIS.Template.templates[templateKey].cloneNode(true);
}