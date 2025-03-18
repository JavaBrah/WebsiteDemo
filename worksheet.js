

/*
There are five kinds of programmers in the world:

1. "The programmer was happy, so he coding."
2. "When programmer coding, he is happy."
3. "Programmer is coding, but he is not happy."
4. "Programmer has no job of coding, he is happy."
5. "no coding and no happy"

Given a string nickname. It's the nickname of a programmer. 
Please determine which kind of programmer it belongs to. 
The result should be a number, 1,2,3,4 or 5.

You don't know the rules? Sorry, it's a puzzle ;-)

Examples
For `nickname="Happy coding", the output should be 1.

For nickname="coding happy", the output should be 2.

For nickname="coding everyday", the output should be 3.

For nickname="happy programmer", the output should be 4.

For nickname="unhappy codewarrior", the output should be 5. */
nickname = "happy programmer"
nickname = "dfsf"
function happyCoding(nickname){
    let dict = { 
        "Happy coding":"The programmer was happy, so he coding.",
        "coding happy": "When programmer coding, he is happy.",
        "coding everyday": "Programmer is coding, but he is not happy.",
        "happy programmer": "Programmer has no job of coding, he is happy.",
        "unhappy codewarrior": "no coding and no happy"
    }
    return dict[nickname]  
}


// FizzBuzz
//It works as follows: for the numbers between 1 and 100, 
// print "fizz" if it is a multiple of 3 
// print "buzz" if it is a mutiple of 5, 
// print "fizzbuzz" if it is multiple of 15
// else print the number itself.
function fizzbuzz(number) {
   
}

/*
Check to see if a string has the same amount of 'x's and 'o's. The method must return a boolean and be case insensitive. The string can contain any char.

Examples input/output:

XO("ooxx") => true
XO("xooxx") => false
XO("ooxXm") => true
XO("zpzpzpp") => true // when no 'x' and 'o' is present should return true
XO("zzoo") => false
*/
function XO(str) {
    
    
}
/*
In this example you have to validate if a user input string is alphanumeric. The given string is not nil/null/NULL/None, so you don't have to check that.

The string has the following conditions to be alphanumeric:

At least one character ("" is not valid)
Allowed characters are uppercase / lowercase latin letters and digits from 0 to 9
No whitespaces / underscore
*/