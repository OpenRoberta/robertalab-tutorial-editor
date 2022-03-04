var FraunhoferIAIS = FraunhoferIAIS || {};

FraunhoferIAIS.FileHandling = FraunhoferIAIS.FileHandling || {};

FraunhoferIAIS.FileHandling.FileSystemAccess = FraunhoferIAIS.FileHandling.FileSystemAccess || {};
FraunhoferIAIS.FileHandling.LegacyAccess = FraunhoferIAIS.FileHandling.LegacyAccess || {};

var defaultOptions = {
    suggestedName: 'Untitled Tutorial.json',
    types: [
        {
            description: 'JSON files',
            accept: {
                'text/json': ['.json']
            }
        }
    ]
};


FraunhoferIAIS.FileHandling.FileSystemAccess.getFileHandle = async function(newOptions) {
    // Create and return a handle to the file.
    let options = { ...defaultOptions, newOptions };
    const fileHandle = await window.showSaveFilePicker(options);
    return fileHandle;
};

FraunhoferIAIS.FileHandling.FileSystemAccess.saveFile = async function(data) {
    let fileHandle = await FraunhoferIAIS.FileHandling.FileSystemAccess.getFileHandle();
    // Create a FileSystemWritableFileStream to write to.
    const writable = await fileHandle.createWritable();
    // Write the contents of the file to the stream.
    await writable.write(data);
    // Close the file and write the contents to disk.
    await writable.close();
};

FraunhoferIAIS.FileHandling.LegacyAccess.saveFile = function(fileName, data) {
    let downloadElement = document.createElement('a');

    downloadElement.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    downloadElement.setAttribute('download', fileName + '.json');
    downloadElement.innerText = `${fileName}.json`;
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
};