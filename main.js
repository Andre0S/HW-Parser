
let file = undefined;
let temporary = "";
let output = "";

let alphabetical = /([a-z]+[A-Z])*/;

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
        main();
    }
});

function main() {
    file = file.split(/[\r\n]+/).filter(function(el) {return (el.length > 0)});
    removeComments();
    printer();
}

function removeComments() {
    let aux = "";
    let comments = false;
    for (let i =0; i<file.length; i++) {
        file[i] = file[i].split(/[\s\b]+/).filter(function(el) {return (el.length > 0)});
        aux = "";
        comments = false;
        for (let j = 0; j <file[i].length; j++) {
            if (file[i]=='-' && file[i+1]=='-' && !comments) {
                comments = true;
            }
        }
    }
}

function printer() {
    for (let i = 0; i < file.length; i++) {
        consoleDebug.value += file[i] + "\r\n";
        console.log(file[i]);
    }
}