# Sudoku Game API

Este projeto é uma API para um jogo de Sudoku, permitindo a criação de usuários, tabuleiros de Sudoku, registro de resultados e obtenção de informações sobre os jogos. A API é construída utilizando Node.js e Express.

## Pré-requisitos

- Node.js instalado
- npm (Node Package Manager) instalado

## Instalação

1. Clone o repositório para o seu ambiente local:
    ```bash
    git clone https://github.com/antonioacampos/sudoku
    ```
2. Navegue até o diretório do projeto:
    ```bash
    cd <diretório do projeto>
    ```
3. Instale as dependências:
    ```bash
    npm install
    ```

## Executando o Servidor

1. Inicie o servidor:
    ```bash
    node node.js
    ```
2. O servidor estará rodando na porta `8000`.

## Endpoints da API

### Criar um novo jogo
- **URL:** `/game`
- **Método:** `POST`
- **Resposta de Sucesso:** `200 OK`
- **Corpo da Resposta:**
  ```json
  {
    "board_id": "<ID do Tabuleiro>",
    "board": [[5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], ...]
  }
  ```

### Criar um novo usuário
- **URL:** `/users`
- **Método:** `POST`
- **Corpo da Requisição:**
  ```json
  {
    "username": "<Nome do Usuário>",
    "password": "<Senha>"
  }
  ```
- **Resposta de Sucesso:** `201 Created`
- **Corpo da Resposta:**
  ```json
  {
    "username": "<Nome do Usuário>",
    "message": "Usuário criado com sucesso"
  }
  ```

### Registrar um resultado
- **URL:** `/results`
- **Método:** `POST`
- **Corpo da Requisição:**
  ```json
  {
    "username": "<Nome do Usuário>",
    "board_id": "<ID do Tabuleiro>",
    "time": "<Tempo gasto>"
  }
  ```
- **Resposta de Sucesso:** `200 OK`
- **Corpo da Resposta:**
  ```json
  {
    "message": "Resultado registrado com sucesso"
  }
  ```

### Obter resultados de um tabuleiro
- **URL:** `/results/:board_id`
- **Método:** `GET`
- **Resposta de Sucesso:** `200 OK`
- **Corpo da Resposta:**
  ```json
  [
    {
      "username": "<Nome do Usuário>",
      "board_id": "<ID do Tabuleiro>",
      "time": "<Tempo gasto>"
    },
    ...
  ]
  ```

### Obter detalhes de um tabuleiro
- **URL:** `/game/:board_id`
- **Método:** `GET`
- **Resposta de Sucesso:** `200 OK`
- **Corpo da Resposta:**
  ```json
  {
    "board_id": "<ID do Tabuleiro>",
    "board": [[5, 3, 0, 0, 7, 0, 0, 0, 0], [6, 0, 0, 1, 9, 5, 0, 0, 0], ...]
  }
  ```

### Remover um usuário
- **URL:** `/users/:username`
- **Método:** `DELETE`
- **Resposta de Sucesso:** `200 OK`
- **Corpo da Resposta:**
  ```json
  {
    "username": "<Nome do Usuário>",
    "message": "Usuário removido com sucesso"
  }
  ```

## Como Utilizar

1. **Criar um Usuário:**
   - Faça uma requisição `POST` para `/users` com o corpo contendo `username` e `password`.

2. **Criar um Novo Jogo:**
   - Faça uma requisição `POST` para `/game` para criar um novo tabuleiro de Sudoku.

3. **Registrar um Resultado:**
   - Faça uma requisição `POST` para `/results` com `username`, `board_id` e `time` para registrar o tempo gasto em um jogo.

4. **Obter Resultados de um Tabuleiro:**
   - Faça uma requisição `GET` para `/results/:board_id` para obter os resultados de um tabuleiro específico.

5. **Obter Detalhes de um Tabuleiro:**
   - Faça uma requisição `GET` para `/game/:board_id` para obter os detalhes de um tabuleiro específico.

6. **Remover um Usuário:**
   - Faça uma requisição `DELETE` para `/users/:username` para remover um usuário específico.

## Contribuição

Se você deseja contribuir com este projeto, por favor, siga os passos abaixo:

1. Faça um fork do projeto.
2. Crie uma branch para sua feature ou correção de bug (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Crie um novo Pull Request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
```
