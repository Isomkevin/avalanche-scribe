### **Project Summary**

This project, which I'll call **Avalanche Scribe**, is a sophisticated, web-based **AI-Powered Smart Contract IDE** specifically designed for the **Avalanche blockchain**.

Its primary goal is to provide Solidity developers with a powerful and intelligent environment to write, analyze, debug, and simulate smart contracts directly in their browser, leveraging various AI services to enhance the development process. The application is currently configured to interact with the **Avalanche Fuji Testnet**.

### **Core Functionality**

*   **Smart Contract Editor:** A rich code editor (Monaco, the engine for VS Code) with Solidity syntax highlighting and contextual actions.
*   **AI Code Explanation:** Users can select a piece of code or an entire contract and request an AI-generated explanation of its functionality, structure, and purpose.
*   **AI-Powered Debugging:** The IDE integrates with AI services and security tools like OpenZeppelin Defender to analyze code for potential vulnerabilities, bugs, and gas optimization opportunities.
*   **Fuji Testnet Simulation:** Developers can simulate the execution of their smart contract functions on the Avalanche Fuji testnet to see the outcome without a full deployment.
*   **Wallet Integration:** The application connects to the user's Avalanche wallet. We have just implemented the integration for the **Core wallet**.

### **Monetization & Usage (Work in Progress)**

We are currently implementing a credit-based system to monetize the AI features:

1.  **AI Credits:** A custom, on-chain token (`AICredits.sol`) that is not transferable.
2.  **AVAX Top-Up:** Users will top up their AI Credit balance by sending AVAX to a smart contract. The contract automatically converts AVAX to AI Credits at a set exchange rate (e.g., 1 AVAX = 1000 credits).
3.  **Metered Usage:** Each AI-powered action (explain, debug, simulate) will cost a specific amount of AI Credits, which are deducted from the user's on-chain balance.

### **Technical Architecture**

The project is a full-stack application with three main components:

**1. Frontend (React SPA)**
*   **Description:** This is the user-facing single-page application that contains the IDE and all the controls. It's a modern, responsive UI.
*   **Key Components:**
    *   `AvalancheIDE.tsx`: The central component that lays out the editor, control buttons, and results panels.
    *   `Editor`: An instance of the Monaco Editor for code.
    *   `ConnectWallet.tsx`: The component we added for connecting to the Core wallet.
    *   `TopUp.tsx`: The component we're adding for the AVAX top-up functionality.
    *   `ui/`: A rich library of UI components (Buttons, Cards, Tabs, etc.), likely based on `shadcn/ui`.
*   **Technology Stack:**
    *   **Framework:** React
    *   **Language:** TypeScript
    *   **Build Tool:** Vite
    *   **Styling:** Tailwind CSS
    *   **Blockchain Interaction:** Ethers.js, @web3-react
    *   **UI Components:** shadcn/ui, Lucide Icons

**2. Backend (`ai-debugger-backend-1`)**
*   **Description:** This is a Node.js service that acts as the "brain" of the operation. It orchestrates the requests from the frontend, interacts with external AI and blockchain services, and returns the results.
*   **Key Services:**
    *   `avalancheRpcService.ts`: Communicates with the Avalanche network (e.g., for simulations).
    *   `claudeService.ts` & `openaiService.ts`: Integrates with large language models (Claude and OpenAI) for code explanation and debugging suggestions.
    *   `openzeppelinDefenderService.ts`: Likely used for more in-depth security analysis and debugging.
*   **Technology Stack:**
    *   **Runtime:** Node.js
    *   **Language:** TypeScript

**3. Blockchain (Smart Contracts)**
*   **Description:** This layer consists of the Solidity smart contracts deployed on the Avalanche C-Chain.
*   **Contracts:**
    *   `AICredits.sol`: The contract we created to manage the AI credit system, including balances, top-ups, and spending.
*   **Technology Stack:**
    *   **Language:** Solidity
    *   **Development Environment:** Hardhat

### **User Flow**

1.  A developer navigates to the web application.
2.  They are presented with the IDE, pre-filled with a sample contract.
3.  They click the **"Connect to Core"** button to link their wallet.
4.  They use the **Top-Up** component to send AVAX and receive AI Credits.
5.  They write or modify their Solidity code in the editor.
6.  They click **"Explain"**, **"Debug"**, or **"Simulate"**.
7.  The frontend sends the code and the requested action to the backend.
8.  The backend validates that the user has enough AI Credits (this part is still to be fully implemented).
9.  The backend calls the appropriate service (OpenAI, Avalanche RPC, etc.).
10. The results are sent back to the frontend and displayed in the corresponding tab (AI Explain, Debug, or Simulate).
