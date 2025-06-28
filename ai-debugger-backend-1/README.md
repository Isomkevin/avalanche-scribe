# AI-Powered Smart Contract Debugger

This project is an AI-powered smart contract debugger built using Node.js and Express. It provides an API for developers to analyze, debug, and simulate Solidity smart contracts using various AI services.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-debugger-backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Set up environment variables (if necessary) for API keys and other configurations.

## Usage

To start the server, run:
```
npm run dev
```
The server will be running on `http://localhost:3000`.

## API Endpoints

### Explain Solidity Code
- **Endpoint:** `POST /api/debugger/explain`
- **Request Body:**
  ```json
  {
    "code": "string",
    "functionSelection": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": "string",
    "error": null
  }
  ```

### Debug Solidity Code
- **Endpoint:** `POST /api/debugger/debug`
- **Request Body:**
  ```json
  {
    "code": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": "string",
    "error": null
  }
  ```

### Simulate Solidity Code
- **Endpoint:** `POST /api/debugger/simulate`
- **Request Body:**
  ```json
  {
    "contractCode": "string",
    "functionName": "string",
    "arguments": ["string"],
    "network": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": "string",
    "error": null
  }
  ```

### Get Decorations
- **Endpoint:** `POST /api/debugger/decorations`
- **Request Body:**
  ```json
  {
    "code": "string",
    "explanations": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": "string",
    "error": null
  }
  ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.