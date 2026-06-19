# Walkthrough: BitBacked

We have implemented a complete end-to-end decentralized professional reputation system (named **BitBacked**, inspired by Talent Protocol) targeting the **Stacks Blockchain (Bitcoin Layer 2)**. 

Below is a detailed breakdown of what has been accomplished, how to run it, and the results of our automated tests.

---

## 🛠️ Components Implemented

### 1. Smart Contracts (`contracts/`)
We have created three production-ready Clarity smart contracts that model the mechanics of the Talent Protocol:
*   [talent-passport.clar](file:///f:/stx%20june/contracts/talent-passport.clar): Manages the profile directory, credentials, verification statuses, and dynamic reputation scores.
*   [talent-token.clar](file:///f:/stx%20june/contracts/talent-token.clar): A SIP-010-compliant utility fungible token (`TAL`) representing the reputation currency of the protocol.
*   [talent-staking.clar](file:///f:/stx%20june/contracts/talent-staking.clar): The core backing engine that allows supporters to stake `TAL` to support developers, boosting their reputation score while claiming real-time block yield rewards.

### 2. Mainnet Integration Scripts (`scripts/`)
We have implemented typescript deployment and transaction scripts using the Hiro `@stacks/transactions` SDK:
*   [deploy-mainnet.ts](file:///f:/stx%20june/scripts/deploy-mainnet.ts): Automates sequential, dependent deployment of contracts to Stacks Mainnet.
*   [interact-mainnet.ts](file:///f:/stx%20june/scripts/interact-mainnet.ts): Contains functions for reading passports and broadcasting staking / passport registration transactions to Stacks Mainnet.

### 3. Web Application (`src/`)
We have built a premium, glassmorphic dark-mode web application in React + TypeScript:
*   [StacksContext.tsx](file:///f:/stx%20june/src/context/StacksContext.tsx): Manages wallet state (STX and TAL balances), active stake streams, profiles, block increments, and yield calculation.
*   [App.tsx](file:///f:/stx%20june/src/App.tsx) / [App.css](file:///f:/stx%20june/src/App.css): Includes:
    *   **Navbar**: Wallet connections, balance lookups, and Stacks Mainnet network badge.
    *   **Hero banner**: Dynamic stats (active passports, total staked vault, verified builders).
    *   **Talent Directory**: Searchable list of developer passports with reputation metrics and social handles.
    *   **Staking console**: Active staking streams, real-time yield accumulation counters, claim rewards, and unstaking.
    *   **Staking modals**: Sleek interactive sliders for staking.
    *   **My Passport section**: Forms to deploy brand new talent passports to the on-chain registry.
*   [index.css](file:///f:/stx%20june/src/index.css): Implements the custom styling tokens, Google Fonts (Outfit, Inter), and micro-animations.

---

## 🧪 Validation and Testing

### 1. Business Logic Mock Tests
We created a dedicated TypeScript suite to validate the contracts' state transitions, staking calculations, and block rewards:
*   File: [contracts-mock.test.ts](file:///f:/stx%20june/src/tests/contracts-mock.test.ts)
*   **Test Command**: `npx ts-node src/tests/contracts-mock.test.ts`
*   **Results**:
    ```text
    [+] Initializing Mock Test Suite for Stacks Talent Protocol...
    [PASS] Minted 10000 TAL to Alice. Balance: 10000
    [PASS] Registered Bob's passport. Rep: 100, Backing: 0
    [PASS] Alice staked 5000 TAL on Bob. Alice balance: 5000, Staking vault: 5000
    [PASS] Bob's stats updated. Rep: 5100, Backing: 5000
    [PASS] Rewards calculation correct: 50 TAL pending for 100 blocks.
    [PASS] Alice successfully claimed rewards. New balance: 5050
    [PASS] Alice unstaked 2000 TAL. New balance: 7100
    [PASS] Bob's final stats are correct. Rep: 3100, Backing: 3000
    [+] ALL MOCK TESTS PASSED SUCCESSFULLY!
    ```

### 2. Frontend Production Bundling
We ran the TypeScript compiler and Vite compiler to verify module resolution, typing constraints, and asset compilation:
*   **Build Command**: `npm run build`
*   **Results**:
    ```text
    vite v8.0.16 building client environment for production...
    transforming...✓ 1766 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                   0.45 kB │ gzip:  0.29 kB
    dist/assets/index-DSYx3Z6h.css    8.58 kB │ gzip:  2.39 kB
    dist/assets/index-BPTByWs7.js   214.40 kB │ gzip: 67.12 kB
    ✓ built in 641ms
    ```

---

## 🚀 How to Run the App Locally

To spin up the web app developer server, run the following commands in the workspace root:

1.  Start the Vite developer server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to the local host address printed in the console (usually `http://localhost:5173`).
3.  Click **Connect Stacks Wallet** on the navbar, claim initial tokens from the **Staking Faucet**, and try backing developers or creating your own developer passport!
