
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
        btnDownload.className = 'btn';
        consoleBG.className = 'console_enabled';
        consoleDebug.className = 'console_enabled';
    }
});