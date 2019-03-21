var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Text = FraunhoferIAIS.Text || {};

FraunhoferIAIS.Text.setStylesInline = function(text) {
    text.style['font-family'] =  'sans-serif';
    if (text.getAttribute('class') && text.getAttribute('class').trim().match(/(?:^|\s)brick\_label(?:\s|$)/) !== null) {
        text.style['fill'] = 'rgb(0, 0, 0)';
        text.style['font-weight'] = 'bold';
        text.style['font-size'] = '14pt';
    } else {
        text.style['fill'] = '#FFFFFF';
        text.style['font-size'] =  '11pt';
    }
}

FraunhoferIAIS.Text.setBackgroundStylesInline = function(rect) {
    if (!rect.style['fill']) {
        rect.style['fill'] = '#FFFFFF';
        rect.style['fill-opacity'] =  0.6;
    }
}

FraunhoferIAIS.Text.decodeEntities = function (encodedString) {
    var textArea = document.createElement('textarea');
    return encodedString.replace(/\&(\#x[0-9a-fA-F]+|\#\d+|[^;]{2,6})\;/g, function(match, p1, offset, string) {
        textArea.innerHTML = match;
        return '&#' + textArea.value.charCodeAt(0) + ';';
    });
}