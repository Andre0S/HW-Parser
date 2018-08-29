
let file = undefined;

let commentary = /--.*/;

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
    consoleDebug.value = '';
    initialize(file);
    try {
        console.log(toBinaryImmediate(-1,16,true));
        buildArrayOfInstructions();
    } catch (err) {
        console.log(err);
    }
    /*file = file.split(/\r\n/);
    print(file.length);
    removeComments();
    console.log(toBinaryNumber(128,16));
    console.log(toBinaryNumber(28,5));
    printer();*/
}

function removeComments() {
    let comments = false;
    let auxiliary = undefined;
    let auxiliary2 = "";
    for (let i =0; i<file.length; i++) {
        comments = false;
        auxiliary = file[i];
        auxiliary2 = "";
        auxiliary = auxiliary.split(/\s+/).filter(function(el) {return (el.length > 0)});
        for (let j = 0; j < auxiliary.length; j++) {
            if (!comments) {
                if (!commentary.test(auxiliary[j])) {
                    auxiliary2 += auxiliary[j] + " ";
                } else {
                    comments = true;
                }
            }
        }
        file[i] = auxiliary2;
    }
}

function checkInstructions(instruction) {
    let temp = undefined;
    let opcode_funct = "";
    temp = instruction.split(/\s+/);
    let returner = "";
    if (temp.length>0) {
        if (instructionsR.test(temp[0])){
            for (let i = 0; i < formatR.length; i++) {
                if (formatR[i].name == temp[0]){
                    opcode_funct = formatR[i].funct;
                    i = formatR.length;
                }
            }
            switch (temp[0]) {
                case "add":
                case "and":
                case "sllv":
                case "slt":
                case "srav":
                case "sub":
                    returner += "000000";
                    if (temp[2]) {
                        try {
                            returner += toBinaryNumber(temp[2],5);
                        } catch (err) {
                            throw err;
                        }
                        if (temp[3]) {
                            try {
                                returner += toBinaryNumber(temp[3],5);
                            } catch (err) {
                                throw err;
                            }
                            if (temp[1]) {
                                try {
                                    returner += toBinaryNumber(temp[1],5) + "00000" + opcode_funct;
                                } catch (err) {
                                    throw err;
                                }
                            } else {
                                throw "Lack of RD register";
                            }
                        } else {
                            throw "Lack of RT register";
                        }
                    } else {
                        throw "Lack of RS register";
                    }
                    break;
                case "sll":
                case "sra":
                case "srl":
                    returner += "000000";
                    if (temp[2]) {
                        try {
                            returner += "00000" + toBinaryNumber(temp[2],5);
                        } catch (err) {
                            throw err;
                        }
                        if (temp[1]) {
                            try {
                                returner += toBinaryNumber(temp[1],5);
                            } catch (err) {
                                throw err;
                            }
                            if (temp[3]) {
                                try {
                                    returner += toBinaryNumber(temp[3],5) + opcode_funct;
                                } catch (err) {
                                    throw err;
                                }
                            } else {
                                throw "Lack of Shamt";
                            }
                        } else {
                            throw "Lack of RD register";
                        }
                    } else {
                        throw "Lack of RT register";
                    }
                    break;
                case "div":
                case "mult":
                    returner += "000000";
                    if (temp[1]) {
                        try {
                            returner += toBinaryNumber(temp[1],5);
                        } catch (err) {
                            throw err;
                        }
                        if (temp[2]) {
                            try {
                                returner += toBinaryNumber(temp[2],5);
                            } catch (err) {
                                throw err;
                            }
                        } else {
                            throw "Lack of RT register";
                        }
                    } else {
                        throw "Lack of RS register";
                    }
                    break;
            }
        } else if (instructionsI.test(temp[0])){

        } else if (instructionsJ.test(temp[0])){

        } else {
            throw "Error, not in set of instructions."
        }
    }
    return returner;
}



function print(str) {
    consoleDebug.value += str + "\r\n";
}

function printer() {
    for (let i = 0; i < file.length; i++) {
        consoleDebug.value += file[i] + "\r\n";
    }
}