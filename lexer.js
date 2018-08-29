
let notComment = /[^&*\r\n]/;
let alphabetical = /[a-z]/i;
let digits = /\d/;
let numbers = /-?\d*/;
let carriageReturn = /\r\n/;
let instructions = /add|and|div|mult|jr|mfhi|mflo|sll|sllv|slt|sra|srav|srl|sub|break|rte|push|pop|addi|addiu|beq|bne|ble|bgt|lb|lh|lui|lw|sb|sh|slti|sw|j|jal/i;
let instructionsR = /add|and|div|mult|jr|mfhi|mflo|sll|sllv|slt|sra|srav|srl|sub|break|rte|push|pop/i;
let instructionsR3registers = /add|and|sllv|slt|srav|sub/i;
let instructionsRshamt = /sll|sra|srl/i;
let instructionsRdivmult = /div|mult/i;
let instructionsRstoppers = /break|rte/i;
let instructionsRhilo = /mfhi|mflo/i;
let instructionsRstack = /push|pop/i;
let instructionsRjump = /jr/i;
let instructionsI = /addi|addiu|beq|bne|ble|bgt|lb|lh|lui|lw|sb|sh|slti|sw/i;
let instructionsIimmediate = /addi|addiu|slti/i;
let instructionsIbranch = /beq|bne|ble|bgt/i;
let instructionsIloadstore = /lb|lh|lw|sb|sh|sw/i;
let instructionsIlui = /lui/i;
let instructionsJ = /j|jal/i;
let commentLine = /&&.*/;
let commentBlock = /\*&(.|\r\n)*&\*/;
let codes = [
    {name:"add" , code: "100000"},
    {name:"and" , code: "100100"},
    {name:"div" , code: "011010"},
    {name:"mult" , code: "011000"},
    {name:"jr" , code: "001000"},
    {name:"mfhi" , code: "010000"},
    {name:"mflo" , code: "010010"},
    {name:"sll" , code: "000000"},
    {name:"sllv" , code: "000400"},
    {name:"slt" , code: "101010"},
    {name:"sra" , code: "000011"},
    {name:"srav" , code: "000111"},
    {name:"srl" , code: "000010"},
    {name:"sub" , code: "100010"},
    {name:"break" , code: "001101"},
    {name:"rte" , code: "010011"},
    {name:"push" , code: "000101"},
    {name:"pop" , code: "000110"},
    {name:"addi" , code: "001000"},
    {name:"addiu" , code: "001001"},
    {name:"beq" , code: "000100"},
    {name:"bne" , code: "000101"},
    {name:"ble" , code: "000110"},
    {name:"bgt" , code: "000111"},
    {name:"beqm" , code: "000001"},
    {name:"lb" , code: "100000"},
    {name:"lh" , code: "100001"},
    {name:"lui" , code: "001111"},
    {name:"lw" , code: "100011"},
    {name:"sb" , code: "101000"},
    {name:"sh" , code: "101001"},
    {name:"slti" , code: "001010"},
    {name:"sw" , code: "101011"},
    {name:"j" , code: "000010"},
    {name:"jal" , code: "000011"}];

let position;
let archive;
let archiveLength;
let line;

function initialize(str) {
    position = 0;
    archive = str;
    line = 1;
    archiveLength = archive.length;
}

function getNextToken() {
    let commentStar = false;
    let commentEnd = false;
    let commentLine = false;
    let commAnd = false;
    let star = false;
    let alphabet = false;
    let number = false;
    let actualChar = '';
    let actualToken = '';
    while (position <= archiveLength) {
        actualChar = archive[position];
        if (actualChar == '*' || actualChar == '&') {
            while (position < archiveLength && !((commentLine || commentStar) && commentEnd)) {
                actualChar = archive[position];
                if (actualChar == '*') {
                    actualToken += '*';
                    if (commAnd) {
                        if (commentStar) {
                            commentEnd = true;
                            commAnd = false;
                            position++;
                            if (position < archiveLength -3) {
                                if (carriageReturn.test(archive[position] + archive[position+1])) {
                                    line++;
                                    position += 2;
                                }
                            }
                            return actualToken;
                        } else if (!commentStar && !commentLine) {
                            throw "Comment in wrong place, lacks an initial '*&' on line " + line;
                        }
                    } else {
                        if (!commentStar) {
                            position++;
                            star = true;
                        }
                    }
                } else if (actualChar == '&') {
                    position++;
                    actualToken += '&';
                    if (commAnd) {
                        if (!commentStar && !commentLine) {
                            commentLine = true;
                            commAnd = false;
                        }
                    } else if (star) {
                        if (!commentStar && !commentLine) {
                            commentStar = true;
                            star = false;
                        }
                    } else {
                        commAnd = true;
                    }
                } else if (notComment.test(actualChar)){
                    position++;
                    actualToken += actualChar;
                    if (star) {
                        if (commentStar) {
                            star = false;
                        } else {
                            star = false;
                            throw "Comment malformed, lacks a '&' after a '*', on line " + line;
                        }
                    } else if (commAnd) {
                        if (!commentStar) {
                            throw "Comment malformed, lacks a '&' to form a comment line on line " + line;
                        }
                    }
                } else if (carriageReturn.test(actualChar + archive[position+1])){
                    position += 2;
                    actualToken += "\r\n";
                    line++;
                    if (commentLine){
                        commentEnd = true;
                        return actualToken;
                    }
                }
            }
        } else if (carriageReturn.test(actualChar + archive[position+1])){
            line++;
            position += 2;
            return actualToken;
        } else {
            if (alphabetical.test(actualChar)){
                if (alphabet) {
                    actualToken += actualChar;
                    position++;
                } else if (number) {
                    throw "Lacks a space between number and word at line " + line;
                } else {
                    actualToken += actualChar;
                    alphabet = true;
                    position++;
                }
                if (position == archiveLength) {
                    return actualToken;
                }
            } else if (digits.test(actualChar)) {
                if (number) {
                    actualToken += actualChar;
                    position++;
                } else if (alphabet) {
                    throw "Lacks a space between number and word at line " + line;
                } else {
                    actualToken += actualChar;
                    number = true;
                    position++;
                }
                if (position == archiveLength) {
                    return actualToken;
                }
            } else if (actualChar == " ") {
                position++;
                number = false;
                alphabet = false;
                return actualToken;
            } else {
                throw "Illegal character at line " + line + ", out of comment.";
            }
        }
    }
}

function getCommandFromToken() {
    let Token;
    let opcode_funct = '';
    let returner = '';
    let temp = '';
    let type = '';
    let rd = '';
    let rs = '';
    let rt = '';
    let shamt = '';
    let offset = '';
    let InstructionInitiated = false;
    let instructionFinished = false;
    let instructionCounter = 0;
    while (position < archiveLength) {
        try{
            Token = getNextToken();
            console.log(returner);
            console.log(temp);
        } catch (err) {
            throw err;
        }
        if (!commentBlock.test(Token) && !commentLine.test(Token)) {
            if (instructions.test(Token) && !InstructionInitiated) {
                opcode_funct = getCode(Token);
                if (instructionsR.test(Token)) {
                    returner += "000000";
                    temp += Token;
                    if (instructionsR3registers.test(Token)) {
                        type = "R3registers";
                    } else if (instructionsRshamt.test(Token)) {
                        type = "Rshamt";
                    } else if (instructionsRdivmult.test(Token)) {
                        type = "Rdivmult";
                    } else if (instructionsRstoppers.test(Token)) {
                        type = "Rstoppers";
                        returner += "00000000000000000000" + opcode_funct;
                        return returner+"&"+temp;
                    } else if (instructionsRhilo.test(Token)) {
                        type = "Rhilo";
                    } else if (instructionsRstack.test(Token)) {
                        type = "Rstack";
                    } else {
                        type = "Rjump";
                    }
                } else if (instructionsI.test(Token)) {
                    temp += Token;
                    if (instructionsIimmediate.test(Token)) {
                        returner += opcode_funct;
                        type = "Iimmediate";
                    } else if (instructionsIbranch.test(Token)) {
                        returner += opcode_funct;
                        type = "Ibranch";
                    } else if (instructionsIloadstore.test(Token)) {
                        returner += opcode_funct;
                        type = "Iloadstore";
                    } else {
                        returner += opcode_funct;
                        type = "Ilui";
                    }
                } else {
                    temp += Token;
                    returner += opcode_funct;
                    type = "J";
                }
                InstructionInitiated = true;
            } else if (numbers.test(Token)) {
                let str_numb = parseInt(Token);
                switch (type) {
                    case "R3registers":
                        if (str_numb > -1) {
                            switch (instructionCounter) {
                                case 0:
                                    try {
                                        rd = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RD at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                    break;
                                case 1:
                                    try {
                                        rs = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RS at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                    break;
                                case 2:
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + rd + "00000" + opcode_funct;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                    break;
                            }
                        } else {
                            throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                        }
                        break;
                    case "Rshamt":
                        if (str_numb > -1) {
                            switch (instructionCounter) {
                                case 0:
                                    try {
                                        rd = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RD at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                    break;
                                case 1:
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                    break;
                                case 2:
                                    try {
                                        shamt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for SHAMT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    returner += "00000" + rt + rd + shamt + opcode_funct;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                    break;
                            }
                        } else {
                            throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                        }
                        break;
                    case "Rdivmult":
                        if (str_numb > -1) {
                            switch (instructionCounter) {
                                case 0:
                                    try {
                                        rs = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RS at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                    break;
                                case 1:
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + "0000000000" + opcode_funct;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                    break;
                            }
                        } else {
                            throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                        }
                        break;
                    case "Rhilo":
                        if (str_numb > -1) {
                            try {
                                rd = toBinaryNumber(str_numb,5);
                            } catch (err) {
                                throw err + " for RD at line " + line;
                            }
                            temp += ' ' + str_numb;
                            returner += "0000000000" + rd + "00000" + opcode_funct;
                            return returner+"&"+temp;
                            break;
                        } else {
                            throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                        }
                        break;
                    case "Rstack":
                        if (str_numb > -1) {
                            try {
                                rt = toBinaryNumber(str_numb,5);
                            } catch (err) {
                                throw err + " for RT at line " + line;
                            }
                            temp += ' ' + str_numb;
                            returner += "00000" + rt + "0000000000" + opcode_funct;
                            return returner+"&"+temp;
                            break;
                        } else {
                            throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                        }
                        break;
                    case "Rjump":
                        if (str_numb > -1) {
                            try {
                                rs = toBinaryNumber(str_numb,5);
                            } catch (err) {
                                throw err + " for RS at line " + line;
                            }
                            temp += ' ' + str_numb;
                            returner += rs + "00000" + "00000" + "00000" + opcode_funct;
                            return returner+"&"+temp;
                            break;
                        } else {
                            throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                        }
                        break;
                }
            } else {
                if (!InstructionInitiated) {
                    throw "Expecting an instruction, got this " + Token + " instead, at line " + line;
                } else {
                    throw "Expecting a number, got this " + Token + " instead, at line " + line;
                }
            }
        } else {
            return returner;
        }
    }
}

function getCode(name) {
    for (let i = 0; i < codes.length; i++) {
        if (codes[i].name == name) {
            return codes[i].code;
        }
    }
    return "null";
}

function isPartOfBinaryCode(number,mod) {
    if ((number - (number % mod)) == mod) {
        return true;
    } else {
        return false;
    }
}

function toBinaryNumber(number,size) {
    if (number > ((2**(size)) - 1)) {
        throw "Invalid number";
    } else {
        let auxiliary = "";
        let auxiliary2 = number;
        let exponenciator = size - 1;
        do {
            if (isPartOfBinaryCode(auxiliary2, 2 ** exponenciator)) {
                auxiliary += "1";
            } else {
                auxiliary += "0";
            }
            auxiliary2 = auxiliary2 % (2 ** exponenciator);
            exponenciator--;
        } while (exponenciator >= 0);
        return auxiliary;
    }
}