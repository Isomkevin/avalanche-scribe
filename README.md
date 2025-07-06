# Avalanche Scribe

Avalanche Scribe is a web-based IDE for writing, compiling, and deploying Solidity smart contracts on the Avalanche blockchain. It provides a rich-editing experience powered by the Monaco editor, along with tools for interacting with your contracts and debugging them with the help of AI.

## Features

- **Solidity IDE**: A full-featured code editor for Solidity with syntax highlighting, and autocompletion.
- **Contract Compilation**: Compile your Solidity code and view the ABI and bytecode.
- **Contract Deployment**: Deploy your smart contracts to the Avalanche C-Chain.
- **Contract Interaction**: Interact with the functions of your deployed smart contracts.
- **AI-Powered Debugging**: Get help from AI to debug your smart contracts.
- **OpenZeppelin Defender Integration**: Monitor and manage your contracts with OpenZeppelin Defender.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Isomkevin/avalanche-scribe.git
   cd avalanche-scribe
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root of the project and add the following environment variables:

   ```
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_OPENZEPPELIN_API_KEY=your-openzeppelin-api-key
   VITE_OPENZEPPELIN_API_SECRET=your-openzeppelin-api-secret
   ```

### Running the Application

```bash
bun run dev
```

This will start the development server and open the application in your browser at `http://localhost:5173`.

## Usage

1. **Write your Solidity code** in the editor.
2. **Compile your code** by clicking the "Compile" button.
3. **Deploy your contract** by clicking the "Deploy" button.
4. **Interact with your contract** using the provided UI.

## Project Structure

The project is a monorepo with the following structure:

- `ai-debugger-backend-1/`: The backend service for AI-powered debugging.
- `src/`: The frontend React application.
- `public/`: Static assets for the frontend.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.