import {
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  uintCV,
  principalCV,
  stringAsciiCV,
  stringUtf8CV,
  cvToValue
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const network = new StacksMainnet();

// Replace with actual deployed contract address on Stacks Mainnet
const CONTRACT_ADDRESS = 'SP3Z3KZR3GQ5C6W9W5X1T2Y6H4R9P8N2W4D4G7B3'; 

// 1. Read user reputation profile from Stacks Mainnet
async function getReputationProfile(userAddress: string) {
  console.log(`[+] Querying reputation profile for ${userAddress} on Stacks Mainnet...`);
  try {
    const response = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'talent-passport',
      functionName: 'get-profile',
      functionArgs: [principalCV(userAddress)],
      network,
      senderAddress: userAddress,
    });
    
    console.log('[+] Profile Response:', cvToValue(response));
  } catch (error) {
    console.error('[-] Error reading passport profile:', error);
  }
}

// 2. Perform a Staking transaction backing a builder/talent
async function stakeOnTalent(talentAddress: string, amount: number, privateKey: string) {
  console.log(`[+] Staking ${amount} TAL tokens on talent: ${talentAddress}...`);
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'talent-staking',
      functionName: 'stake',
      functionArgs: [principalCV(talentAddress), uintCV(amount)],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 150000, // 0.15 STX fee
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    if (result.error) {
      console.error('[-] Staking transaction broadcast failed:', result.error);
    } else {
      console.log(`[+] Staking transaction broadcasted successfully! TxID: ${result.txid}`);
    }
  } catch (error) {
    console.error('[-] Staking transaction error:', error);
  }
}

// 3. Register a Talent Passport on Stacks Mainnet
async function registerPassport(
  username: string,
  bio: string,
  avatarUrl: string,
  github: string,
  twitter: string,
  privateKey: string
) {
  console.log(`[+] Registering Talent Passport for username: ${username}...`);
  try {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: 'talent-passport',
      functionName: 'register-profile',
      functionArgs: [
        stringAsciiCV(username),
        stringUtf8CV(bio),
        stringAsciiCV(avatarUrl),
        stringAsciiCV(github),
        stringAsciiCV(twitter)
      ],
      senderKey: privateKey,
      network,
      anchorMode: AnchorMode.Any,
      fee: 200000, // 0.20 STX fee
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction(transaction, network);
    
    if (result.error) {
      console.error('[-] Registration transaction broadcast failed:', result.error);
    } else {
      console.log(`[+] Registration transaction broadcasted successfully! TxID: ${result.txid}`);
    }
  } catch (error) {
    console.error('[-] Registration transaction error:', error);
  }
}

async function main() {
  const testAddress = 'SP12345678901234567890123456789012345678';
  const privateKey = process.env.STACKS_PRIVATE_KEY || 'mock_private_key';

  // Read profile
  await getReputationProfile(testAddress);

  // If you want to test writes, uncomment and provide a real private key:
  // await registerPassport('bob_builder', 'Full Stack Developer', 'https://avatar.url', 'bobgit', 'bobtwitter', privateKey);
  // await stakeOnTalent(testAddress, 500, privateKey);
}

// execute if run directly
if (require.main === module) {
  main().catch(console.error);
}
