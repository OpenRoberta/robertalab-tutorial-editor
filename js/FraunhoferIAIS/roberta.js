if (!('outerHTML' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'outerHTML', {
        get: function () {
            var temp = document.createElement('div');
            temp.appendChild(this.cloneNode(true));
            return temp.innerHTML;
        },
        enumerable: false,
        configurable: true
    });
}

var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.Roberta = FraunhoferIAIS.Roberta || {};

FraunhoferIAIS.Roberta.createFileObject = function(fileName, data) {
    if (!fileName) {
        fileName = 'file';
    }
    if (!data) {
        data = '';
    }
    return {
        _fileName: fileName,
        _data: data,
        getFileName: function() {
            return fileName;
        },
        getData: function() {
            return data;
        }
    };
}

FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks = [];

FraunhoferIAIS.Roberta.convertSvgImagesToPng = function (svgImageArray) {
    var promises = svgImageArray.map(function(svgObj) {
        var timePromise = new Promise(function(resolve) {
                setTimeout(function() {
                    if (FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks.length > 0) {
                        for(var i = 0; i < FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks.length; i++) {
                            FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks[i]({status: false, data: svgObj});
                        }
                    }
                    resolve(null);
                }, 10000);
            }),
            imagePromise = new Promise(function(resolve) {
                var canvas = document.createElement('canvas'),
                    pngDataPromise = FraunhoferIAIS.Image.svgToPngBase64DataUrl(svgObj.getData());
                
                pngDataPromise.then(function(dataUrl) {
                    if (FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks.length > 0) {
                        for(var i = 0; i < FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks.length; i++) {
                            FraunhoferIAIS.Roberta.convertSvgImagesToPngCallbacks[i]({status: !!dataUrl, data: svgObj});
                        }
                    }
                    if (!!dataUrl) {
                        resolve(
                                FraunhoferIAIS.Roberta.createFileObject(
                                    svgObj.getFileName(), 
                                    dataUrl.replace(/^data\:image\/png\;base64\,/, '')
                                )
                            );
                    } else {
                        resolve(null);
                    }
                });
            });
        return Promise.race([imagePromise, timePromise]);
    });
    
    return Promise.all(promises).then(function (pngImageArray) {
        return pngImageArray.filter(function(obj) {
                return obj !== null;
            });
    });
}

FraunhoferIAIS.Roberta.zipImageArrays = function (imageArrays) {
    if (JSZip == undefined) {
        console.log('The JSZip library was not loaded and therefore the images can not be zipped.');
        FraunhoferIAIS.Notification.showNotification('warning', 'Bilder konnten nicht erzeugt weden:','Das Befüllen der ZIP-Datei war nicht möglich, da die Seite nicht vollständig geladen ist. Laden Sie die Seite neu und versuchen Sie es bitte erneut.');
        return null;
    }
    var zip = JSZip(),
        svgFolder = zip.folder('svg'),
        pngFolder = zip.folder('png');

    for (var s = 0; s < imageArrays.svg.length; s++) {
        svgFolder.file(imageArrays.svg[s].getFileName() + '.svg', imageArrays.svg[s].getData());
    }
    for (var p = 0; p < imageArrays.png.length; p++) {
        pngFolder.file(imageArrays.png[p].getFileName() + '.png', imageArrays.png[p].getData(), {base64: true});
    }
    return zip;
}

FraunhoferIAIS.Roberta.getRangeForSvgRootblocks = function(rootBlocks, whitespace) {
    var minX,
        minY,
        width, 
        translateRegex = /translate\((\-?\d+(?:\.\d+)?),(\-?\d+(?:\.\d+)?)\)/,
        height;
    
    if (!whitespace) {
        whitespace = 0;
    }
    
    minX = Math.min.apply(this, rootBlocks.map(function(rootBlock) {
        var transform = rootBlock.attributes.transform,
            translateValues = transform ? transform.value.match(translateRegex) : null;
        return Math.floor(translateValues && translateValues.length === 3 ? parseInt(translateValues[1]) : 0);
    }));
    minX = minX - whitespace; //whitespace left
    
    minY = Math.min.apply(this, rootBlocks.map(function(rootBlock){
        var transform = rootBlock.attributes.transform,
            translateValues = transform ? transform.value.match(translateRegex) : null;
        return Math.floor(translateValues && translateValues.length === 3 ? parseInt(translateValues[2]) : 0);
    }));
    minY = minY - whitespace; //whitespace top
    
    width = Math.max.apply(this, rootBlocks.map(function(rootBlock){
        var transform = rootBlock.attributes.transform,
            translateValues = transform ? transform.value.match(translateRegex) : null;
            boxData = rootBlock.getBBox();
        return Math.ceil(boxData.width + (translateValues && translateValues.length === 3 ? parseInt(translateValues[1]) : 0));
    }));
    width = width - minX + whitespace; //whitespace right
    
    height = Math.max.apply(this, rootBlocks.map(function(rootBlock){
        var transform = rootBlock.attributes.transform,
            translateValues = transform ? transform.value.match(translateRegex) : null;
            boxData = rootBlock.getBBox();
        return Math.ceil(boxData.height + (translateValues && translateValues.length === 3 ? parseInt(translateValues[2]) : 0));
    }));
    height = height - minY + whitespace; //whitespace bottom
    
    return {
        minX: minX,
        minY: minY,
        width: width,
        height: height
    };
}

FraunhoferIAIS.Roberta.getCurrentProgramAsSvg = function (workspace, whitespace) {
    if (Blockly == undefined) {
        console.log('Blockly was not loaded, so current program can not be extracted.');
        FraunhoferIAIS.Notification.showNotification('warning', 'Bilder konnten nicht erzeugt weden:','Das Auslesen der NEPO-Programmierfläche war nicht möglich, da die Seite nicht vollständig geladen ist. Laden Sie die Seite neu und versuchen Sie es bitte erneut.');
        return Promise.resolve('');
    }
    
    var rootBlocks,
        svgImage,
        translateRegex = /translate\((\-?\d+(?:\.\d+)?),(\-?\d+(?:\.\d+)?)\)/,
        range,
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        promises = [];
    
    if (!whitespace) {
        whitespace = 0;
    }
    
    rootBlocks = workspace
        .getTopBlocks()
        .filter(function(blocklyRootblock) {
            return blocklyRootblock.inTask;
        })
        .map(function(blocklyRootblock) {
            return blocklyRootblock.svgGroup_;
        });
    
    range = FraunhoferIAIS.Roberta.getRangeForSvgRootblocks(rootBlocks, whitespace);
    
    svgImages = rootBlocks.map(function (rootBlock) {
            var clone = rootBlock.cloneNode(true),
                currentTransform = rootBlock.attributes.transform,
                translateValues = currentTransform ? currentTransform.value.match(translateRegex) : null,
                newTransform;
                
            if (!translateValues || translateValues.length < 3) {
                translateValues = ['ignored', 0, 0];
            }
            
            newTransform = 'translate(' + (translateValues[1] - range.minX) + ',' + (translateValues[2] - range.minY) + ')';
            
            clone.setAttribute('transform', newTransform);
            
            return clone;
        });
    
    svgImages.forEach(function(svgImage) {
        svg.appendChild(svgImage);
    });
    
    
    [].slice.call(svg.querySelectorAll('image')).forEach(function(image){
        promises.push(FraunhoferIAIS.Image.convertImageHrefToBase64(image));
    });
    
    [].slice.call(svg.querySelectorAll('.blocklyText')).forEach(function(text) {
        FraunhoferIAIS.Text.setStylesInline(text);
    });
    [].slice.call(svg.querySelectorAll('.blocklyEditableText > rect, .blocklyIconSymbol')).forEach(function(background){
        FraunhoferIAIS.Text.setBackgroundStylesInline(background);
    });
    [].slice.call(svg.querySelectorAll('.blocklyEditableText > .blocklyText')).forEach(function(text) {
        text.style['fill'] = '#000000';
    });
    
    if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)))
    {
        svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    } else {
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    }

    svg.setAttribute('version', '1.1');
    
    svg.setAttribute('height', range.height);
    svg.setAttribute('width', range.width);
    
    svg.setAttribute('viewBox', "0 0 " + range.width + " " + range.height);
    
    return Promise.all(promises).then(function() {
        return svg;
    });
}

FraunhoferIAIS.Roberta.getSequencesOfSvgProgram = function(svgProgram, whitespace) {
    var commandBlockChildren,
        startBlockEndlessLoop = false,
        sequences = [],
        nodeCopy = svgProgram.cloneNode(true),
        nodeCopyChildren = [].slice.call(nodeCopy.childNodes),
        cleanNode = document.createElementNS('http://www.w3.org/2000/svg', svgProgram.tagName);
    
    if (!whitespace) {
        whitespace = 0;
    }
    
    nodeCopyChildren.forEach(function(child) {
        //Appending a node to something removes it from the old parent
        cleanNode.appendChild(child);
    });
    
    if (svgProgram.getAttribute('class') && svgProgram.getAttribute('class').trim().match(/(?:^|\s)blocklyDraggable(?:\s|$)/) !== null) {
        cleanNode.setAttribute('transform', 'translate(' + whitespace + ',' + whitespace + ')');
        sequences.push(cleanNode);
    }
    
    commandBlockChildren = nodeCopyChildren.filter(function(possibleBlock) {
        return possibleBlock.nodeType === 1 
                && possibleBlock.getAttribute('class') && possibleBlock.getAttribute('class').trim().match(/(?:^|\s)blocklyDraggable(?:\s|$)/) !== null
                && 0 === [].slice.call(possibleBlock.childNodes).filter(function(innerChild) {
                    return  innerChild.nodeType === 1 && innerChild.getAttribute('class') && innerChild.getAttribute('class').trim().match(/(?:^|\s)outputType(?:\s|$)/) !== null;
                }).length;
    });
    
    if (commandBlockChildren.length === 0) {
        //Possible start block endless loop (Arduino)
        cleanNode.setAttribute('id', 'currentNodeFraunhoferIAIS');
        commandBlockChildren = cleanNode.querySelectorAll('#currentNodeFraunhoferIAIS > g:not(.blocklyDraggable) > .blocklyDraggable');
        cleanNode.removeAttribute('id');
        startBlockEndlessLoop = commandBlockChildren.length > 0;
    }

    if (commandBlockChildren.length > 0) {
        commandBlockChildren.forEach(function (sequence) {
            if (startBlockEndlessLoop) {
                sequence.parentNode.removeChild(sequence);
            } else {
                cleanNode.removeChild(sequence);
            }
            sequences = sequences.concat(FraunhoferIAIS.Roberta.getSequencesOfSvgProgram(sequence, whitespace));
        });
    }
    return sequences;
}



FraunhoferIAIS.Roberta.getDisabledBlocksAsSvg = function(workspace, whitespace) {
    if (Blockly == undefined) {
        console.log('Blockly was not loaded, so the disabled blocks can not be extracted.');
        FraunhoferIAIS.Notification.showNotification('warning', 'Bilder konnten nicht erzeugt weden:','Das Auslesen der NEPO-Programmierfläche war nicht möglich, da die Seite nicht vollständig geladen ist. Laden Sie die Seite neu und versuchen Sie es bitte erneut.');
        return new Promise(function(resolve){return [];});
    }
    
    var rootBlocks,
        counter = 0;
    
    if (!whitespace) {
        whitespace = 0;
    }
    
    rootBlocks = workspace
        .getTopBlocks()
        .filter(function(blocklyRootblock) {
            return !blocklyRootblock.inTask;
        })
        .map(function(blocklyRootblock) {
            return blocklyRootblock.svgGroup_;
        });
    
    return new Promise(function(resolve) {
        var counter = 1,
            outerPromises = rootBlocks.map(function(rootBlock) {
                var cleanCopy = document.createElementNS('http://www.w3.org/2000/svg', rootBlock.tagName),
                    copy = rootBlock.cloneNode(true),
                    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                    boxData,
                    width,
                    height,
                    innerPromises = [];
        
                boxData = rootBlock.getBBox();
                width = Math.ceil(boxData.width) + whitespace * 2,
                height = Math.ceil(boxData.height) + whitespace * 2;

                [].slice.call(copy.childNodes).forEach(function(child) {
                    cleanCopy.appendChild(child);
                });

                cleanCopy.setAttribute('transform', 'translate(' + whitespace + ',' + whitespace + ')');
                cleanCopy.setAttribute('class', 'blocklyDraggable');
                
                [].slice.call(cleanCopy.querySelectorAll('.blocklyPath[stroke="#000000"]')).forEach(function(path){
                    path.setAttribute('stroke', 'none');
                });
                
                svg.appendChild(cleanCopy);
                
                if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)))
                {
                    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
                } else {
                    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                }
                
                svg.setAttribute('version', '1.1');
                svg.setAttribute('width', width);
                svg.setAttribute('height', height);
                
                svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        
                [].slice.call(svg.querySelectorAll('image')).forEach(function(image) {
                    innerPromises.push(FraunhoferIAIS.Image.convertImageHrefToBase64(image));
                });
                
                [].slice.call(svg.querySelectorAll('.blocklyText')).forEach(function(text) {
                    FraunhoferIAIS.Text.setStylesInline(text);
                });
                [].slice.call(svg.querySelectorAll('.blocklyEditableText > rect, .blocklyIconSymbol')).forEach(function(background){
                    FraunhoferIAIS.Text.setBackgroundStylesInline(background);
                });
                [].slice.call(svg.querySelectorAll('.blocklyEditableText > .blocklyText')).forEach(function(text) {
                    text.style['fill'] = '#000000';
                });
                
                return new Promise(function(innerResolve) {
                    Promise.all(innerPromises).then(function() { 
                        innerResolve(FraunhoferIAIS.Roberta.createFileObject(
                            'extra_block_' + counter++, 
                            FraunhoferIAIS.Text.decodeEntities(svg.outerHTML)
                        ));
                    });
                });
            });
        
        Promise.all(outerPromises).then(function(fileObjects) {
            resolve(fileObjects);
        });
    });
}

FraunhoferIAIS.Roberta.downloadCurrentProgramAsImageZip = function (workspace) {
    var feSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
        whitespace = 6,
        svgProgramPromise = FraunhoferIAIS.Roberta.getCurrentProgramAsSvg(workspace, whitespace),
        programSequences,
        disabledBlocks = FraunhoferIAIS.Roberta.getDisabledBlocksAsSvg(workspace, whitespace),
        svgs,
        counter = 1,
        pngs,
        zip;
    
    return Promise.all([svgProgramPromise, disabledBlocks]).then(function(promiseReturns) {
        var svgProgram = promiseReturns[0],
            disabledBlocks = promiseReturns[1];

        if (!svgProgram && !disabledBlocks) {
            FraunhoferIAIS.Notification.showNotification('warning', 'Bilder konnten nicht erzeugt weden:','Es wurden keine Blöcke als Vorlage für die Bilder gefunden.');
            return;
        }
        
        svgs = [FraunhoferIAIS.Roberta.createFileObject('program', FraunhoferIAIS.Text.decodeEntities(svgProgram.outerHTML))];
        
        programSequences = FraunhoferIAIS.Roberta.getSequencesOfSvgProgram(svgProgram, whitespace);
        
        if (programSequences.length === 1) {
            //If the program only contains one block, the image of the program and the single block is redundant
            programSequences = [];
        }
        
        feSvg.setAttribute('style', 'position: fixed; top: 0; left: -100%;');
        document.body.appendChild(feSvg);
        
        svgs = svgs.concat(programSequences.map(function(innerSvgElement) {
            var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
                boxData,
                width,
                height;
            
            while(feSvg.firstChild) {
                feSvg.removeChild(feSvg.firstChild);
            }
            
            feSvg.appendChild(innerSvgElement.cloneNode(true));

            boxData = feSvg.getBBox();
            width = Math.ceil(boxData.width) + whitespace * 2;
            height = Math.ceil(boxData.height) + whitespace * 2;

            if (navigator.appName == 'Microsoft Internet Explorer' ||  !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)))
            {
                svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
            } else {
                svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }
            
            svg.setAttribute('version', '1.1');
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            
            svg.setAttribute('viewBox', "0 0 " + width + " " + height);

            svg.appendChild(innerSvgElement.cloneNode(true));
            
            return FraunhoferIAIS.Roberta.createFileObject(
                    'block_' + counter++, 
                    FraunhoferIAIS.Text.decodeEntities(svg.outerHTML)
                );
        }));
        
        svgs = svgs.concat(disabledBlocks);

        document.body.removeChild(feSvg);
        
        return FraunhoferIAIS.Roberta.convertSvgImagesToPng(svgs);
        

    }).then(function(pngs) {
        if (JSZip == undefined) {
            console.log('JSZip could not be found, but is required to generate the images.');
            FraunhoferIAIS.Notification.showNotification('warning', 'Bilder konnten nicht erzeugt weden:','Das Erstellen der ZIP-Datei war nicht möglich, da die Seite nicht vollständig geladen ist. Laden Sie die Seite neu und versuchen Sie es bitte erneut.');
            return;
        }
        
        var zip = FraunhoferIAIS.Roberta.zipImageArrays({
                svg: svgs,
                png: pngs
            }),
            type = JSZip.support.blob ? 'blob' : 'base64';

        if (zip === null) {
            FraunhoferIAIS.Notification.showNotification('warning', 'Bilder konnten nicht erzeugt weden:','Das Erstellen der ZIP-Datei hat leider nicht funktioniert. Versuchen Sie es bitte noch einmal.');
            return;
        }

        zip.generateAsync({type: type}/*, function (metadata) {
            //Progress-bar actualization
            //metadata.percent + '%';
            //metadata.currentFile;
        }*/).then(function(zippedFile){
            if (window.saveAs !== undefined && type === 'blob') {
                saveAs(zippedFile, 'NEPOProgImages.zip');
            } else {
                var link = document.createElement('a');
                link.setAttribute('href', 'data:image/png;base64,' + zippedFile);
                link.setAttribute('download', 'NEPOProgImages.zip');
                link.style.display = 'none';
                document.body.appendChild(link);

                link.click();
                
                document.body.removeChild(link);
            }
        });
    });
}