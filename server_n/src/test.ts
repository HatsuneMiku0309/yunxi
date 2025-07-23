function myAtoi(s: string): number {
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0 ; i < s.length - 1 ; i++) {
        if (s[i] === ' ') {
            continue;
        }
        if ((!isNaN(Number(s[i])) || s[i] === '-') && startIndex === -1) {
            startIndex = i;
        }
        if (startIndex !== -1 && i > startIndex && isNaN(Number(s[i]))) {
            endIndex = i;
        }
        if (startIndex !== -1 && endIndex !== -1) {
            break;
        }
    }
    endIndex = endIndex === -1 ? s.length : endIndex;
    return Number(s.substring(startIndex, endIndex));
};

console.log(myAtoi('words and 987'));