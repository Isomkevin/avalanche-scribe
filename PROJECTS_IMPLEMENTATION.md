# Project Goals: Avalanche Scribe

## **Primary Goal**

The primary goal of this project is to create **Avalanche Scribe**, a sophisticated, web-based **AI-Powered Smart Contract IDE** specifically designed for the **Avalanche blockchain**. The IDE will provide Solidity developers with a powerful and intelligent environment to write, analyze, debug, and simulate smart contracts directly in their browser, leveraging various AI services to enhance the development process. The application will be configured to interact with the **Avalanche Fuji Testnet**.

### **Core Feature Goals**

The project will implement the following core features:

*   **Smart Contract Editor:** A rich code editor (Monaco, the engine for VS Code) with Solidity syntax highlighting and contextual actions.
*   **AI Code Explanation:** Allow users to select a piece of code or an entire contract and request an AI-generated explanation of its functionality, structure, and purpose.
*   **AI-Powered Debugging:** Integrate with AI services and security tools like OpenZeppelin Defender to analyze code for potential vulnerabilities, bugs, and gas optimization opportunities.
*   **Fuji Testnet Simulation:** Enable developers to simulate the execution of their smart contract functions on the Avalanche Fuji testnet to see the outcome without a full deployment.
*   **Wallet Integration:** Implement seamless connection with popular Avalanche wallets, starting with the **Core wallet**.

### **Monetization & Usage Goals (Work in Progress)**

A key goal is to implement a monetization system using on-chain AI credits. This system will include:

1. **AI Credits:** Introduce a custom, on-chain, non-transferable token (`AICredits.sol`) and name the token (`$DEBUG`).
2. **AVAX Top-Up:** Develop a smart contract that allows users to top up their AI Credit balance by sending AVAX. The contract will automatically convert AVAX to AI Credits at a set exchange rate.
3. **Metered Usage:** Implement logic to deduct AI Credits from a user's on-chain balance for each AI-powered action (e.g., explain, debug, simulate).

### **Proposed Technical Architecture**

The project will be built using a full-stack architecture with the following components:

**1. Frontend (React SPA)**
*   **Description:** A user-facing single-page application containing the IDE and all controls.
*   **Technology Stack:** React, TypeScript, Vite, Tailwind CSS, Ethers.js, @web3-react, shadcn/ui.

**2. Backend (`ai-debugger-backend-1`)**
*   **Description:** A Node.js service to orchestrate requests, interact with external AI and blockchain services, and return results.
*   **Technology Stack:** Node.js, TypeScript.
*   **Integrations:** Avalanche RPC, Claude API, OpenAI API, OpenZeppelin Defender.

**3. Blockchain (Smart Contracts)**

* **Description:** Solidity smart contracts deployed on the Avalanche C-Chain.
* **Technology Stack:** Solidity, Hardhat.
* **Contracts:** `AICredits.sol` for managing the credit system.

### **Target User Flow**

The target user flow for the completed application will be as follows:

1. A developer navigates to the web application.
2. They are presented with the IDE, pre-filled with a sample contract.
3. They click the **"Connect to Core"** button to link their wallet.
4. They use the **Top-Up** component to send AVAX and receive AI Credits.
5. They write or modify their Solidity code in the editor.
6. They click **"Explain"**, **"Debug"**, or **"Simulate"**.
7. The frontend sends the code and the requested action to the backend.
8. The backend validates that the user has enough AI Credits.
9. The backend calls the appropriate external service (OpenAI, Avalanche RPC, Nvidia etc.).
10.The results are sent back to the frontend and displayed in the corresponding tab.