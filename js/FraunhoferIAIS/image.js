var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Image = FraunhoferIAIS.Image || {};

FraunhoferIAIS.Image.convertImageHrefToBase64 = function (image) {
    var href = image.getAttribute('xlink:href'),
        isDataUrl = href.match(/^data\:([^;]+)\;([^,]+)\,(.+)/);
    if (isDataUrl === null) {
        //Its a link
        if (href.indexOf('/media/') !== -1) {
            href = href.replace(/.+\/media\//, FraunhoferIAIS.Blockly.blocklyPath + '/media/');
        }
        
        return new Promise(function(resolve) {
            var img = document.createElement('img'),
                base64DataUrl;
            
            img.addEventListener('load', function() {
                var canvas = document.createElement('canvas'),
                    ctx = canvas.getContext('2d');
                canvas.height = img.naturalHeight;
                canvas.width = img.naturalWidth;
                ctx.drawImage(img, 0, 0);
                
                base64DataUrl = canvas.toDataURL('image/png', 1);
                if (base64DataUrl) {
                    image.setAttribute('xlink:href', base64DataUrl);
                }
                resolve();
            });
            
            img.addEventListener('error', function(error) {
                image.setAttribute('xlink:href', href);
                console.log('Could not load: "' + href + '". Original url: "' + image.getAttribute('xlink:href') + '"');
                resolve();
            });
            
            img.src = href;
            
            if (img.complete || img.complete === undefined) {
              img.src = '';
              img.src = href;
            };
        });
    } else {
        if (isDataUrl[2] === 'base64') {
            return Promise.resolve(null);
        }
        
        switch (isDataUrl[1]) {
        case 'image/png':
            consolge.log('Blob PNG to base64 currently not implemented.');
            return Promise.resolve(null);
        case 'image/svg+xml':
            var svg = decodeURIComponent(isDataUrl[3]);
            return new Promise(function(resolve){
                FraunhoferIAIS.Image.svgToPngBase64DataUrl(svg).then(function(pngString){
                    if (pngString !== '') {
                        image.setAttribute('xlink:href', pngString);
                    }
                    resolve();
                });
            });
        }
    }
}

FraunhoferIAIS.Image.svgToPngBase64DataUrl = function (svgString) {
    if (!window['canvg']) {
        console.log('The canvg library is necessary to convert a svg to a base64 png dataUrl');
        return Promise.resolve('');
    }
    return new Promise(function(resolve) {
        svgString = svgString
                        .replace(/\&(?:\#160|\#xA0|nbsp)\;/g, '<tspan>&#160;</tspan>')
                        .replace(/(\<image.*?)xlink:href=\"(?:https?:)?\/\/(?:\w|\-|\/|\.|\d|\&|\?|\=|\#)+\"(.*?><\/image>)/, '$1$2');
        var canvas = document.createElement('canvas');
        canvg(canvas, svgString, {
            log: true,
            ignoreMouse: true,
            ignoreAnimation: true,
            renderCallback: function(data) {
                resolve(canvas.toDataURL());
            }
        });
    });
}