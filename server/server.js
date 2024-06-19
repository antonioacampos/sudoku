const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 8000;

app.use(cors());
app.use(bodyParser.json());

var pool = new Pool({
  user: 'postgres',      
  host: 'localhost',        
  database: 'sudoku',       
  password: 'reparticao',   
  port: 5432,               
});


pool.connect()
  .then(() => console.log('Conectado ao PostgreSQL'))
  .catch(err => console.error('Erro ao conectar ao PostgreSQL', err));

app.post('/register', async (req, res) => {
  let sql = 'INSERT INTO users (username, password) VALUES ($1, $2)'
  let { username, password } = req.body;
  let hashedPassword = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      sql,
      [username, hashedPassword]
    );
    res.status(201).json({ username, message: 'Usuário criado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
});

app.post('/login', async (req, res) => {
  let { username, password } = req.body;
  var sql = 'SELECT * FROM users WHERE username = $1'
  try {
    let result = await pool.query(
      sql,
      [username]
    );
    let user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    let isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    let token = jwt.sign({ username: user.username }, 'seu_segredo', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao fazer login', error });
  }
});

let authenticateJWT = (req, res, next) => {
  let token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(403).json({ message: 'Token não fornecido' });
  }

  try {
    let decoded = jwt.verify(token, 'seu_segredo');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido', error });
  }
};

app.post('/results', authenticateJWT, async (req, res) => {
  let { board_id, time } = req.body;
  let username = req.user.username;
  var sql = 'INSERT INTO results (username, board_id, time) VALUES ($1, $2, $3)';
  
  try {
    await pool.query(sql, [username, board_id, time]);
    res.status(200).json({ message: 'Resultado registrado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar resultado:', error); 
    res.status(500).json({ message: 'Erro ao registrar resultado', error });
  }
});


app.post('/game', async (req, res) => {
  let board = generateSudokuBoard(30);
  let board_id = generateBoardId();

  try {
    await pool.query(
      'INSERT INTO boards (board_id, board) VALUES ($1, $2)',
      [board_id, JSON.stringify(board)]
    );
    res.status(200).json({ board_id, board });
  } catch (error) {
    console.error('Erro ao criar tabuleiro', error);
    res.status(500).json({ message: 'Erro ao criar tabuleiro', error });
  }
});

app.get('/results/:board_id', async (req, res) => {
  let { board_id } = req.params;

  try {
    let result = await pool.query(
      'SELECT * FROM results WHERE board_id = $1 ORDER BY time ASC',
      [board_id]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao obter resultados', error);
    res.status(500).json({ message: 'Erro ao obter resultados', error });
  }
});

app.get('/game/:board_id', async (req, res) => {
  let { board_id } = req.params;

  try {
    let result = await pool.query(
      'SELECT * FROM boards WHERE board_id = $1',
      [board_id]
    );
    let board = result.rows[0];
    if (board) {
      res.status(200).json({ board_id: board.board_id, board: JSON.parse(board.board) });
    } else {
      res.status(404).json({ message: 'Tabuleiro não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao obter tabuleiro', error);
    res.status(500).json({ message: 'Erro ao obter tabuleiro', error });
  }
});

app.delete('/users/:username', async (req, res) => {
  let { username } = req.params;

  try {
    await pool.query(
      'DELETE FROM users WHERE username = $1',
      [username]
    );
    res.status(200).json({ username, message: 'Usuário removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover usuário', error);
    res.status(500).json({ message: 'Erro ao remover usuário', error });
  }
});

app.post('/validate', (req, res) => {
  let { board } = req.body;
  if (isValidSudokuBoard(board)) {
    res.status(200).json({ message: 'Tabuleiro válido' });
  } else {
    res.status(400).json({ message: 'Tabuleiro inválido' });
  }
});

function generateSudokuBoard(emptySpaces = 30) {
  let board = Array.from({ length: 9 }, () => Array(9).fill(0));

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
      let row = Math.floor(Math.random() * 9);
      let col = Math.floor(Math.random() * 9);
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

function isValidSudokuBoard(board) {
  function isValidGroup(group) {
    let seen = new Set();
    for (let num of group) {
      if (num !== 0) {
        if (seen.has(num)) {
          return false;
        }
        seen.add(num);
      }
    }
    return true;
  }

  function getRow(board, row) {
    return board[row];
  }

  function getColumn(board, col) {
    return board.map(row => row[col]);
  }

  function getBlock(board, block) {
    let blockRow = Math.floor(block / 3) * 3;
    let blockCol = (block % 3) * 3;
    let blockCells = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        blockCells.push(board[blockRow + i][blockCol + j]);
      }
    }
    return blockCells;
  }

  for (let i = 0; i < 9; i++) {
    let row = getRow(board, i);
    let col = getColumn(board, i);
    let block = getBlock(board, i);

    if (!isValidGroup(row) || !isValidGroup(col) || !isValidGroup(block)) {
      return false;
    }
  }

  return true;
}

app.listen(port, () => {
  console.log(`Server rodando na porta: ${port}`);
});
