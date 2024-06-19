import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

const apiUrl = 'http://localhost:8000'; // Certifique-se de que a porta está correta

async function createNewGame() {
    try {
        const response = await fetch(`${apiUrl}/game`, {
            method: 'POST'
        });
        const data = await response.json();
        displayBoard(data.board);
    } catch (error) {
        console.error('Error creating new game:', error);
    }
}

let timerInterval;

function startTimer() {
    const timerDiv = document.getElementById('timer');
    let seconds = 0;

    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerDiv.textContent = `Time: ${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function displayBoard(board) {
    const gameBoardDiv = document.getElementById('gameBoard');
    gameBoardDiv.style.display = 'block'; // Torna a div visível
    gameBoardDiv.innerHTML = '';
    startTimer();

    board.forEach((row, rowIndex) => {
        const rowDiv = document.createElement('div');
        rowDiv.classList.add('columns', 'is-gapless', 'is-mobile', 'sudoku-row');

        row.forEach((cell, cellIndex) => {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('column', 'is-one-ninth', 'sudoku-cell');

            if (cell === 0) {
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 1;
                input.max = 9;
                input.classList.add('input', 'sudoku-input');
                input.dataset.row = rowIndex;
                input.dataset.cell = cellIndex;
                cellDiv.appendChild(input);
            } else {
                const numberDiv = document.createElement('div');
                numberDiv.classList.add('sudoku-number');
                numberDiv.textContent = cell;
                cellDiv.appendChild(numberDiv);
            }

            rowDiv.appendChild(cellDiv);
        });

        gameBoardDiv.appendChild(rowDiv);
    });
}

async function registerUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log(`Usuário: ${username}, Senha: ${password}`);
    try {
        const response = await fetch(`${apiUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error registering user:', error);
    }
}

async function submitResult() {
    const username = document.getElementById('resultUsername').value;
    const board_id = document.getElementById('resultBoardId').value;
    const time = document.getElementById('resultTime').value;
    try {
        const response = await fetch(`${apiUrl}/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, board_id, time })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error submitting result:', error);
    }
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section className="section">
        <div className="container">
          <h1 className="title">Sudoku game</h1>
          <div className="box">
            <button id="createGame" className="button is-primary" onClick={createNewGame}>Create New Game</button>
          </div>
          <div id="timer"></div>
          <div id="gameBoard" className="box has-background-light"></div>

          <div className="box">
            <h2 className="title is-4">Register User</h2>
            <div className="field">
              <label className="label">Username</label>
              <div className="control">
                <input className="input" type="text" id="username" placeholder="Username" />
              </div>
            </div>
            <div className="field">
              <label className="label">Password</label>
              <div className="control">
                <input className="input" type="password" id="password" placeholder="Password" />
              </div>
            </div>
            <button id="registerUser" className="button is-link" onClick={registerUser}>Register</button>
          </div>

          <div className="box">
            <h2 className="title is-4">Submit Result</h2>
            <div className="field">
              <label className="label">Username</label>
              <div className="control">
                <input className="input" type="text" id="resultUsername" placeholder="Username" />
              </div>
            </div>
            <div className="field">
              <label className="label">Board ID</label>
              <div className="control">
                <input className="input" type="text" id="resultBoardId" placeholder="Board ID" />
              </div>
            </div>
            <div className="field">
              <label className="label">Time (seconds)</label>
              <div className="control">
                <input className="input" type="number" id="resultTime" placeholder="Time (seconds)" />
              </div>
            </div>
            <button id="submitResult" className="button is-success" onClick={submitResult}>Submit</button>
          </div>
        </div>
      </section>
    </>
  );
}

export default App;
