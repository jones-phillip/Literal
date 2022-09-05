const fs = require("fs");
const path = require("path");

class Literal {
    constructor(codes) {
        this.codes = codes;
        this.length = codes.length;
        this.pos = 0;
        this.BUILT_IN_KEYWORDS = ["print", "add", "subtract", "and"];
        this.varChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
        this.intValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    }

    tokenize() {
        let tokens = [];
        while (this.pos < this.length) {
            let currentChar = this.codes[this.pos];

            if (currentChar === " " || currentChar === "\n") {
                this.pos++;
                continue;
            }  else if (currentChar === '"') {
                tokens = this.createStringToken(tokens);
            } else if (this.varChars.includes(currentChar)) {
                tokens = this.createKeywordToken(currentChar, tokens);
            } else if (this.intValues.indexOf(parseInt(currentChar)) !== -1) {
                tokens = this.createIntToken(currentChar, tokens);
            } else {
                return {
                    error: `unexpected character ${this.codes[this.pos]}`
                };
            }
        }

        return {
            error: false,
            tokens
        }
    }

    createStringToken(tokens) {
        let res = "";
        this.pos++;

        while (this.codes[this.pos] !== '"' && this.codes[this.pos] !== '\n' && this.pos < this.length) {
            res += this.codes[this.pos];
            this.pos++;
        }

        if(this.codes[this.pos] !== '"') {
            return {
                error: "unterminated string"
            }
        }

        this.pos++;

        tokens.push({
            type: "string",
            value: res
        });

        return tokens;
    }

    createKeywordToken(currentChar, tokens) {
        let res = currentChar;
        this.pos++;

        while(this.varChars.includes(this.codes[this.pos]) && this.pos < this.length) {
            res += this.codes[this.pos];
            this.pos++;
        }

        if (!this.BUILT_IN_KEYWORDS.includes(res)) {
            return {
                error: `unexpected token ${res}`
            }
        }

        tokens.push({
            type: "keyword",
            value: res
        });

        return tokens;
    }
    
    createIntToken(currentChar, tokens) {
        let res = currentChar;
        this.pos++;

        while(this.intValues.indexOf(parseInt(this.codes[this.pos])) !== -1 && this.pos < this.length) {
            res += this.codes[this.pos];
            this.pos++;
        }
        
        this.pos++;

        tokens.push({
            type: "int",
            value: parseInt(res)
        });

        return tokens;
    }

    parse(tokens) {
        console.log(tokens);
        const len = tokens.length
        let pos = 0
        while(pos < len) {
          const token = tokens[pos]
          // if token is a print keyword
          if(token.type === "keyword" && token.value === "print") {
            // if the next token doesn't exist
            if(!tokens[pos + 1]) {
              return console.log("Unexpected end of line, expected string")
            }
            // check if the next token is a string
            let isString = tokens[pos + 1].type === "string"
            // if the next token is not a string
            if(!isString) {
              return console.log(`Unexpected token ${tokens[pos + 1].type}, expected string`)
            }
            // if we reach this point, we have valid syntax
            // so we can print the string
            console.log('\x1b[35m%s\x1b[0m', tokens[pos + 1].value)
            // we add 2 because we also check the token after print keyword
            pos += 2
          } else if (token.type === "keyword" && (token.value === "add" || token.value === "subtract")) {
            return console.log("arithmatic");
          } else { // if we didn't match any rules
            return console.log(`Unexpected token ${token.type}`)
          } 
        }
    }

    run() {
        const {
            tokens, 
            error
        } = this.tokenize();

        if(error) {
            console.log(error);
            return;
        }

        this.parse(tokens);
    }
}


const codes = fs.readFileSync(path.join(__dirname, 'codes.m'), 'utf8').toString();
const magenta = new Literal(codes);
magenta.run();