var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Modal = FraunhoferIAIS.Modal || {};

FraunhoferIAIS.Modal.template = FraunhoferIAIS.Modal.template || null;

FraunhoferIAIS.Modal.initModalPopups = function () {
    if (!FraunhoferIAIS.Template) {
        return;
    }
    FraunhoferIAIS.Modal.messageTemplate = FraunhoferIAIS.Template.getTemplate('modal-popup-message');
    FraunhoferIAIS.Modal.confirmTemplate = FraunhoferIAIS.Template.getTemplate('modal-popup-confirm');
}

FraunhoferIAIS.Modal.showMessageModal = function (headline, content, element) {
    if (!FraunhoferIAIS.Modal.messageTemplate) {
        return;
    }
    var modal = FraunhoferIAIS.Modal.messageTemplate.cloneNode(true);
    modal.querySelector('span.iais-confirm').addEventListener('click', function(evt) {
        evt.preventDefault();
        document.body.removeChild(modal);
    });
    modal.querySelector('section > header > *').innerHTML = headline;
    modal.querySelector('section > p').innerHTML = content;
    element && modal.querySelector('section > p').appendChild(element);
    modal.style.display = 'block';
    document.body.appendChild(modal);
}

FraunhoferIAIS.Modal.showConfirmationModal = function (headline, content, successHandler, declineHandler) {
    if (!FraunhoferIAIS.Modal.confirmTemplate) {
        successHandler && successHandler();
        return;
    }
    var modal = FraunhoferIAIS.Modal.confirmTemplate.cloneNode(true),
        confirmButton = modal.querySelector('.iais-confirm');

    [].slice.call(modal.querySelectorAll('.iais-close')).forEach(function(closeButton) {
        closeButton.addEventListener('click', function(evt) {
            evt.preventDefault();
            document.body.removeChild(modal);
            declineHandler && declineHandler();
        });
    });
    modal.querySelector('.iais-confirm').addEventListener('click', function(evt) {
        evt.preventDefault();
        document.body.removeChild(modal);
        successHandler && successHandler();
    });
    modal.querySelector('section > header > *').textContent = headline;
    modal.querySelector('section > p').textContent = content;
    document.body.appendChild(modal);
    modal.style.display = 'none';
    modal.style.display = '';
}