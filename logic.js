//TODO add keyboard
//TODO add randomize button


const isRandom = false
const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll(".letter-box");

let currentRow = 0;
let currentGuess = "";

let answer = "";
let finished = false;

async function init(){

    //get word of the day from api
    const res = await fetch(`https://words.dev-apis.com/word-of-the-day${isRandom?"?random=1":""}`);
    const resObj =  await res.json();
    answer = resObj.word.toLowerCase();

    document.addEventListener("keydown", function (event){

        //if game over ignore inputs
        if(finished){
            return;
        }

        key = event.key;

        if (key === 'Backspace'){
            handleBackspace();
        } else if (key === 'Enter'){
            //await needed or not?
            handleEnter();
        } else if (isLetter(key)){
            handleLetter(key.toLowerCase());
        }
    });
    
}

function handleLetter(key){
    //if row is full do nothing
    if (currentGuess.length === ANSWER_LENGTH){
        return;
    }
    currentGuess += key;
    letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerHTML = key;
}

function handleBackspace(){
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[currentRow * ANSWER_LENGTH + currentGuess.length].innerHTML = "";

}

async function handleEnter(){
    // do nothing if row not full
    if (currentGuess.length < ANSWER_LENGTH) {
        return;
    }

    //do nothing if guess isn't valid word
    if (! await validateGuess()){
        return;
    }
    checkGuess();
}


async function validateGuess(){
    //post current guess to api to check validity
    const res = await fetch("https://words.dev-apis.com/validate-word",{
        method: "POST",
        body: JSON.stringify({"word": currentGuess})
    });
    const resObj = await res.json();
    const isValid = resObj.validWord;

    console.log(isValid ? "Valid word" : "Invalid word");


    //if guess isn't valid word play error animation
    //probably a better way to do this
    if(!isValid){
        for(let i =0; i<ANSWER_LENGTH; i++){
            letters[currentRow * ANSWER_LENGTH + i].classList.add("shake");

            setTimeout(() => {
                letters[currentRow * ANSWER_LENGTH + i].classList.remove("shake");
            }, 1000); 
        }
    }

    return isValid;
}

function checkGuess (){
    //check if guess is winning

    if (currentGuess == answer){
        win();
        return;
    }

    //convert currentGuess and answer to lists to compare letters

    let answerList = answer.split("");
    let guessList = currentGuess.split("");

    //check for exact letter matches and color them accordingly
    //when a letters match, 'remove' them (replace them with 0) from answerList and guessList to not be checked later

    for (let i = 0; i< ANSWER_LENGTH; i++){
        if (guessList[i] === answerList[i]){
            colorBox(i, "correct");
            answerList[i] = 0;
            guessList[i] = 0;
        }
    }

    //check for yellow (close) letters and make others grey
    //when a letter is close, remove it from answerList to not be overcounted

    for (let i = 0; i< ANSWER_LENGTH; i++){

        //ignore removed letters
        if (guessList[i] === 0){
            continue;
        }
        let j = answerList.indexOf(guessList[i]);
        if (j === -1){
            colorBox(i, "wrong");
        }
        else{
            colorBox(i, "close");
            answerList[j] = 0;
        }
    }

    //go to next row, game lost if going beyond last row

    currentRow += 1;
    currentGuess = "";
    if(currentRow === ROUNDS){
        lose();
        return;
    }
}


function colorBox(index, color){
    letters[currentRow * ANSWER_LENGTH + index].classList.add(color);
}


function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function win() {
    finished = true;

    //color row green
    for (let i = 0; i< ANSWER_LENGTH; i++){
        colorBox(i, "correct");
    }

    //add bounce animation
    //probably a better way to do this
    for(let i =0; i<ANSWER_LENGTH; i++){
        setTimeout(() => {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("bounce");
        }, i*100); 
    }


    //show win message
    resultCard = document.querySelector(".result");
    resultCard.classList.remove("hidden");
    resultCard.innerHTML = `<h2> YOU WON </h2>
    <p>Well done!</p>`;
}

function lose() {
    finished = true;

    //show lose message
    resultCard = document.querySelector(".result");
    resultCard.classList.remove("hidden");
    resultCard.innerHTML = `<h2> YOU LOST </h2>
    <p>The word was ${answer.toUpperCase()}</p>`;

}


init();