// Mock Contract Logic Test Suite
// Verifies state transitions and mathematical correctness of Clarity contract mechanics

class MockTalentPassportContract {
  // Simulating Clarity maps
  profiles = new Map<string, {
    username: string;
    bio: string;
    avatarUrl: string;
    github: string;
    twitter: string;
    reputationScore: number;
    totalBacking: number;
    isVerified: boolean;
  }>();

  usernameToAddress = new Map<string, string>();
  owner = 'SP_CONTRACT_OWNER';

  registerProfile(sender: string, username: string, bio: string, avatarUrl: string, github: string, twitter: string) {
    if (this.profiles.has(sender)) throw new Error('ERR_ALREADY_EXISTS');
    if (this.usernameToAddress.has(username)) throw new Error('ERR_ALREADY_EXISTS');

    this.profiles.set(sender, {
      username,
      bio,
      avatarUrl,
      github,
      twitter,
      reputationScore: 100, // Initial reputation score
      totalBacking: 0,
      isVerified: false
    });
    this.usernameToAddress.set(username, sender);
    return true;
  }

  updateReputationAndBacking(talent: string, reputationChange: number, backingChange: number) {
    const profile = this.profiles.get(talent);
    if (!profile) throw new Error('ERR_NOT_FOUND');

    profile.reputationScore = Math.max(100, profile.reputationScore + reputationChange);
    profile.totalBacking = Math.max(0, profile.totalBacking + backingChange);
    return true;
  }

  verifyProfile(sender: string, talent: string, status: boolean) {
    if (sender !== this.owner) throw new Error('ERR_OWNER_ONLY');
    const profile = this.profiles.get(talent);
    if (!profile) throw new Error('ERR_NOT_FOUND');

    profile.isVerified = status;
    profile.reputationScore += status ? 50 : 0;
    return true;
  }
}

class MockTalentTokenContract {
  balances = new Map<string, number>();
  totalSupply = 0;

  mint(recipient: string, amount: number) {
    const currentBal = this.balances.get(recipient) || 0;
    this.balances.set(recipient, currentBal + amount);
    this.totalSupply += amount;
    return true;
  }

  transfer(amount: number, sender: string, recipient: string) {
    const senderBal = this.balances.get(sender) || 0;
    if (senderBal < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');
    
    this.balances.set(sender, senderBal - amount);
    const recipientBal = this.balances.get(recipient) || 0;
    this.balances.set(recipient, recipientBal + amount);
    return true;
  }

  burn(amount: number, sender: string) {
    const senderBal = this.balances.get(sender) || 0;
    if (senderBal < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');
    
    this.balances.set(sender, senderBal - amount);
    this.totalSupply -= amount;
    return true;
  }
}

class MockTalentStakingContract {
  passportContract: MockTalentPassportContract;
  tokenContract: MockTalentTokenContract;

  // Map (staker + "#" + talent) -> { amount, blockHeight }
  stakes = new Map<string, { amount: number; blockHeight: number }>();

  constructor(passport: MockTalentPassportContract, token: MockTalentTokenContract) {
    this.passportContract = passport;
    this.tokenContract = token;
  }

  stake(staker: string, talent: string, amount: number, currentBlock: number) {
    if (amount <= 0) throw new Error('ERR_INVALID_AMOUNT');
    
    // Transfer TAL tokens to contract vault
    this.tokenContract.transfer(amount, staker, 'STAKING_CONTRACT_VAULT');

    const key = `${staker}#${talent}`;
    const existing = this.stakes.get(key) || { amount: 0, blockHeight: currentBlock };
    
    this.stakes.set(key, {
      amount: existing.amount + amount,
      blockHeight: currentBlock
    });

    // Update passport total backing and reputation
    this.passportContract.updateReputationAndBacking(talent, amount, amount);
    return true;
  }

  calculateRewards(staker: string, talent: string, currentBlock: number): number {
    const key = `${staker}#${talent}`;
    const stakeInfo = this.stakes.get(key);
    if (!stakeInfo || stakeInfo.amount <= 0) return 0;

    const blocksPassed = currentBlock - stakeInfo.blockHeight;
    // Reward logic: (amount * blocks * 100) / 1,000,000 (0.01% yield per block)
    return (stakeInfo.amount * blocksPassed * 100) / 1000000;
  }

  claimRewards(staker: string, talent: string, currentBlock: number) {
    const key = `${staker}#${talent}`;
    const stakeInfo = this.stakes.get(key);
    if (!stakeInfo || stakeInfo.amount <= 0) throw new Error('ERR_NO_STAKE');

    const rewards = this.calculateRewards(staker, talent, currentBlock);
    if (rewards > 0) {
      // Mint rewards to staker
      this.tokenContract.mint(staker, rewards);
      
      // Update stake block height
      this.stakes.set(key, {
        amount: stakeInfo.amount,
        blockHeight: currentBlock
      });
    }
    return rewards;
  }

  unstake(staker: string, talent: string, amount: number, currentBlock: number) {
    const key = `${staker}#${talent}`;
    const stakeInfo = this.stakes.get(key);
    if (!stakeInfo || stakeInfo.amount < amount) throw new Error('ERR_INSUFFICIENT_BALANCE');

    // 1. Claim any pending rewards
    this.claimRewards(staker, talent, currentBlock);

    // 2. Transfer staked TAL back to staker
    this.tokenContract.transfer(amount, 'STAKING_CONTRACT_VAULT', staker);

    // 3. Update stake record
    const updatedAmount = stakeInfo.amount - amount;
    if (updatedAmount === 0) {
      this.stakes.delete(key);
    } else {
      this.stakes.set(key, {
        amount: updatedAmount,
        blockHeight: currentBlock
      });
    }

    // 4. Subtract backing and reputation
    this.passportContract.updateReputationAndBacking(talent, -amount, -amount);
    return true;
  }
}

// Execution and assertions
function runMockTests() {
  console.log('[+] Initializing Mock Test Suite for Stacks Talent Protocol...');

  const passport = new MockTalentPassportContract();
  const token = new MockTalentTokenContract();
  const staking = new MockTalentStakingContract(passport, token);

  const bob = 'SP_BOB_BUILDER';
  const alice = 'SP_ALICE_STAKER';

  // 1. Setup initial tokens
  token.mint(alice, 10000); // Alice starts with 10k TAL
  console.log(`[PASS] Minted 10000 TAL to Alice. Balance: ${token.balances.get(alice)}`);

  // 2. Register Bob's Passport
  passport.registerProfile(bob, 'bob_builder', 'Web3 dev', 'avatar_url', 'bobgit', 'bobtwitter');
  const bobProfile = passport.profiles.get(bob);
  if (!bobProfile || bobProfile.reputationScore !== 100 || bobProfile.totalBacking !== 0) {
    throw new Error('Bob registration failed');
  }
  console.log(`[PASS] Registered Bob's passport. Rep: ${bobProfile.reputationScore}, Backing: ${bobProfile.totalBacking}`);

  // 3. Alice stakes on Bob
  staking.stake(alice, bob, 5000, 100); // Stake 5000 TAL at block 100
  console.log(`[PASS] Alice staked 5000 TAL on Bob. Alice balance: ${token.balances.get(alice)}, Staking vault: ${token.balances.get('STAKING_CONTRACT_VAULT')}`);
  
  const updatedBobProfile = passport.profiles.get(bob);
  if (!updatedBobProfile || updatedBobProfile.reputationScore !== 5100 || updatedBobProfile.totalBacking !== 5000) {
    throw new Error('Reputation scaling or backing addition failed after staking');
  }
  console.log(`[PASS] Bob's stats updated. Rep: ${updatedBobProfile.reputationScore}, Backing: ${updatedBobProfile.totalBacking}`);

  // 4. Advance blocks and calculate rewards
  const rewardsBlock200 = staking.calculateRewards(alice, bob, 200); // 100 blocks passed
  // (5000 * 100 * 100) / 1,000,000 = 50 TAL
  if (rewardsBlock200 !== 50) {
    throw new Error(`Reward calculation incorrect: expected 50, got ${rewardsBlock200}`);
  }
  console.log(`[PASS] Rewards calculation correct: ${rewardsBlock200} TAL pending for 100 blocks.`);

  // 5. Alice claims rewards
  staking.claimRewards(alice, bob, 200);
  if (token.balances.get(alice) !== 5050) {
    throw new Error(`Alice balance incorrect after claim: expected 5050, got ${token.balances.get(alice)}`);
  }
  console.log(`[PASS] Alice successfully claimed rewards. New balance: ${token.balances.get(alice)}`);

  // 6. Alice unstakes 2000 TAL
  staking.unstake(alice, bob, 2000, 300); // 100 blocks since last claim (yield accrued on 5000)
  // New reward should be claimed first: 50 TAL
  // Alice balance should be: current(5050) + yield(50) + unstake(2000) = 7100
  if (token.balances.get(alice) !== 7100) {
    throw new Error(`Alice balance incorrect after unstake: expected 7100, got ${token.balances.get(alice)}`);
  }
  console.log(`[PASS] Alice unstaked 2000 TAL. New balance: ${token.balances.get(alice)}`);

  const finalBobProfile = passport.profiles.get(bob);
  if (!finalBobProfile || finalBobProfile.reputationScore !== 3100 || finalBobProfile.totalBacking !== 3000) {
    throw new Error('Reputation reduction failed after unstake');
  }
  console.log(`[PASS] Bob's final stats are correct. Rep: ${finalBobProfile.reputationScore}, Backing: ${finalBobProfile.totalBacking}`);

  console.log('[+] ALL MOCK TESTS PASSED SUCCESSFULLY!');
}

// Run the test suite if invoked
runMockTests();
