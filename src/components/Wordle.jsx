import { useState, useRef, useEffect } from "react";
import "../styles/Wordle.scss";
import Row from "./Row";
import Keyboard from "./Keyboard";
import { LETTERS, potentialWords } from "../data/lettersAndWords";

const SOLUTION =
  potentialWords[Math.floor(Math.random() * potentialWords.length)];

console.log(SOLUTION);

export default function Wordle() {
  const [guesses, setGuesses] = useState([
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
    "     ",
  ]);
  const [solutionFound, setSolutionFound] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const [notification, setNotification] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [failedGuesses, setFailedGuesses] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [presentLetters, setPresentLetters] = useState([]);
  const [absentLetters, setAbsentLetters] = useState([]);

  const wordleRef = useRef();

  useEffect(() => {
    wordleRef.current.focus();
  }, []);

  const typeLetter = (letter) => {
    if (activeLetterIndex < 5) {
      setNotification("");

      let newGuesses = [...guesses];
      newGuesses[activeRowIndex] = replaceCharacter(
        newGuesses[activeRowIndex],
        activeLetterIndex,
        letter
      );

      setGuesses(newGuesses);
      setActiveLetterIndex((index) => index + 1);
    }
  };

  const replaceCharacter = (string, index, replacement) => {
    return (
      string.slice(0, index) +
      replacement +
      string.slice(index + replacement.length)
    );
  };

  const hitEnter = () => {
    if (activeLetterIndex === 5) {
      const currentGuess = guesses[activeRowIndex];

      if (!potentialWords.includes(currentGuess)) {
        setNotification("NOT IN THE WORD LIST");
      } else if (failedGuesses.includes(currentGuess)) {
        setNotification("WORD TRIED ALREADY");
      } else if (currentGuess === SOLUTION) {
        setSolutionFound(true);
        setNotification("WELL DONE");
        setCorrectLetters([...SOLUTION]);
      } else {
        let correctLetters = [];

        [...currentGuess].forEach((letter, index) => {
          if (SOLUTION[index] === letter) correctLetters.push(letter);
        });

        setCorrectLetters([...new Set(correctLetters)]);

        setPresentLetters([
          ...new Set([
            ...presentLetters,
            ...[...currentGuess].filter((letter) => SOLUTION.includes(letter)),
          ]),
        ]);

        setAbsentLetters([
          ...new Set([
            ...absentLetters,
            ...[...currentGuess].filter((letter) => !SOLUTION.includes(letter)),
          ]),
        ]);

        setFailedGuesses([...failedGuesses, currentGuess]);
        setActiveRowIndex((index) => index + 1);
        setActiveLetterIndex(0);
      }
    } else {
      setNotification("FIVE LETTER WORDS ONLY");
    }
  };

  const hitBackspace = () => {
    setNotification("");

    if (guesses[activeRowIndex][0] !== " ") {
      const newGuesses = [...guesses];

      newGuesses[activeRowIndex] = replaceCharacter(
        newGuesses[activeRowIndex],
        activeLetterIndex - 1,
        " "
      );

      setGuesses(newGuesses);
      setActiveLetterIndex((index) => index - 1);
    }
  };

  const handleKeyDown = (event) => {
    if (solutionFound) return;

    if (LETTERS.includes(event.key)) {
      typeLetter(event.key);
      return;
    }

    if (event.key === "Enter") {
      hitEnter();
      return;
    }

    if (event.key === "Backspace") {
      hitBackspace();
    }
  };

  return (
    <div
      className="wordle"
      ref={wordleRef}
      tabIndex="0"
      onBlur={(e) => {
        e.target.focus();
      }}
      onKeyDown={handleKeyDown}
    >
      <h1 className="title">Wordle Clone</h1>
      <div className={`notification ${solutionFound && "notification--green"}`}>
        {notification}
      </div>
      {guesses.map((guess, index) => {
        return (
          <Row
            key={index}
            word={guess}
            applyRotation={
              activeRowIndex > index ||
              (solutionFound && activeRowIndex === index)
            }
            solution={SOLUTION}
            bounceOnError={
              notification !== "WELL DONE" &&
              notification !== "" &&
              activeRowIndex === index
            }
          />
        );
      })}
      <Keyboard
        presentLetters={presentLetters}
        correctLetters={correctLetters}
        absentLetters={absentLetters}
        typeLetter={typeLetter}
        hitEnter={hitEnter}
        hitBackspace={hitBackspace}
      />
    </div>
  );
}
