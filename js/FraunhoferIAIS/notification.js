var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Notification = FraunhoferIAIS.Notification || {};

FraunhoferIAIS.Notification.template = FraunhoferIAIS.Notification.template || null;
FraunhoferIAIS.Notification.notificationBar = FraunhoferIAIS.Notification.notificationBar || null;

FraunhoferIAIS.Notification.initNotifications = function () {
    if (!FraunhoferIAIS.Template) {
        return;
    }
    FraunhoferIAIS.Notification.template = FraunhoferIAIS.Template.getTemplate('notification');
    
    FraunhoferIAIS.Notification.notificationBar = document.createElement('li');
    FraunhoferIAIS.Notification.notificationBar.setAttribute('id', 'iais-notification-bar');
    
    document.body.appendChild(FraunhoferIAIS.Notification.notificationBar);
}

FraunhoferIAIS.Notification.showNotification = function (type, headline, content) {
    if (!FraunhoferIAIS.Notification.template) {
        return;
    }
    
    if (!type || !headline || !content) {
        console.log('To show a notification, a type, a headline and some content must be provided');
        return;
    }
    
    var notification = FraunhoferIAIS.Notification.template.cloneNode(true),
        unusedIcons;
    
    switch(type) {
        case 'success':
            unusedIcons = notification.querySelectorAll('span.icon:not(.type-success):not(.iais-close)');
            notification.classList.add('success');
            break;
        case 'warning':
            unusedIcons = notification.querySelectorAll('span.icon:not(.type-warning):not(.iais-close)');
            notification.classList.add('warning');
            break;
        default:
        case 'info':
            unusedIcons = notification.querySelectorAll('span.icon:not(.type-info):not(.iais-close)');
            notification.classList.add('info');
            break;
    }
    
    [].slice.call(unusedIcons).forEach(function(unusedIcon) {
        notification.removeChild(unusedIcon);
    });

    notification.querySelector('article > header > *').textContent = headline;
    notification.querySelector('article > p').textContent = content;
    
    notification.querySelector('.iais-close').addEventListener('click', function(){
        FraunhoferIAIS.Notification.notificationBar.removeChild(notification);
    });
    
    FraunhoferIAIS.Notification.notificationBar.appendChild(notification);
    FraunhoferIAIS.Notification.removeNotification(notification, 10000);
}

FraunhoferIAIS.Notification.removeNotification = function(notification, delay) {
    if (!notification) {
        return;
    }
    
    setTimeout(function() {
        if (!FraunhoferIAIS.Notification.notificationBar.querySelector(':hover')) {
            if (FraunhoferIAIS.Notification.notificationBar.contains(notification)) {
                FraunhoferIAIS.Notification.notificationBar.removeChild(notification);
            }
            //else nothing to do anymore
        } else {
            FraunhoferIAIS.Notification.removeNotification(notification, 2000);
        }
    }, delay || 1000);
}