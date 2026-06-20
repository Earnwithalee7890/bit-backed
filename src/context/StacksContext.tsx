import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export interface TalentProfile {
  address: string;
  username: string;
  bio: string;
  avatarUrl: string;
  github: string;
  twitter: string;
  telegram?: string;
  linkedin?: string;
  reputationScore: number;
  totalBacking: number;
  isVerified: boolean;
}

export interface StakeInfo {
  talentAddress: string;
  amount: number;
  stakeBlock: number;
}

interface StacksContextType {
  walletConnected: boolean;
  walletAddress: string;
  stxBalance: number;
  talBalance: number;
  talents: TalentProfile[];
  userStakeOnTalents: { [key: string]: StakeInfo };
  userPassport: TalentProfile | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  faucetClaim: () => void;
  registerPassport: (username: string, bio: string, avatarUrl: string, github: string, twitter: string, telegram?: string, linkedin?: string) => Promise<boolean>;
  stakeOnTalent: (talentAddress: string, amount: number) => Promise<boolean>;
  unstakeFromTalent: (talentAddress: string, amount: number) => Promise<boolean>;
  claimRewards: (talentAddress: string) => Promise<boolean>;
  getPendingRewards: (talentAddress: string) => number;
  swapTokens: (stxAmount: number) => Promise<boolean>;
  verifyPassport: (talentAddress: string, status: boolean) => Promise<boolean>;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

// Initial high-quality mock data
const INITIAL_TALENTS: TalentProfile[] = [
  {
    address: 'SP1P48JH5BK159QZ9523Y41R1P59Y21E8P8W4D4A2',
    username: 'clarity_wizard',
    bio: 'Clarity smart contract engineer. Ex-Hiro, building secure protocols on Stacks. Bitcoin native.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    github: 'clarity-wiz',
    twitter: 'clarity_wiz',
    telegram: 'clarity_wiz',
    linkedin: 'clarity-wizard-stx',
    reputationScore: 780,
    totalBacking: 6800,
    isVerified: true,
  },
  {
    address: 'SP2H6R91P8N2W4D4G7B3Z3KZR3GQ5C6W9W5X1T2Y6',
    username: 'satoshi_builder',
    bio: 'Fullstack developer building decentralized finance products on Bitcoin L2s. Stacks advocate.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    github: 'sat-builds',
    twitter: 'satoshitest',
    telegram: 'satoshitest',
    linkedin: 'satoshi-builder',
    reputationScore: 540,
    totalBacking: 4400,
    isVerified: true,
  },
  {
    address: 'SP3F7B3Z3KZR3GQ5C6W9W5X1T2Y6H4R9P8N2W4D4',
    username: 'stx_designer',
    bio: 'UI/UX Designer specializing in web3 and Bitcoin ecosystems. Crafting stunning user experiences.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    github: 'stx-pixels',
    twitter: 'design_stx',
    telegram: 'design_stx',
    linkedin: 'stx-designer',
    reputationScore: 320,
    totalBacking: 2200,
    isVerified: false,
  }
];

export const StacksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [stxBalance, setStxBalance] = useState(0);
  const [talBalance, setTalBalance] = useState(0);
  const [talents, setTalents] = useState<TalentProfile[]>(INITIAL_TALENTS);
  const [userStakeOnTalents, setUserStakeOnTalents] = useState<{ [key: string]: StakeInfo }>({});
  const [userPassport, setUserPassport] = useState<TalentProfile | null>(null);
  
  // Timer to simulate Stacks blockchain block progressions
  const [currentBlock, setCurrentBlock] = useState(128450);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setWalletConnected(true);
      const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
      setWalletAddress(address);
      setStxBalance(124.50); // Simulated balance for active mainnet wallet
      setTalBalance(2500);    // Simulated TAL token balance
    }

    const interval = setInterval(() => {
      setCurrentBlock((prev) => prev + 1);
    }, 6000); // Progress a block every 6 seconds for testing
    return () => clearInterval(interval);
  }, []);

  const connectWallet = () => {
    showConnect({
      userSession,
      appDetails: {
        name: 'BitBacked',
        icon: window.location.origin + '/favicon.svg'
      },
      onFinish: () => {
        const userData = userSession.loadUserData();
        setWalletConnected(true);
        const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
        setWalletAddress(address);
        setStxBalance(124.50);
        setTalBalance(2500);
      },
      onCancel: () => {
        console.log('User cancelled Stacks wallet connection flow.');
      }
    });
  };

  const disconnectWallet = () => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }
    setWalletConnected(false);
    setWalletAddress('');
    setStxBalance(0);
    setTalBalance(0);
    setUserPassport(null);
  };

  const faucetClaim = () => {
    if (!walletConnected) return;
    setTalBalance((prev) => prev + 500);
    setStxBalance((prev) => prev + 10);
  };

  const swapTokens = async (stxAmount: number): Promise<boolean> => {
    if (!walletConnected || stxBalance < stxAmount) return false;
    setStxBalance((prev) => prev - stxAmount);
    setTalBalance((prev) => prev + (stxAmount * 25)); // 1 STX = 25 TAL exchange rate
    return true;
  };

  const verifyPassport = async (talentAddress: string, status: boolean): Promise<boolean> => {
    if (!walletConnected) return false;
    setTalents((prev) =>
      prev.map((t) => {
        if (t.address === talentAddress) {
          const currentRep = t.reputationScore;
          // Only add 50 reputation if they are becoming verified
          const newRep = t.isVerified === status ? currentRep : (status ? currentRep + 50 : currentRep - 50);
          return {
            ...t,
            isVerified: status,
            reputationScore: newRep
          };
        }
        return t;
      })
    );
    return true;
  };

  const registerPassport = async (
    username: string,
    bio: string,
    avatarUrl: string,
    github: string,
    twitter: string,
    telegram?: string,
    linkedin?: string
  ): Promise<boolean> => {
    if (!walletConnected) return false;
    
    // Check for unique username
    const exists = talents.some((t) => t.username.toLowerCase() === username.toLowerCase());
    if (exists) return false;

    const newProfile: TalentProfile = {
      address: walletAddress,
      username,
      bio,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      github,
      twitter,
      telegram,
      linkedin,
      reputationScore: 100, // Starting reputation score as coded in the passport contract
      totalBacking: 0,
      isVerified: false
    };

    setTalents((prev) => [newProfile, ...prev]);
    setUserPassport(newProfile);
    setStxBalance((prev) => prev - 0.2); // Gas fee: 0.2 STX
    return true;
  };

  const stakeOnTalent = async (talentAddress: string, amount: number): Promise<boolean> => {
    if (!walletConnected || talBalance < amount) return false;

    // Deduct TAL balance and STX gas
    setTalBalance((prev) => prev - amount);
    setStxBalance((prev) => prev - 0.15); // Gas fee: 0.15 STX

    // Update Stake Information
    setUserStakeOnTalents((prev) => {
      const existing = prev[talentAddress];
      const newAmount = (existing?.amount || 0) + amount;
      return {
        ...prev,
        [talentAddress]: {
          talentAddress,
          amount: newAmount,
          stakeBlock: currentBlock
        }
      };
    });

    // Update Talent total backing and reputation score in list
    setTalents((prev) =>
      prev.map((t) => {
        if (t.address === talentAddress) {
          return {
            ...t,
            totalBacking: t.totalBacking + amount,
            reputationScore: t.reputationScore + amount // 1 TAL = 1 Reputation point
          };
        }
        return t;
      })
    );

    // If it's the user's own passport, update the passport state too
    if (userPassport && userPassport.address === talentAddress) {
      setUserPassport((prev) => prev ? {
        ...prev,
        totalBacking: prev.totalBacking + amount,
        reputationScore: prev.reputationScore + amount
      } : null);
    }

    return true;
  };

  const unstakeFromTalent = async (talentAddress: string, amount: number): Promise<boolean> => {
    const stakeInfo = userStakeOnTalents[talentAddress];
    if (!walletConnected || !stakeInfo || stakeInfo.amount < amount) return false;

    // Claim pending rewards first
    await claimRewards(talentAddress);

    // Return staked TAL and deduct gas
    setTalBalance((prev) => prev + amount);
    setStxBalance((prev) => prev - 0.15); // Gas fee: 0.15 STX

    // Update Stake Information
    setUserStakeOnTalents((prev) => {
      const existing = prev[talentAddress];
      const newAmount = existing.amount - amount;
      
      const updated = { ...prev };
      if (newAmount <= 0) {
        delete updated[talentAddress];
      } else {
        updated[talentAddress] = {
          ...existing,
          amount: newAmount,
          stakeBlock: currentBlock
        };
      }
      return updated;
    });

    // Update Talent total backing and reputation score in list
    setTalents((prev) =>
      prev.map((t) => {
        if (t.address === talentAddress) {
          return {
            ...t,
            totalBacking: Math.max(0, t.totalBacking - amount),
            reputationScore: Math.max(100, t.reputationScore - amount)
          };
        }
        return t;
      })
    );

    // If it's user's passport
    if (userPassport && userPassport.address === talentAddress) {
      setUserPassport((prev) => prev ? {
        ...prev,
        totalBacking: Math.max(0, prev.totalBacking - amount),
        reputationScore: Math.max(100, prev.reputationScore - amount)
      } : null);
    }

    return true;
  };

  const getPendingRewards = (talentAddress: string): number => {
    const stakeInfo = userStakeOnTalents[talentAddress];
    if (!stakeInfo || stakeInfo.amount <= 0) return 0;
    const blocksPassed = currentBlock - stakeInfo.stakeBlock;
    // Yield formula matching contract: 0.01% of staked amount per block
    const rewards = (stakeInfo.amount * blocksPassed * 100) / 1000000;
    return parseFloat(rewards.toFixed(4));
  };

  const claimRewards = async (talentAddress: string): Promise<boolean> => {
    const rewards = getPendingRewards(talentAddress);
    if (!walletConnected || rewards <= 0) return false;

    setTalBalance((prev) => prev + rewards);
    setStxBalance((prev) => prev - 0.1); // Gas fee: 0.1 STX

    // Reset staking block height to now
    setUserStakeOnTalents((prev) => {
      const existing = prev[talentAddress];
      if (!existing) return prev;
      return {
        ...prev,
        [talentAddress]: {
          ...existing,
          stakeBlock: currentBlock
        }
      };
    });

    return true;
  };

  return (
    <StacksContext.Provider
      value={{
        walletConnected,
        walletAddress,
        stxBalance,
        talBalance,
        talents,
        userStakeOnTalents,
        userPassport,
        connectWallet,
        disconnectWallet,
        faucetClaim,
        registerPassport,
        stakeOnTalent,
        unstakeFromTalent,
        claimRewards,
        getPendingRewards,
        swapTokens,
        verifyPassport
      }}
    >
      {children}
    </StacksContext.Provider>
  );
};

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
};
