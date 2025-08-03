let correctNumber = Math.floor(Math.random() * 100);
// document.getElementById("correctNumber").innerHTML = `Correct number : ${correctNumber}`;

let guessCount = 0;


function countGuess(){
    guessCount++;
    document.getElementById("guessCount").innerHTML = `Guess Count : ${guessCount}`;
}

function checkNumber(){
    var guessedNumber = document.getElementById("input-box").value;

    if (guessedNumber === ""){
        document.getElementById("checkInput").innerHTML = "Please input number!";
        return;
    }else if (guessedNumber < 0 || guessedNumber > 100){
        document.getElementById("checkInput").innerHTML = "Number must be between 0 and 100!";
        return;
    }

    countGuess();
    if (guessedNumber > correctNumber){
        document.getElementById("checkInput").innerHTML = "Lower!";
    } else if (guessedNumber < correctNumber){
        document.getElementById("checkInput").innerHTML = "Higher!";
    }else {
        document.getElementById("checkInput").innerHTML = `Correct! The correct number is ${correctNumber}`;
        document.getElementById('resetButton').style.display = 'block';
    }
}

function resetGame(){
    correctNumber = Math.floor(Math.random() * 100);
    guessCount = 0;
    // document.getElementById("correctNumber").innerHTML = `Correct number : ${correctNumber}`;
    document.getElementById("guessCount").innerHTML = `Guess Count : ${guessCount}`;
    document.getElementById("checkInput").innerHTML = "";
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById("input-box").value = "";
}