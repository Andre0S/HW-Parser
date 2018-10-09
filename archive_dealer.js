let file = undefined;

let startEnabled = false;
let downloadEnabled = false;

let loader = document.getElementById("file_exchanger");
let btnLoad = document.getElementById("loadbtn");
let btnStart = document.getElementById("startbtn");
let btnDownload = document.getElementById("downloadbtn");
let consoleBG = document.getElementById("debugger");
let consoleDebug = document.getElementById("console");

loader.addEventListener('change', function(evt) {
    let code_file = evt.target.files[0];

    if (code_file) {
        let reader1 = new FileReader();
        reader1.onload = function() {
            file = reader1.result;
        }
        reader1.readAsText(code_file);
        btnStart.className = 'btn';
        startEnabled = true;
    } else {
        alert("Failed to load file");
    }
});

btnLoad.addEventListener('click',function() {
    startEnabled = false;
    downloadEnabled = false;
    btnStart.className = 'btn_disabled';
    btnDownload.className = 'btn_disabled';
    consoleBG.className = 'console_disabled';
    consoleDebug.className = 'console_disabled';
    loader.click();
});

btnStart.addEventListener('click', function() {
    if(startEnabled) {
        consoleBG.className = 'console_enabled';
        consoleDebug.className = 'console_enabled';
        if (main()) {
            btnDownload.className = 'btn';
            downloadEnabled = true;
        }
    }
});

btnDownload.addEventListener('click', function () {
    if (downloadEnabled) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
        element.setAttribute('download', 'instructions.mif');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        startEnabled = false;
        downloadEnabled = false;
        btnStart.className = 'btn_disabled';
        btnDownload.className = 'btn_disabled';
        consoleBG.className = 'console_disabled';
        consoleDebug.className = 'console_disabled';
        consoleDebug.value = '';
    }
});

function main() {
    consoleDebug.value = '';
    initialize(file);
    try {
        buildArrayOfInstructions();
        createOutput();
        print("Success, your file was converted:");
        print(output);
        return true;
    } catch (err) {
        print(err);
        return false;
    }
}

function print(str) {
    consoleDebug.value += str + "\r\n";
}

let original_px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
let px_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
let zoom = 1;
let html = document.getElementsByTagName('html')[0];

window.addEventListener('resize', function () {
    let newPx_ratio = window.devicePixelRatio || window.screen.availWidth / document.documentElement.clientWidth;
    if(newPx_ratio != px_ratio){
        zoom = newPx_ratio / original_px_ratio;
        px_ratio = newPx_ratio;
        html.style.setProperty('--originalzoom',zoom);
        return true;
    }
});