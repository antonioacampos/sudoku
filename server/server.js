const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8000;

console.log("Iniciando configuração do servidor...");
app.use(cors());
console.log("CORS configurado.");
app.use(bodyParser.json());
console.log("BodyParser configurado.");

let users = [];
let boards = [];
let results = [];

app.post('/game', (req, res) => {
    var board = generateSudokuBoard(30);
    var board_id = generateBoardId();
    boards.push({ board_id, board });
    console.log(`Novo jogo criado com ID: ${board_id}`);
    res.status(200).json({ board_id, board });
});

app.post('/users', (req, res) => {
    var { username, password } = req.body;
    users.push({ username, password });
    console.log(`Usuário criado: ${username}`);
    res.status(201).json({ username, message: 'Usuário criado com sucesso' });
});

app.post('/results', (req, res) => {
    var { username, board_id, time } = req.body;
    results.push({ username, board_id, time });
    console.log(`Resultado registrado para usuário: ${username} no tabuleiro: ${board_id}`);
    res.status(200).json({ message: 'Resultado registrado com sucesso' });
});

app.get('/results/:board_id', (req, res) => {
    var { board_id } = req.params;
    var boardResults = results.filter(result => result.board_id === board_id);
    boardResults.sort((a, b) => a.time - b.time);
    console.log(`Resultados para o tabuleiro: ${board_id}`);
    res.status(200).json(boardResults);
});

app.get('/game/:board_id', (req, res) => {
    var { board_id } = req.params;
    var board = boards.find(b => b.board_id === board_id);
    if (board) {
        console.log(`Detalhes do tabuleiro: ${board_id}`);
        res.status(200).json({ board_id: board.board_id, board: board.board });
    } else {
        console.log(`Tabuleiro não encontrado: ${board_id}`);
        res.status(404).json({ message: 'Tabuleiro não encontrado' });
    }
});

app.delete('/users/:username', (req, res) => {
    var { username } = req.params;
    users = users.filter(user => user.username !== username);
    console.log(`Usuário removido: ${username}`);
    res.status(200).json({ username, message: 'Usuário removido com sucesso' });
});

/*function generateSudokuBoard() {
    return [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];
}*/
function generateSudokuBoard(emptySpaces = 30) {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    function isSafe(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num || board[x][col] === num || board[3 * Math.floor(row / 3) + Math.floor(x / 3)][3 * Math.floor(col / 3) + x % 3] === num) {
                return false;
            }
        }
        return true;
    }

    function solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isSafe(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    function removeNumbers(board, count) {
        while (count > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                count--;
            }
        }
    }

    solveSudoku(board);
    removeNumbers(board, emptySpaces);
    return board;
}

function generateBoardId() {
    return Math.random().toString(36).substring(2, 15);
}

app.listen(port, () => {
    console.log(`Server rodando na porta: ${port}`);
});
