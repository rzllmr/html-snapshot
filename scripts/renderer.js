
(function($, window, document) {
  $(function() {
    const {ipcRenderer} = require('electron');
    const {dialog} = require('electron').remote;
    const urlInput = $('#url');
    const fileInput = $('#file');
    const widthInput = $('#width');
    const heightInput = $('#height');
    const renderButton = $('#render');
    const info = $('#info');

    urlInput.on('keydown', (event) => {
      if (event.keyCode === 13) {
        fileInput.val('');

        let url = urlInput.val();
        if (!url.startsWith('http://')) {
          url = 'http://' + url;
          urlInput.val(url);
        }
        ipcRenderer.send('loadURL', url);
        info.hide();
      }
    });

    fileInput.on('click', () => {
      dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{name: 'HTML File', extensions: ['html']}]
      }).then(result => {
        if (!result.canceled) {
          const path = result.filePaths[0];
          urlInput.val('');
          fileInput.val(path);
          ipcRenderer.send('loadFile', path);
          info.hide();
        }
      });
    });

    renderButton.click(() => {
      const width = widthInput.val();
      const height = heightInput.val();
      if (!width) {
        widthInput.css('border-color', '#fc6f81');
        window.setTimeout(() => {
          widthInput.css('border-color', 'lightgrey');
        }, 2000);
      }
      if (!height) {
        heightInput.css('border-color', '#fc6f81');
        window.setTimeout(() => {
          heightInput.css('border-color', 'lightgrey');
        }, 2000);
      }
      if (!width || !height) return;

      dialog.showSaveDialog({
        properties: ['openFile'],
        filters: [{name: 'Image File', extensions: ['png', 'jpg', 'bmp']}]
      }).then(result => {
        if (!result.canceled) {
          const path = result.filePath;
          ipcRenderer.send('render', path, widthInput.val(), heightInput.val());
        }
      });
    });
  });
}(window.jQuery, window, document));
