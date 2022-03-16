const NUMBER_OF_QUESTIONS = 5; // Antalet frågor i en spelomgång
const NUMBER_OF_OPTIONS = 3; // Antal alternativ (exkl. Pass)

// Nedanstående objekt översätter landskoder till svenska.
const COUNTRY_NAMES = {
  DEU: "Tyskland",
  FRA: "Frankrike",
  GRC: "Grekland",
  HRV: "Kroatien",
  IRL: "Irland",
  ITA: "Italien",
  NLD: "Nederländerna",
  SVK: "Slovakien",
  SWE: "Sverige",
};

/*---------------------------------------------------------------*/
// Kopplingar görs till några av HTML-dokumentets element så att
// dessa kan ändras/läsas av här i js-filen
// (här deklareras variablerna, de kopplas i funktionen setup nedan).
let flagImage; // Bilden på flaggan
let scoreContainer; // Poängruta
let scoreText; // Löpande poängräkning
let resultWindow; // Resultatsfönstret
let resultText; // Slutpoängen
let btnCloseModal; // Knapp som stänger resultatsfönstret
let feedbackContainer; // Ruta för feedback
let feedbackText; // Feedback-text
let rbs; // "Radioknapparna"
let btn; // Svarsknappen
let alt1; // Text på översta radioknappen
let alt2; // Text på andra radioknappen
let alt3; // Text på tredje radioknappen
let title; // Fliktext på webbläsaren
let ordernum; // Text som anger numret på frågan
let overlay; // Överlägg som "blurrar" sidan

// Denna array, som får sitt innehåll i funktionen init, kommer att
// innehålla landskoderna för de tillgängliga flaggorna. När en flagga
// slumpas fram så försvinner den ur arrayen (detta processas i
// funktionen newQuestion), på så sätt så kommer inte flaggorna att
// upprepas unde spelomgången.
let flags = [];

// Svarsalternativen baseras på denna array, som även den innehåller
// landskoderna för de befintliga flaggorna. Även om en flagga har
// visats så kan dess land komma upp som alternativ senare i
// spelomgången. Denna array kommer inte att förändras.
let alternatives = [];

let score = 0; // Total poäng
let qNumber = 0; // Aktuellt frågenummer, ökas i funktionen newQuestion

// Nedanstående variabler får sina värden från funktionen newQuestion.
let correctOption; // Korrekt alternativ (0, 1 el. 2)
let correctAnswer; // Korrekt svar (hela nationens namn)

/*---------------------------------------------------------------*/
// Denna funktion körs innan spelstart
let setup = function () {
  flagImage = document.querySelector(".flag");
  scoreContainer = document.querySelector(".score-container");
  scoreText = document.querySelector(".score-text");
  resultWindow = document.querySelector(".modal");
  resultText = document.querySelector(".result-text");
  btnCloseModal = document.querySelector(".close-modal");
  feedbackContainer = document.querySelector(".feedback-container");
  feedbackText = document.querySelector(".feedback-text");
  rbs = document.querySelectorAll('input[name="val"]');
  btn = document.querySelector(".pushbutton");
  alt1 = document.getElementById("nat-1-text");
  alt2 = document.getElementById("nat-2-text");
  alt3 = document.getElementById("nat-3-text");
  title = document.querySelector(".title");
  ordernum = document.querySelector(".ordernum");
  overlay = document.querySelector(".overlay");

  title.textContent = "Game of Flags"; // Texten på webbläsarfliken
  scoreText.textContent = 'Här visas poängen';
  scoreText.style.fontSize = "24px";
  scoreContainer.style.backgroundColor = "transparent";
};

/*---------------------------------------------------------------*/
// Denna funktion körs vid spelstart
let init = function () {
  // Se https://sv.wikipedia.org/wiki/Lista_över_Natos_landskoder
  flags = ["DEU", "FRA", "GRC", "HRV", "IRL", "ITA", "NLD", "SVK", "SWE"];
  alternatives = Array.from(flags); // Ovanstående array kopieras
  score = 0;
  qNumber = 0;
  newQuestion();
};

/*---------------------------------------------------------------*/
// Denna funktion skapar en ny fråga
let newQuestion = function () {
  btn.disabled = false;
  qNumber += 1;
  ordernum.textContent = `${qNumber}/${NUMBER_OF_QUESTIONS}`;
  setFeedback(); // Tar bort ev. tidigare feedback.
  // Ny ordning på länderna inför varje fråga.
  // Det första landet i listan kommer att motsvara den flagga som presenteras.
  flags = shuffle(flags);
  alternatives = shuffle(alternatives);
  const currentFlag = flags[0];

  let options = pickOptions(currentFlag);
  let correctOption = findCorrectOption(options, currentFlag);

  // Nu visas den aktuella flaggan och dess svarsalternativ
  flagImage.src = `images/${currentFlag}.png`;
  alt1.textContent = `${COUNTRY_NAMES[`${options[0]}`]}`;
  alt2.textContent = `${COUNTRY_NAMES[`${options[1]}`]}`;
  alt3.textContent = `${COUNTRY_NAMES[`${options[2]}`]}`;

  correctAnswer = COUNTRY_NAMES[`${options[correctOption]}`];

  // Tar bort den framslumpade flaggan ur listan så att den inte återkommer.
  if (flags.length > 0) {
    flags.shift(); // Metoden shift tar bort det första elementet ur en array
  } else {
    // Om alla flaggor använts så skrivs ett felmeddelande ut till konsolen.
    // Programmet bör byggas så att alla flaggor inte kan användas, men det
    // är ändå bra att hantera en möjlig bugg under utvecklingsskedet.
    console.error("Finns inga fler flaggor att slumpa fram!");
  }
};

/*---------------------------------------------------------------*/
// Denna skapar en blandad alternativlista
const pickOptions = function (currentFlag) {
  let options = [];
  if (flags.length > 0) {
    // Här skjuts korrekt svar in först i listan med alternativen
    options.push(currentFlag);
  }
  for (let option of alternatives) {
    // Garanterar att det rätta svaret inte läggs till igen
    if (option != currentFlag) {
      options.push(option);
    }
    if (options.length === NUMBER_OF_OPTIONS) break;
  }
  options = shuffle(options);
  return options;
};

/*---------------------------------------------------------------*/
// Denna funktion söker reda på korrekt svarsalternativ
const findCorrectOption = function (options, currentFlag) {
  for (let i = 0; i < NUMBER_OF_OPTIONS; i++) {
    if (options[i] === currentFlag) {
      correctOption = i;
    }
    if (flags.length === 0) {
      correctOption = undefined; // När flaggorna är slut saknas korrekt svar
    }
  }
  return correctOption; // Returnerar 0, 1 eller 2.
};

/*---------------------------------------------------------------*/
// Denna funktion visar feedback på svaret. Feedbacken och formateringen
// baseras på parametern "val":
// Rätt alternativ: 1
// Fel alternativ: -1
// Pass / inget alternativ: undefined
const setFeedback = function (val) {
  setStyle(val);
  feedbackText.textContent = val
    ? val === 1
      ? "Rätt!"
      : `Rätt svar var:\r\n\r\n${correctAnswer}.`
    : "Rätt svar: +1p\r\nFel svar:  -1p\r\nPass:       0p";
};
/*---------------------------------------------------------------*/
// Denna funktion formaterar feedback-rutan baserat på parametern style
const setStyle = function (style) {
  // "white-space" och "pre" ger möjlighet till att göra radbrytningar
  feedbackContainer.setAttribute("style", "white-space: pre;");
  switch (style) {
    case 1:
      // Grön färg, korrekt valt alternativ!
      feedbackText.style.fontSize = "48px";
      feedbackText.style.color = "white";
      feedbackContainer.style.backgroundColor = "green";
      break;
    case -1:
      // Fel alternativ valt, rätt svar skrivs ut på röd färg
      feedbackContainer.style.backgroundColor = "red";
      feedbackText.style.fontSize = "18px";
      feedbackText.style.color = "white";
      break;
    default:
      feedbackText.style.color = "darkgrey";
      feedbackText.style.fontSize = "16px";
      feedbackContainer.style.backgroundColor = "transparent";
  }
};

/*---------------------------------------------------------------*/
// När knappen "Ange svar" trycks in körs detta
const buttonClick = function () {
  let selectedValue;
  // Loopa igenom alla radioknappar för att
  // detektera vilken som är vald
  for (const rb of rbs) {
    if (rb.checked) {
      selectedValue = rb.value; // Kan vara "0", "1", "2" el. "Pass" (strängar)
      break;
    }
  }

  btn.disabled = true; // Knapp avaktiveras medan svar utvärderas och feedback ges

  // evaluatedAnswer antar värdet 1 (korrekt svar), -1 (fel svar) el. undefined (pass)
  const evaluatedAnswer = evaluateOption(selectedValue);
  // gameOver när antalet frågor är uppfyllt
  const gameOver = qNumber === NUMBER_OF_QUESTIONS ? true : false;

  if (evaluatedAnswer) {
    setFeedback(evaluatedAnswer);
    updateScore(evaluatedAnswer)
    setTimeout(function () {
      gameOver ? finishGame() : newQuestion();
    }, 1000);
  } else gameOver ? finishGame() : newQuestion();

  resetRadioBtn();
};

/*---------------------------------------------------------------*/
// Returnerar 1 vid korrekt svar, -1 vid fel och undefined vid pass
const evaluateOption = option =>
  Number(option) === correctOption ? 1 : option != "Pass" ? -1 : undefined;

/*---------------------------------------------------------------*/
// Funktion som återställer markerad radioknapp till förvalet Pass
const resetRadioBtn = function () {
  radiobtn = document.getElementById("pass");
  radiobtn.checked = true;
};

/*---------------------------------------------------------------*/
// Funktion som blandar en lista, tagen från
// https://stackoverflow.com/a/2450976
const shuffle = function (array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

/*---------------------------------------------------------------*/
// Visar resultatfönstret, anropas efter sista flaggan
const finishGame = function () {
  resultWindow.classList.remove("hidden");
  overlay.classList.remove("hidden");
  resultText.textContent = score;
};

// Stänger resultatfönstret och börjar på ny spelomgång
const closeResult = function () {
  resultWindow.classList.add("hidden");
  overlay.classList.add("hidden");
  init();
};

/*---------------------------------------------------------------*/
// Implementera funktionen för poängräkning nedan och dess anrop.
let updateScore = function (theScore) {
  score += theScore;
  if (score < 0){score = 0;}
  scoreText.textContent = score;
  console.log(theScore);
};

setup(); // Sätter vissa startvärden till HTML-dokumentet
btn.addEventListener("click", buttonClick);
btnCloseModal.addEventListener("click", closeResult);
overlay.addEventListener("click", closeResult);
init(); // Sätter startvärden för programkörning och startar slumpandet av flaggor