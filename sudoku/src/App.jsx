import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sudoku from './sudoku';
import 'bulma/css/bulma.min.css';

function App() {
  let [isLoggedIn, setIsLoggedIn] = useState(false);
  let [token, setToken] = useState('');
  let [username, setUsername] = useState('');
  let [password, setPassword] = useState('');
  let [registerUsername, setRegisterUsername] = useState('');
  let [registerPassword, setRegisterPassword] = useState('');
  let [result, setResult] = useState({ board_id: '', time: '' });

  let navigate = useNavigate();

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      setIsLoggedIn(true);
    }
  }, []);

  let handleLogin = async () => {
    try {
      let response = await axios.post('http://localhost:8000/login', { username, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setIsLoggedIn(true);
      navigate('/sudoku');
    } catch (error) {
      console.error('Erro ao fazer login', error);
    }
  };

  let handleRegister = async () => {
    try {
      await axios.post('http://localhost:8000/register', { username: registerUsername, password: registerPassword });
      alert('Registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar', error);
    }
  };

  let handleResultSubmit = async () => {
    try {
      await axios.post('http://localhost:8000/results', result, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert('Resultado registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar resultado', error);
    }
  };

  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={
          isLoggedIn ? (
            <Navigate to="/sudoku" />
          ) : (
            <div className="section">
              <div className="container">
                <div className="columns is-centered">
                  <div className="column">
                    <h2 className="title">Login</h2>
                    <div className="field">
                      <label className="label">Usuário</label>
                      <div className="control">
                        <input className="input" type="text" placeholder="Usuário" value={username} onChange={e => setUsername(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Senha</label>
                      <div className="control">
                        <input className="input" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <div className="control">
                        <button className="button is-primary" onClick={handleLogin}>Login</button>
                      </div>
                    </div>
                    <h2 className="title">Registrar</h2>
                    <div className="field">
                      <label className="label">Usuário</label>
                      <div className="control">
                        <input className="input" type="text" placeholder="Usuário" value={registerUsername} onChange={e => setRegisterUsername(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">Senha</label>
                      <div className="control">
                        <input className="input" type="password" placeholder="Senha" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} />
                      </div>
                    </div>
                    <div className="field">
                      <div className="control">
                        <button className="button is-link" onClick={handleRegister}>Registrar</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        } />
        <Route path="/sudoku" element={
          isLoggedIn ? (
            <Sudoku handleResultSubmit={handleResultSubmit} result={result} setResult={setResult} />
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/" element={
          isLoggedIn ? <Navigate to="/sudoku" /> : <Navigate to="/login" />
        } />
      </Routes>
    </div>
  );
}

export default App;
