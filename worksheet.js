

function factorial(num){
    fact = 1
    while (num > 0){
        fact = fact * num
        num--
    }
    return fact
}

console.log(factorial(2))



function romanNumerals(number){
    const romanNumeralConversion = {
        1000: 'M',
        900: 'CM',
        500: 'D',
        400: 'CD',
        100: 'C',
        90: 'XC',
        50: 'L',
        40: 'XL',
        10: 'X',
        9: 'IX',
        5: 'V',
        4: 'IV',
        1: 'I'
    }

    let numberConvertedToRoman = ''
    const keys = Object.keys(romanNumeralConversion).map(Number).sort((a, b) => b - a);
    
    for (let key of keys){
        let count = Math.floor(number / key);
        numberConvertedToRoman += romanNumeralConversion[key].repeat(count);
        number -= key * count;
    }

    return numberConvertedToRoman;
}

console.log(romanNumerals(5694));



function fibonacci(number){
    let sequenceArray = [0, 1]
    
    for (let i = 2; i <= number; i++){
        let nextNum = sequenceArray[i - 1] + sequenceArray[i - 2];
        sequenceArray.push(nextNum);
       
    }
    return sequenceArray[number]
}

console.log(fibonacci(7))



function globalLinearSearch(item, array){
    let indexListForItem = [];
    for (let i = 0; i < array.length; i++){
        if (item == array[i]){
            indexListForItem.push(i)
        }
    }
    return indexListForItem
}

const array = ['a', 'b', 'c', 'b', 'b', 'd']
const item = 'b'

console.log(globalLinearSearch(item, array));