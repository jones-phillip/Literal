const fs = require("fs");
const path = require("path");

class Literal {
    constructor(codes) {
        this.codes = codes;
        this.length = codes.length;
        this.pos = 0;
        this.BUILT_IN_KEYWORDS = ["print", "add", "subtract", "multiply", "divide", "and"];
        this.spaceExpression = /^[\n\r\s]+/;
        this.quoteExpression = /^["']+$/;
        this.stringExpression = /^[\w$.\-]+$/;
        this.keywordExpression = /^[a-zA-Z_]+$/;
        this.intExpression = /^[0-9.-]+$/;
    }

    tokenize() {
        let tokens = [];
        while (this.pos < this.length) {
            let currentChar = this.codes[this.pos];

            if (this.spaceExpression.exec(currentChar)) {
                this.pos++;
                continue;
            }  else if (this.quoteExpression.exec(currentChar)) {
                tokens = this.createStringToken(tokens);
            } else if (this.keywordExpression.exec(currentChar)) {
                tokens = this.createKeywordToken(currentChar, tokens);
            } else if (this.intExpression.exec(currentChar)) {
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

        while(this.keywordExpression.exec(this.codes[this.pos]) && this.pos < this.length) {
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

        while(this.intExpression.exec(this.codes[this.pos]) && this.pos < this.length) {
            res += this.codes[this.pos];
            this.pos++;
        }
        
        this.pos++;

        if (res.includes(".")) {
            tokens.push({
                type: "int",
                value: parseFloat(res)
            });

            return tokens;
        }

        tokens.push({
            type: "int",
            value: parseInt(res)
        });

        return tokens;
    }

    parse(tokens) {
        const len = tokens.length
        this.pos = 0
        while(this.pos < len) {
          const token = tokens[this.pos]
          
          if(token.type === "keyword" && token.value === "print") {
            
            if(!tokens[this.pos + 1]) {
              return console.log("Unexpected end of line, expected string")
            }
            
            let isString = tokens[this.pos + 1].type === "string"
            
            if(!isString) {
              return console.log(`Unexpected token ${tokens[this.pos + 1].type}, expected string`)
            }

            console.log('\x1b[35m%s\x1b[0m', tokens[this.pos + 1].value)
            // we add 2 because we also check the token after print keyword
            this.pos += 2
          } else if (token.type === "keyword" && (token.value === "add" || token.value === "subtract" || token.value === "multiply" || token.value === "divide")) {
            if (tokens[this.pos + 1].type === "string" || !tokens[this.pos + 1]) {
                let error = !tokens[this.pos + 1] ? `Unexpected end on line, expected int` : `Unexpected token ${tokens[this.pos + 1].type}, expected int`;

                return console.log(error);
            }

            if (tokens[this.pos + 2].value !== "and" || !tokens[this.pos + 2]) {
                let error = !tokens[this.pos + 2] ? `Unexpected end on line, expected "add"` : `Unexpected token ${tokens[this.pos + 2].value}, expected "add"`;

                return console.log(error);
            }

            if (tokens[this.pos + 3].type === "string" || !tokens[this.pos + 3]) {
                let error = !tokens[this.pos + 3] ? `Unexpected end on line, expected int` : `Unexpected token ${tokens[this.pos + 3].type}, expected int`;

                return console.log(error);
            }

            switch(token.value) {
                case "add":
                    console.log(tokens[this.pos + 1].value + tokens[this.pos + 3].value);
                    break;
                case "subtract":
                    console.log(tokens[this.pos + 1].value - tokens[this.pos + 3].value);
                    break;
                case "multiply":
                    console.log(tokens[this.pos + 1].value * tokens[this.pos + 3].value);
                    break;
                case "divide":
                    console.log(tokens[this.pos + 1].value / tokens[this.pos + 3].value);
                    break;
                default:
                    return console.log(`Unexpected keyword ${token.value}`);
            }

            this.pos += 4;
          } else { 
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