import { useState, useEffect, useRef } from 'react';
import './App.css';

let apiUrl = 'http://localhost:8000';

let timerInterval;

function startTimer() {
    stopTimer();
    let timerDiv = document.getElementById('timer');
    let seconds = 0;

    timerInterval = setInterval(() => {
        seconds++;
        let minutes = Math.floor(seconds / 60);
        let displaySeconds = seconds % 60;
        timerDiv.textContent = `Time: ${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

async function createNewGame(setShufflingInterval, shuffleInterval, setBoardId) {
    try {
        let response = await fetch(`${apiUrl}/game`, {
            method: 'POST'
        });
        let data = await response.json();
        displayBoard(data.board, Array.from({ length: 9 }, () => Array(9).fill(null)));
        setBoardId(data.board_id);

        if (setShufflingInterval.current) {
            clearInterval(setShufflingInterval.current);
        }

        setShufflingInterval.current = startShufflingBoard(data.board, shuffleInterval);
        startTimer(); 
    } catch (error) {
        console.error('Error creating new game:', error);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function shuffleSudokuBoard(board, inputs) {
    let newBoard = JSON.parse(JSON.stringify(board));
    let newInputs = JSON.parse(JSON.stringify(inputs));

    for (let i = 0; i < 9; i += 3) {
        let rows = [i, i + 1, i + 2];
        shuffleArray(rows);
        let temp = newBoard.slice(i, i + 3);
        newBoard[i] = temp[rows[0] - i];
        newBoard[i + 1] = temp[rows[1] - i];
        newBoard[i + 2] = temp[rows[2] - i];

        let tempInputs = newInputs.slice(i, i + 3);
        newInputs[i] = tempInputs[rows[0] - i];
        newInputs[i + 1] = tempInputs[rows[1] - i];
        newInputs[i + 2] = tempInputs[rows[2] - i];
    }

    for (let i = 0; i < 9; i += 3) {
        let cols = [i, i + 1, i + 2];
        shuffleArray(cols);
        for (let row = 0; row < 9; row++) {
            let temp = [newBoard[row][i], newBoard[row][i + 1], newBoard[row][i + 2]];
            newBoard[row][i] = temp[cols[0] - i];
            newBoard[row][i + 1] = temp[cols[1] - i];
            newBoard[row][i + 2] = temp[cols[2] - i];

            let tempInputs = [newInputs[row][i], newInputs[row][i + 1], newInputs[row][i + 2]];
            newInputs[row][i] = tempInputs[cols[0] - i];
            newInputs[row][i + 1] = tempInputs[cols[1] - i];
            newInputs[row][i + 2] = tempInputs[cols[2] - i];
        }
    }

    let rowBlocks = [0, 3, 6];
    shuffleArray(rowBlocks);
    let tempRows = newBoard.slice();
    let tempInputsRows = newInputs.slice();
    for (let i = 0; i < 3; i++) {
        newBoard[i * 3] = tempRows[rowBlocks[i]];
        newBoard[i * 3 + 1] = tempRows[rowBlocks[i] + 1];
        newBoard[i * 3 + 2] = tempRows[rowBlocks[i] + 2];

        newInputs[i * 3] = tempInputsRows[rowBlocks[i]];
        newInputs[i * 3 + 1] = tempInputsRows[rowBlocks[i] + 1];
        newInputs[i * 3 + 2] = tempInputsRows[rowBlocks[i] + 2];
    }

    let colBlocks = [0, 3, 6];
    shuffleArray(colBlocks);
    for (let row = 0; row < 9; row++) {
        let temp = [newBoard[row][0], newBoard[row][3], newBoard[row][6]];
        newBoard[row][0] = temp[colBlocks[0] / 3];
        newBoard[row][3] = temp[colBlocks[1] / 3];
        newBoard[row][6] = temp[colBlocks[2] / 3];

        let tempInputs = [newInputs[row][0], newInputs[row][3], newInputs[row][6]];
        newInputs[row][0] = tempInputs[colBlocks[0] / 3];
        newInputs[row][3] = tempInputs[colBlocks[1] / 3];
        newInputs[row][6] = tempInputs[colBlocks[2] / 3];

        let temp1 = [newBoard[row][1], newBoard[row][4], newBoard[row][7]];
        newBoard[row][1] = temp1[colBlocks[0] / 3];
        newBoard[row][4] = temp1[colBlocks[1] / 3];
        newBoard[row][7] = temp1[colBlocks[2] / 3];

        let tempInputs1 = [newInputs[row][1], newInputs[row][4], newInputs[row][7]];
        newInputs[row][1] = tempInputs1[colBlocks[0] / 3];
        newInputs[row][4] = tempInputs1[colBlocks[1] / 3];
        newInputs[row][7] = tempInputs1[colBlocks[2] / 3];

        let temp2 = [newBoard[row][2], newBoard[row][5], newBoard[row][8]];
        newBoard[row][2] = temp2[colBlocks[0] / 3];
        newBoard[row][5] = temp2[colBlocks[1] / 3];
        newBoard[row][8] = temp2[colBlocks[2] / 3];

        let tempInputs2 = [newInputs[row][2], newInputs[row][5], newInputs[row][8]];
        newInputs[row][2] = tempInputs2[colBlocks[0] / 3];
        newInputs[row][5] = tempInputs2[colBlocks[1] / 3];
        newInputs[row][8] = tempInputs2[colBlocks[2] / 3];
    }

    return { newBoard, newInputs };
}

function getBoardAndInputsFromDOM() {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));
    let inputs = Array.from({ length: 9 }, () => Array(9).fill(null));
    let cells = document.querySelectorAll('.sudoku-cell');

    cells.forEach(cell => {
        let row = cell.dataset.row;
        let col = cell.dataset.cell;
        let input = cell.querySelector('input');
        if (input) {
            let value = input.value;
            if (value) {
                board[row][col] = parseInt(value, 10);
            }
            inputs[row][col] = value || '';
        } else {
            let fixedNumber = cell.querySelector('.sudoku-number');
            if (fixedNumber) {
                board[row][col] = parseInt(fixedNumber.textContent, 10);
            }
        }
    });

    return { board, inputs };
}

function startShufflingBoard(initialBoard, interval) {
    let currentBoard = initialBoard;
    let currentInputs = getBoardAndInputsFromDOM().inputs;
    return setInterval(() => {
        let { board, inputs } = getBoardAndInputsFromDOM();
        currentBoard = board;
        currentInputs = inputs;
        let { newBoard, newInputs } = shuffleSudokuBoard(currentBoard, currentInputs);
        displayBoard(newBoard, newInputs);
    }, interval);
}

function displayBoard(board, inputs) {
    let gameBoardDiv = document.getElementById('gameBoard');
    gameBoardDiv.style.display = 'block';
    gameBoardDiv.innerHTML = '';

    board.forEach((row, rowIndex) => {
        let rowDiv = document.createElement('div');
        rowDiv.classList.add('columns', 'is-gapless', 'is-mobile', 'sudoku-row');

        row.forEach((cell, cellIndex) => {
            let cellDiv = document.createElement('div');
            cellDiv.classList.add('column', 'is-one-ninth', 'sudoku-cell');
            cellDiv.dataset.row = rowIndex;
            cellDiv.dataset.cell = cellIndex;

            if (inputs && inputs[rowIndex] && inputs[rowIndex][cellIndex] !== null) {
                let input = document.createElement('input');
                input.type = 'text';
                input.classList.add('input', 'sudoku-input');
                input.value = inputs[rowIndex][cellIndex];
                input.dataset.row = rowIndex;
                input.dataset.cell = cellIndex;
                input.addEventListener('change', handleInputChange);
                input.addEventListener('input', validateInput);
                cellDiv.appendChild(input);
            } else if (cell === 0) {
                let input = document.createElement('input');
                input.type = 'text';
                input.classList.add('input', 'sudoku-input');
                input.dataset.row = rowIndex;
                input.dataset.cell = cellIndex;
                input.addEventListener('change', handleInputChange);
                input.addEventListener('input', validateInput);
                cellDiv.appendChild(input);
            } else {
                let numberDiv = document.createElement('div');
                numberDiv.classList.add('sudoku-number');
                numberDiv.textContent = cell;
                cellDiv.appendChild(numberDiv);
            }

            rowDiv.appendChild(cellDiv);
        });

        gameBoardDiv.appendChild(rowDiv);
    });
}

function handleInputChange(event) {
    let input = event.target;
    let { board } = getBoardAndInputsFromDOM();
    validateBoard(board).then(isValid => {
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (isBoardComplete(board)) {
                handleBoardCompletion(board);
            }
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
        }
    });
}

function isBoardComplete(board) {
    return board.every(row => row.every(cell => cell !== 0));
}

function handleBoardCompletion(board) {
    stopTimer();
    alert('Parabéns! Você completou o Sudoku corretamente!');
    let inputs = document.querySelectorAll('.sudoku-input');
    inputs.forEach(input => input.disabled = true);
}

function validateInput(event) {
    let input = event.target;
    let value = input.value;
    if (value < '1' || value > '9' || value.length > 1) {
        input.value = '';
    }
}

async function validateBoard(board) {
    try {
        let response = await fetch(`${apiUrl}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ board })
        });
        if (!response.ok) {
            throw new Error('Failed to validate board');
        }
        let data = await response.json();
        return response.ok;
    } catch (error) {
        console.error('Error validating board:', error);
        return false;
    }
}

async function submitResult() {
    let board_id = document.getElementById('resultBoardId').value;
    let time = document.getElementById('resultTime').value;
    let token = localStorage.getItem('token');
    if (!token) {
        alert('Usuário não autenticado!');
        return;
    }
    try {
        let response = await fetch(`${apiUrl}/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ board_id, time })
        });

        if (!response.ok) {
            let errorData = await response.json();
            console.error('Erro no servidor:', errorData);
            throw new Error(errorData.message || 'Erro ao registrar resultado');
        }

        let data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error('Error submitting result:', error);
        alert(error.message);
    }
}


function Sudoku() {
    let [difficulty, setDifficulty] = useState('easy');
    let [boardId, setBoardId] = useState('');
    let shufflingInterval = useRef(null);

    let difficultyIntervals = {
        easy: 90000, 
        medium: 60000, 
        hard: 30000 
    };
    let handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    let handleDifficultyChange = (event) => {
        setDifficulty(event.target.value);
    };

    let handleCreateGame = () => {
        createNewGame(shufflingInterval, difficultyIntervals[difficulty], setBoardId);
    };

    return (
      <>
          <section className="section">
              <div className="container">
                  <h1 className="title">Sudoku</h1>
                  <div className="box">
                      <div className="field">
                          <label className="label">Selecione a dificuldade</label>
                          <div className="control">
                              <div className="select">
                                  <select value={difficulty} onChange={handleDifficultyChange}>
                                      <option value="easy">Fácil - 90s</option>
                                      <option value="medium">Médio - 60s</option>
                                      <option value="hard">Difícil - 30s</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                      <button id="createGame" className="button is-primary" onClick={handleCreateGame}>Criar novo tabuleiro</button>
                  </div>
                  <div id="timer"></div>
                  <div id="gameBoard" className="box has-background-light"></div>
                    {boardId && (
                        <div className="box">
                            <h2 className="title is-4">Board ID: {boardId}</h2>
                        </div>
                    )}

                  <div className="box">
                      <h2 className="title is-4">Enviar resultado</h2>
                      <div className="field">
                          <label className="label">Código do tabuleiro</label>
                          <div className="control">
                              <input className="input" type="text" id="resultBoardId" placeholder="código" />
                          </div>
                      </div>
                      <div className="field">
                          <label className="label">Tempo (segundos)</label>
                          <div className="control">
                              <input className="input" type="number" id="resultTime" placeholder="segundos" />
                          </div>
                      </div>
                      <button id="submitResult" className="button is-success" onClick={submitResult}>Enviar</button>
                  </div>
                  <div>
                    <button className="button" onClick={handleLogout}>Logout</button>

                  </div>
              </div>
          </section>
      </>
  );
}

export default Sudoku;
