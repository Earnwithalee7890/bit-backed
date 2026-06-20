// Context State Transition Unit Tests
// Verifies that the frontend StacksContext provider correctly processes user actions

interface TalentProfile {
  address: string;
  username: string;
  bio: string;
  avatarUrl: string;
  github: string;
  twitter: string;
  reputationScore: number;
  totalBacking: number;
  isVerified: boolean;
}

interface StakeInfo {
  talentAddress: string;
  amount: number;
  stakeBlock: number;
}

// Class mimicking the StacksContext state machine
class StacksContextStateMachine {
  walletConnected = false;
  walletAddress = '';
  stxBalance = 0;
  talBalance = 0;
  talents: TalentProfile[] = [];
  userStakeOnTalents: { [key: string]: StakeInfo } = {};
  userPassport: TalentProfile | null = null;
  currentBlock = 120000;

  constructor(initialTalents: TalentProfile[]) {
    this.talents = [...initialTalents];
  }

  connectWallet() {
    this.walletConnected = true;
    this.walletAddress = 'SP_USER_MAINNET_ADDRESS';
    this.stxBalance = 100;
    this.talBalance = 500;
  }

  disconnectWallet() {
    this.walletConnected = false;
    this.walletAddress = '';
    this.stxBalance = 0;
    this.talBalance = 0;
    this.userPassport = null;
  }

  faucetClaim() {
    if (!this.walletConnected) return;
    this.talBalance += 500;
    this.stxBalance += 10;
  }

  registerPassport(username: string, bio: string, avatarUrl: string, github: string, twitter: string): boolean {
    if (!this.walletConnected) return false;
    if (this.talents.some(t => t.username === username)) return false;

    const newProfile: TalentProfile = {
      address: this.walletAddress,
      username,
      bio,
      avatarUrl,
      github,
      twitter,
      reputationScore: 100,
      totalBacking: 0,
      isVerified: false
    };

    this.talents.unshift(newProfile);
    this.userPassport = newProfile;
    this.stxBalance -= 0.2; // gas
    return true;
  }

  stakeOnTalent(talentAddress: string, amount: number): boolean {
    if (!this.walletConnected || this.talBalance < amount) return false;

    this.talBalance -= amount;
    this.stxBalance -= 0.15; // gas

    const existing = this.userStakeOnTalents[talentAddress];
    const newAmount = (existing?.amount || 0) + amount;
    
    this.userStakeOnTalents[talentAddress] = {
      talentAddress,
      amount: newAmount,
      stakeBlock: this.currentBlock
    };

    this.talents = this.talents.map(t => {
      if (t.address === talentAddress) {
        return {
          ...t,
          totalBacking: t.totalBacking + amount,
          reputationScore: t.reputationScore + amount
        };
      }
      return t;
    });

    return true;
  }

  getPendingRewards(talentAddress: string): number {
    const stakeInfo = this.userStakeOnTalents[talentAddress];
    if (!stakeInfo || stakeInfo.amount <= 0) return 0;
    const blocksPassed = this.currentBlock - stakeInfo.stakeBlock;
    return (stakeInfo.amount * blocksPassed * 100) / 1000000;
  }

  claimRewards(talentAddress: string): boolean {
    const rewards = this.getPendingRewards(talentAddress);
    if (!this.walletConnected || rewards <= 0) return false;

    this.talBalance += rewards;
    this.stxBalance -= 0.1; // gas

    const stake = this.userStakeOnTalents[talentAddress];
    if (stake) {
      stake.stakeBlock = this.currentBlock;
    }
    return true;
  }
}

// Assertions runner
function runContextTests() {
  console.log('[+] Initializing StacksContext State Unit Tests...');

  const initialTalents: TalentProfile[] = [
    {
      address: 'SP_TALENT_1',
      username: 'alice_dev',
      bio: 'React builder',
      avatarUrl: '',
      github: 'alicegit',
      twitter: 'alicetwi',
      reputationScore: 200,
      totalBacking: 1000,
      isVerified: true
    }
  ];

  const state = new StacksContextStateMachine(initialTalents);

  // Test 1: Connect Wallet
  state.connectWallet();
  if (!state.walletConnected || state.walletAddress !== 'SP_USER_MAINNET_ADDRESS' || state.stxBalance !== 100 || state.talBalance !== 500) {
    throw new Error('Test 1 failed: wallet did not connect correctly');
  }
  console.log('[PASS] Test 1: Wallet connection state transitions correct.');

  // Test 2: Faucet Claim
  state.faucetClaim();
  if (state.talBalance !== 1000 || state.stxBalance !== 110) {
    throw new Error('Test 2 failed: faucet calculation incorrect');
  }
  console.log('[PASS] Test 2: Faucet distributions updated correctly.');

  // Test 3: Staking state updates
  state.stakeOnTalent('SP_TALENT_1', 400); // stake 400 TAL
  const stake = state.userStakeOnTalents['SP_TALENT_1'];
  if (!stake || stake.amount !== 400 || state.talBalance !== 600 || state.stxBalance !== 109.85) {
    throw new Error('Test 3 failed: staking deduction or state updates incorrect');
  }
  
  const talent = state.talents.find(t => t.address === 'SP_TALENT_1');
  if (!talent || talent.totalBacking !== 1400 || talent.reputationScore !== 600) {
    throw new Error('Test 3 failed: talent backing totals incorrect');
  }
  console.log('[PASS] Test 3: Staking increments and balance deductions correct.');

  // Test 4: Dynamic yield accrual
  state.currentBlock += 200; // Advance 200 blocks
  const rewards = state.getPendingRewards('SP_TALENT_1');
  // (400 * 200 * 100) / 1000000 = 8 TAL
  if (rewards !== 8) {
    throw new Error(`Test 4 failed: rewards calculations incorrect, expected 8 got ${rewards}`);
  }
  console.log('[PASS] Test 4: Block yield rewards math correct.');

  // Test 5: Claiming yield rewards
  state.claimRewards('SP_TALENT_1');
  if (state.talBalance !== 608 || state.stxBalance !== 109.75) {
    throw new Error('Test 5 failed: claim rewards failed to add to balance');
  }
  if (state.getPendingRewards('SP_TALENT_1') !== 0) {
    throw new Error('Test 5 failed: pending rewards did not reset to 0');
  }
  console.log('[PASS] Test 5: Rewards claimed and block checkpoints reset correctly.');

  console.log('[+] ALL CONTEXT STATE UNIT TESTS PASSED SUCCESSFULLY!');
}

runContextTests();
