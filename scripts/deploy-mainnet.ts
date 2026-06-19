import { makeContractDeploy, broadcastTransaction, AnchorMode } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import * as fs from 'fs';
import * as path from 'path';

// Stacks Mainnet Deployment Script for Talent Protocol Contracts
async function deployContract(contractName: string, filePath: string, privateKey: string) {
  console.log(`Starting deployment for: ${contractName}...`);
  
  const contractSource = fs.readFileSync(path.resolve(filePath), 'utf8');
  const network = new StacksMainnet();

  const txOptions = {
    contractName,
    codeBody: contractSource,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    fee: 250000, // Fee in micro-STX (0.25 STX)
    postConditions: [],
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    if (result.error) {
      console.error(`[-] Deployment failed for ${contractName}:`, result.error);
    } else {
      console.log(`[+] Broadcasted successfully! TxID: ${result.txid}`);
    }
  } catch (error) {
    console.error(`[-] Unexpected error deploying ${contractName}:`, error);
  }
}

async function main() {
  const privateKey = process.env.STACKS_PRIVATE_KEY;
  if (!privateKey) {
    console.error('[-] Please set STACKS_PRIVATE_KEY environment variable to deploy to Stacks Mainnet.');
    process.exit(1);
  }

  // Deploy contracts sequentially (respecting dependencies)
  // 1. Talent Passport (reputation registry)
  await deployContract(
    'talent-passport',
    path.join(__dirname, '../contracts/talent-passport.clar'),
    privateKey
  );

  // 2. Talent Token (TAL)
  await deployContract(
    'talent-token',
    path.join(__dirname, '../contracts/talent-token.clar'),
    privateKey
  );

  // 3. Talent Staking (reward engine)
  await deployContract(
    'talent-staking',
    path.join(__dirname, '../contracts/talent-staking.clar'),
    privateKey
  );
}

main().catch(console.error);
