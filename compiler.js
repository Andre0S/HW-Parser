//REG EXP for finding instructions
let notComment = /[^&*\r\n]/;
let alphabetical = /[a-z]/i;
let digits = /\d/;
let numbers = /^-?\d*$/;
let carriageReturn = /^\r\n|\r|\n$/;
let instructions = /^add$|^and$|^div$|^mult$|^jr$|^mfhi$|^mflo$|^sll$|^sllv$|^slt$|^sra$|^srav$|^srl$|^sub$|^break$|^rte$|^push$|^pop$|^addi$|^addiu$|^beq$|^bne$|^ble$|^bgt$|^lb$|^lh$|^lui$|^lw$|^sb$|^sh$|^slti$|^sw$|^j$|^jal$/i;
let instructionsR = /^add$|^and$|^div$|^mult$|^jr$|^mfhi$|^mflo$|^sll$|^sllv$|^slt$|^sra$|^srav$|^srl$|^sub$|^break$|^rte$|^push$|^pop$/i;
let instructionsR3registers = /^add$|^and$|^sllv$|^slt$|^srav$|^sub$/i;
let instructionsRshamt = /^sll$|^sra$|^srl$/i;
let instructionsRdivmult = /^div$|^mult$/i;
let instructionsRstoppers = /^break$|^rte$/i;
let instructionsRhilo = /^mfhi$|^mflo$/i;
let instructionsRstack = /^push$|^pop$/i;
let instructionsRjump = /^jr$/i;
let instructionsI = /^addi$|^addiu$|^beq$|^bne$|^ble$|^bgt$|^lb$|^lh$|^lui$|^lw$|^sb$|^sh$|^slti$|^sw$/i;
let instructionsIimmediate = /^addi$|^addiu$|^slti$/i;
let instructionsIbranch = /^beq$|^bne$|^ble$|^bgt$/i;
let instructionsIloadstore = /^lb$|^lh$|^lw$|^sb$|^sh$|^sw$/i;
let instructionsIlui = /^lui$/i;
let instructionsJ = /^j$|^jal$/i;
let commentLine = /^&&(.)*$/;
let commentBlock = /^\*&(.|\r\n|\r|\n)*&\*$/;
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
//part for further export.
let temporary = [];
let output = "";
//variables to know where you are.
let position;
let archive;
let archiveLength;
let line;
let inComment;

function initialize(str) {
    position = 0;
    archive = str;
    line = 1;
    archiveLength = archive.length;
    inComment = false;
}

function getNextToken(){
    let commentStar = false;
    let commentLine = false;
    let alphabet = false;
    let number = false;
    let negative = false;
    let actualChar = '';
    let actualToken = '';
    while (position <= archiveLength) {
        if (position == archiveLength) {
            return actualToken;
        }
        actualChar = archive[position];
        console.log(actualChar);
        if (actualChar == '-' && !negative && actualToken == '') {
            actualToken += actualChar;
            position++;
            negative = true;
        } else if (actualChar == '*') {
            if (!negative) {
                if (commentLine) {
                    actualToken += actualChar;
                    position++;
                } else if (commentStar) {
                    actualToken += actualChar;
                    position++;
                } else if ('*&' == (actualChar + archive[position + 1])) {
                    if (actualToken != '') {
                        return actualToken;
                    } else {
                        commentStar = true;
                        actualToken += actualChar + archive[position + 1];
                        position += 2;
                    }
                } else {
                    throw "Illegal character '*' at line " + line + ", out of comment.";
                }
            } else {
                throw "Illegal character - at line " + line + ", out of comment or negative number.";
            }
        } else if (actualChar == '&') {
            if (!negative) {
                if (commentLine) {
                    actualToken += actualChar;
                    position++;
                } else if (commentStar) {
                    actualToken += actualChar;
                    position++;
                } else if ('&&' == (actualChar + archive[position + 1])) {
                    if (actualToken != '') {
                        return actualToken;
                    } else {
                        commentLine = true;
                        actualToken += actualChar + archive[position + 1];
                        position += 2;
                    }
                } else if ('&*' == (actualChar + archive[position + 1])) {
                    if (actualToken == '') {
                        throw "Illegal character '&' at line " + line + ", out of comment.";
                    } else {
                        commentStar = false;
                        actualToken += actualChar + archive[position + 1];
                        position += 2;
                        return actualToken;
                    }
                } else {
                    throw "Illegal character '&' at line " + line + ", out of comment.";
                }
            } else {
                throw "Illegal character - at line " + line + ", out of comment or negative number.";
            }
        } else if (actualChar == ' ') {
            if (!(commentLine || commentStar)) {
                position++;
                number = false;
                alphabet = false;
                negative = false;
                return actualToken;
            } else {
                actualToken += actualChar;
                position++;
            }
        } else if (digits.test(actualChar)) {
            if (number || commentLine || commentStar) {
                actualToken += actualChar;
                position++;
            } else if (alphabet) {
                throw "Lacks a space between number and word at line " + line;
            } else {
                actualToken += actualChar;
                number = true;
                position++;
            }
        } else if (alphabetical.test(actualChar)) {
            if(!negative) {
                if (alphabet || commentLine || commentStar) {
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
            } else {
                throw "Illegal '-' at line " + line + ", out of comment or negative number.";
            }
        } else if (carriageReturn.test(actualChar)) {
            if (!negative) {
                if (carriageReturn.test(actualChar + archive[position + 1])) {
                    if (commentLine) {
                        commentLine = false;
                    }
                    line++;
                    position+= 2;
                    if (!commentStar) {
                        return actualToken;
                    }
                } else {
                    if (commentLine) {
                        commentLine = false;
                    }
                    line++;
                    position++;
                    if (!commentStar) {
                        return actualToken;
                    }
                }
            } else {
                throw "Illegal character - at line " + line + ", out of comment or negative number.";
            }
        } else if (commentLine || commentStar) {
            position++;
            actualToken += actualChar;
        } else {
            throw "Illegal character " + actualChar + " at line " + line + ", out of comment.";
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

function toBinaryImmediate(number,size,negative) {
    if (negative) {
        if ((number * -1) > (2**(size-1))) {
            throw "Invalid number";
        } else {
            let auxiliary = "0";
            let temp='';
            let auxiliary2 = number * -1;
            let exponenciator = size - 2;
            do {
                if (isPartOfBinaryCode(auxiliary2, 2 ** exponenciator)) {
                    auxiliary += "1";
                } else {
                    auxiliary += "0";
                }
                auxiliary2 = auxiliary2 % (2 ** exponenciator);
                exponenciator--;
            } while (exponenciator >= 0);
            let firstOne = false;
            for (let i = auxiliary.length -1; i > -1; i--) {
                if (!firstOne) {
                    if (auxiliary[i]==1){
                        firstOne = true;
                        temp = '1' + temp;
                    } else {
                        temp = '0' + temp;
                    }
                } else {
                    if (auxiliary[i]==1){
                        temp = '0' + temp;
                    } else if (auxiliary[i]==0){
                        temp = '1' + temp;
                    }
                }
            }
            return temp;
        }
    } else {
        if (number > ((2**(size -1)) - 1)) {
            throw "Invalid number";
        } else {
            let auxiliary = "0";
            let auxiliary2 = number;
            let exponenciator = size - 2;
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
    let instructionCounter = 0;
    while (position < archiveLength) {
        try{
            Token = getNextToken();
        } catch (err) {
            throw err;
        }
        console.log(Token);
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
            } else if (numbers.test(Token) && InstructionInitiated) {
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
                    case "Iimmediate":
                        switch (instructionCounter) {
                            case 0:
                                if (str_numb > -1) {
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                            case 1:
                                if (str_numb > -1) {
                                    try {
                                        rs = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RS at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                            case 2:
                                if (str_numb > -1) {
                                    try {
                                        offset = toBinaryImmediate(str_numb,16,false);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too big.";
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + offset;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                } else {
                                    try {
                                        offset = toBinaryImmediate(str_numb,16,true);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too negative.";
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + offset;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                }
                                break;
                        }
                        break;
                    case "Ibranch":
                        switch (instructionCounter) {
                            case 0:
                                if (str_numb > -1) {
                                    try {
                                        rs = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RS at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                            case 1:
                                if (str_numb > -1) {
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                            case 2:
                                if (str_numb > -1) {
                                    try {
                                        offset = toBinaryImmediate(str_numb,16,false);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too big.";
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + offset;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                } else {
                                    try {
                                        offset = toBinaryImmediate(str_numb,16,true);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too negative.";
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + offset;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                }
                                break;
                        }
                        break;
                    case "Iloadstore":
                        switch (instructionCounter) {
                            case 0:
                                if (str_numb > -1) {
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                            case 1:
                                if (str_numb > -1) {
                                    try {
                                        offset = toBinaryImmediate(str_numb,16,false);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too big.";
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    try {
                                        offset = toBinaryImmediate(str_numb,16,true);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too negative.";
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                }
                                break;
                            case 2:
                                if (str_numb > -1) {
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    returner += rs + rt + offset;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                        }
                        break;
                    case "Ilui":
                        switch (instructionCounter) {
                            case 0:
                                if (str_numb > -1) {
                                    try {
                                        rt = toBinaryNumber(str_numb,5);
                                    } catch (err) {
                                        throw err + " for RT at line " + line;
                                    }
                                    temp += ' ' + str_numb;
                                    instructionCounter++;
                                } else {
                                    throw "Register cannot be a negative number, got " + Token + ", at line " + line;
                                }
                                break;
                            case 1:
                                if (str_numb > -1) {
                                    try {
                                        offset = toBinaryNumber(str_numb,16);
                                    } catch (err) {
                                        throw err + " for OFFSET at line " + line + ", number too big.";
                                    }
                                    temp += ' ' + str_numb;
                                    returner += "00000" + rt + offset;
                                    instructionCounter++;
                                    return returner+"&"+temp;
                                } else {
                                    throw "Expecting an unsigned integer, got this " + Token + " instead, at line " + line;
                                }
                                break;
                        }
                        break;
                    case "J":
                        if (str_numb > -1) {
                            try {
                                offset = toBinaryImmediate(str_numb,28,false);
                            } catch (err) {
                                throw err + " for OFFSET at line " + line + ", number too big.";
                            }
                            temp += ' ' + str_numb;
                            returner += offset;
                            instructionCounter++;
                            return returner+"&"+temp;
                        } else {
                            try {
                                offset = toBinaryImmediate(str_numb,28,true);
                            } catch (err) {
                                throw err + " for OFFSET at line " + line + ", number too negative.";
                            }
                            temp += ' ' + str_numb;
                            returner += offset;
                            instructionCounter++;
                            return returner+"&"+temp;
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

function buildArrayOfInstructions() {
    try {
        while (position < archiveLength) {
            temporary.push(getCommandFromToken());
        }
    } catch (err) {
        throw err;
    }
    temporary = temporary.filter(function(el) {return el !== (undefined || null || "")});
}

function getNumberOfByte(byte) {
    if (byte<10){
        return "00"+byte;
    } else if (byte >= 10 && byte < 100) {
        return "0" +byte;
    } else if (byte>=100) {
        return ""+byte;
    }
}

function createOutput() {
    output = "DEPTH = " + (temporary.length * 4) + ";\nWIDTH = 8;\n\nADDRESS_RADIX = DEC;\nDATA_RADIX = BIN;\nCONTENT\nBEGIN\n\n";
    let byte = 0;
    let temp = undefined;
    let auxiliary = "";
    for (let i = 0; i < temporary.length; i++){
        temp = temporary[i].split(/&/);
        auxiliary = getNumberOfByte(byte) + " : " + temp[0].substr(24,8) + "; --" +temp[1] + "\n" + getNumberOfByte(byte+1) + " : " + temp[0].substr(16,8) + ";\n"
            + getNumberOfByte(byte+2) + " : " + temp[0].substr(8,8) + ";\n" + getNumberOfByte(byte+3) + " : " + temp[0].substr(0,8) + ";\n\n";
        output += auxiliary;
        byte += 4;
    }
    output += "END;\n"
}
