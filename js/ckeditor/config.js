/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function( config ) {
    // Define changes to default configuration here.
    // For complete reference see:
    // https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_config.html

    // The toolbar groups arrangement, optimized for two toolbar rows.
    config.toolbar = [
        { name: 'document', items: [ 'Source'] },
        { name: 'clipboard', items: [  'Undo', 'Redo', '-', 'PasteText', 'PasteFromWord'] },
        { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
        '/',
        { name: 'styles', items: [ 'Format'] },
        { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
        '/',
        { name: 'styles', items: ['FontSize' ] },
        { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
        { name: 'links', items: [ 'Link', 'Unlink'] },
        { name: 'insert', items: [ 'base64image', 'Html5video', 'Table', 'HorizontalRule'] },
        { name: 'about', items: [ 'About' ] },
        { name: 'others', items: [ 'Others' ] }
    ];

    // Set the most common block elements.
    config.format_tags = 'p;h1;h2;h3;pre';

    // Simplify the dialog windows.
    config.removeDialogTabs = 'image:advanced;link:advanced';
    
    config.language = 'de';
    config.uiColor = '#EEEEEE';
    config.height = 320;
    
    config.allowedContent = true;
    
    config.readOnly = false;
};
