import React, { useState, useEffect } from 'react';
import { useStacks, type TalentProfile } from './context/StacksContext';
import { 
  Wallet, Coins, PlusCircle, CheckCircle2, TrendingUp, LogOut,
  ShieldAlert, Award as AwardIcon
} from 'lucide-react';
import './App.css';
import { ThreeDGraph } from './components/ThreeDGraph';

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const TelegramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M21.198 2.502a1.86 1.86 0 0 0-1.935-.505L2.307 8.522a1.88 1.88 0 0 0-.102 3.433l4.952 2.154a1.88 1.88 0 0 0 1.94-.356l6.812-5.748a.2.2 0 0 1 .32.186l-5.32 6.545a1.88 1.88 0 0 0-.39 1.13v3.744c0 .874 1.05 1.32 1.68.72l2.368-2.228 3.902 2.873c.753.554 1.84.237 2.164-.693l4.52-12.872a1.88 1.88 0 0 0-.917-2.31z" />
  </svg>
);

const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" rx="1" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const ShareIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
function App() {
  const {
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
  } = useStacks();

  const [activeTab, setActiveTab] = useState<'directory' | 'passport'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [stakingModalOpen, setStakingModalOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Registration form state
  const [regUsername, setRegUsername] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState('');
  const [regGithub, setRegGithub] = useState('');
  const [regTwitter, setRegTwitter] = useState('');
  const [regTelegram, setRegTelegram] = useState('');
  const [regLinkedin, setRegLinkedin] = useState('');
  
  // Swap state
  const [swapSTXAmount, setSwapSTXAmount] = useState<string>('10');

  // Ledger state
  interface LedgerTx {
    txId: string;
    type: string;
    details: string;
    block: number;
    timestamp: string;
  }
  
  const [ledgerTxs, setLedgerTxs] = useState<LedgerTx[]>([
    { txId: '0x32a8cf', type: 'Register', details: '@clarity_wizard registered passport', block: 128440, timestamp: '10m ago' },
    { txId: '0x17b2e9', type: 'Stake', details: 'Staked 5000 TAL on @clarity_wizard', block: 128442, timestamp: '8m ago' },
    { txId: '0xef0c5f', type: 'Verify', details: '@satoshi_builder profile verified', block: 128448, timestamp: '2m ago' }
  ]);

  const addLedgerTx = (type: string, details: string) => {
    const newTx: LedgerTx = {
      txId: '0x' + Math.random().toString(16).substring(2, 8),
      type,
      details,
      block: 128450 + Math.floor(Math.random() * 10),
      timestamp: 'Just now'
    };
    setLedgerTxs(prev => [newTx, ...prev]);
  };

  const [, setTicker] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConnect = () => {
    connectWallet();
    triggerNotification('Wallet connected successfully to Stacks Mainnet!');
    addLedgerTx('Connect', 'Wallet connected to Stacks Mainnet');
  };

  const handleDisconnect = () => {
    disconnectWallet();
    triggerNotification('Wallet disconnected.');
    addLedgerTx('Disconnect', 'Wallet disconnected');
  };

  const handleFaucet = () => {
    faucetClaim();
    triggerNotification('Claimed 500 TAL & 10 STX faucet tokens!');
    addLedgerTx('Faucet', 'Claimed 500 TAL & 10 STX');
  };

  const handleSwap = async () => {
    const amount = parseFloat(swapSTXAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerNotification('Please enter a valid STX amount.');
      return;
    }
    const success = await swapTokens(amount);
    if (success) {
      triggerNotification(`Swapped ${amount} STX for ${amount * 25} TAL!`);
      addLedgerTx('Swap', `Swapped ${amount} STX for ${amount * 25} TAL`);
    } else {
      triggerNotification('Swap failed: Insufficient STX balance.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername) return;
    
    const success = await registerPassport(
      regUsername,
      regBio,
      regAvatar,
      regGithub,
      regTwitter,
      regTelegram,
      regLinkedin
    );

    if (success) {
      triggerNotification(`Talent Passport @${regUsername} registered!`);
      addLedgerTx('Register', `@${regUsername} registered passport`);
      // Reset form
      setRegUsername('');
      setRegBio('');
      setRegAvatar('');
      setRegGithub('');
      setRegTwitter('');
      setRegTelegram('');
      setRegLinkedin('');
    } else {
      triggerNotification('Error: Username already taken or wallet error.');
    }
  };

  const openStakeModal = (talent: TalentProfile) => {
    setSelectedTalent(talent);
    setStakingModalOpen(true);
    setStakeAmount(Math.min(100, talBalance));
  };

  const handleStake = async () => {
    if (!selectedTalent) return;
    const success = await stakeOnTalent(selectedTalent.address, stakeAmount);
    if (success) {
      triggerNotification(`Staked ${stakeAmount} TAL on @${selectedTalent.username}!`);
      addLedgerTx('Stake', `Staked ${stakeAmount} TAL on @${selectedTalent.username}`);
      setStakingModalOpen(false);
    } else {
      triggerNotification('Staking transaction failed. Check balance.');
    }
  };

  const handleUnstake = async (talentAddress: string, amount: number) => {
    const success = await unstakeFromTalent(talentAddress, amount);
    if (success) {
      triggerNotification(`Unstaked ${amount} TAL successfully.`);
      const talent = talents.find(t => t.address === talentAddress);
      addLedgerTx('Unstake', `Unstaked ${amount} TAL from @${talent?.username || 'builder'}`);
    } else {
      triggerNotification('Unstaking transaction failed.');
    }
  };

  const handleClaim = async (talentAddress: string) => {
    const success = await claimRewards(talentAddress);
    if (success) {
      triggerNotification(`Claimed TAL rewards successfully!`);
      const talent = talents.find(t => t.address === talentAddress);
      addLedgerTx('Claim', `Claimed yield rewards from @${talent?.username || 'builder'}`);
    } else {
      triggerNotification('No rewards available to claim.');
    }
  };

  const handleVerifyBuilder = async (talentAddress: string) => {
    const success = await verifyPassport(talentAddress, true);
    if (success) {
      const talent = talents.find(t => t.address === talentAddress);
      triggerNotification(`Verified @${talent?.username || 'builder'} profile!`);
      addLedgerTx('Verify', `Verified passport of @${talent?.username || 'builder'} (Owner)`);
    } else {
      triggerNotification('Verification failed.');
    }
  };

  const filteredTalents = talents.filter((t) => 
    t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div className="glass-panel" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '16px 24px',
          borderLeft: '4px solid var(--success-glow)',
          zIndex: 1000,
          background: 'rgba(18, 18, 24, 0.95)',
          color: '#fff',
          fontSize: '0.95rem'
        }}>
          {notification}
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="navbar glass-panel">
        <div className="brand">
          <div className="brand-logo">B</div>
          <div>
            <h1 className="brand-name">BitBacked</h1>
            <span className="network-badge">Stacks Mainnet</span>
          </div>
        </div>
        
        <div className="wallet-details">
          {walletConnected ? (
            <>
              <div className="balance-item">
                <span className="balance-val">{stxBalance.toFixed(2)} STX</span>
                <span className="balance-lbl">STX Balance</span>
              </div>
              <div className="balance-item" style={{ marginRight: '16px' }}>
                <span className="balance-val" style={{ color: 'var(--secondary-glow)' }}>
                  {talBalance.toFixed(2)} TAL
                </span>
                <span className="balance-lbl">TAL Balance</span>
              </div>
              <div className="btn btn-secondary" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </div>
              <button 
                className={`btn ${isAdminMode ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                onClick={() => setIsAdminMode(!isAdminMode)}
                title="Toggle Stacks Smart Contract Owner Controls"
              >
                Owner Mode: {isAdminMode ? 'ON' : 'OFF'}
              </button>
              <button className="btn btn-secondary" onClick={handleDisconnect} title="Disconnect Wallet">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect}>
              <Wallet size={16} /> Connect Stacks Wallet
            </button>
          )}
        </div>

        {/* Hamburger Menu Toggle for Mobile */}
        <button 
          className="hamburger-btn btn btn-secondary" 
          onClick={() => setMobileMenuOpen(true)}
          style={{ padding: '8px', borderRadius: '8px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="6" x2="20" y2="6"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-panel open" style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '280px',
          height: '100vh',
          zIndex: 1100,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          background: 'rgba(18, 18, 24, 0.98)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ background: 'var(--cyber-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BitBacked</h3>
            <button className="btn btn-secondary" onClick={() => setMobileMenuOpen(false)} style={{ padding: '4px 8px' }}>✕</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {walletConnected ? (
              <>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wallet Address</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#fff', marginTop: '4px', overflowWrap: 'anywhere' }}>{walletAddress}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STX Balance</span>
                    <div style={{ fontWeight: 600 }}>{stxBalance.toFixed(2)} STX</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>TAL Balance</span>
                    <div style={{ fontWeight: 600, color: 'var(--secondary-glow)' }}>{talBalance.toFixed(2)} TAL</div>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={() => { handleDisconnect(); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                  <LogOut size={16} /> Disconnect Wallet
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => { handleConnect(); setMobileMenuOpen(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                <Wallet size={16} /> Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="hero glass-panel">
        <div className="hero-content">
          <h2 className="hero-title">On-Chain Reputation for Bitcoin Builders</h2>
          <p className="hero-subtitle">
            Verify your builder score, deploy Talent Passports on Stacks Mainnet, and get backed by the Web3 developer ecosystem.
          </p>
          <div className="hero-stats">
            <div className="stat-box">
              <span className="stat-val">{talents.length}</span>
              <span className="stat-lbl">Active Passports</span>
            </div>
            <div className="stat-box">
              <span className="stat-val">
                {talents.reduce((sum, t) => sum + t.totalBacking, 0).toLocaleString()} TAL
              </span>
              <span className="stat-lbl">Total Staked Vault</span>
            </div>
            <div className="stat-box">
              <span className="stat-val">
                {talents.filter((t) => t.isVerified).length}
              </span>
              <span className="stat-lbl">Verified Builders</span>
            </div>
          </div>
        </div>
        <div className="hero-graphic" style={{ opacity: 0.35 }}>
          <TrendingUp size={160} color="var(--primary-glow)" className="pulse-glow" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dashboard-grid">
        <main className="glass-panel" style={{ padding: '24px' }}>
          {/* Section Tabs */}
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => setActiveTab('directory')}
            >
              Browse Builders
            </button>
            <button 
              className={`tab-btn ${activeTab === 'passport' ? 'active' : ''}`}
              onClick={() => setActiveTab('passport')}
            >
              My Talent Passport
            </button>
          </div>

          {/* Directory Tab View */}
          {activeTab === 'directory' && (
            <div>
              {/* 3D Network Graph Visualizer */}
              <div className="glass-panel" style={{ padding: '12px', marginBottom: '24px', background: 'rgba(138, 43, 226, 0.02)', border: '1px solid rgba(138, 43, 226, 0.06)' }}>
                <ThreeDGraph />
              </div>

              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by username or bio skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="talent-list">
                {filteredTalents.map((talent) => (
                  <div key={talent.address} className="talent-card glass-panel" style={{ background: 'rgba(255,255,255,0.015)' }}>
                    <img src={talent.avatarUrl} alt={talent.username} className="talent-avatar" />
                    
                    <div className="talent-info">
                      <div className="talent-header-row">
                        <div className="talent-name-wrapper">
                          <h3 className="talent-username">@{talent.username}</h3>
                          {talent.isVerified && (
                            <span className="badge badge-verified" title="Verified Professional Profile">
                              <CheckCircle2 size={12} /> Verified
                            </span>
                          )}
                          {talent.address === walletAddress && (
                            <span className="badge" style={{ background: 'rgba(138,43,226,0.15)', color: 'var(--primary-glow)', border: '1px solid var(--primary-glow)' }}>
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="talent-address">
                          {talent.address.substring(0, 6)}...{talent.address.substring(talent.address.length - 4)}
                        </span>
                      </div>

                      <p className="talent-bio">{talent.bio}</p>

                      <div className="talent-links">
                        {talent.github && (
                          <a href={`https://github.com/${talent.github}`} target="_blank" rel="noreferrer" className="talent-link">
                            <GithubIcon size={14} /> github.com/{talent.github}
                          </a>
                        )}
                        {talent.twitter && (
                          <a href={`https://twitter.com/${talent.twitter}`} target="_blank" rel="noreferrer" className="talent-link">
                            <TwitterIcon size={14} /> @{talent.twitter}
                          </a>
                        )}
                        {talent.telegram && (
                          <a href={`https://t.me/${talent.telegram}`} target="_blank" rel="noreferrer" className="talent-link">
                            <TelegramIcon size={14} /> t.me/{talent.telegram}
                          </a>
                        )}
                        {talent.linkedin && (
                          <a href={`https://linkedin.com/in/${talent.linkedin}`} target="_blank" rel="noreferrer" className="talent-link">
                            <LinkedinIcon size={14} /> linkedin.com/in/{talent.linkedin}
                          </a>
                        )}
                        <button 
                          className="talent-link" 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          onClick={() => {
                            const text = encodeURIComponent(`Check out @${talent.username}'s developer reputation on BitBacked Stacks protocol!`);
                            const url = encodeURIComponent(`https://github.com/Earnwithalee7890/bit-backed`);
                            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                          }}
                          title="Share Profile on Twitter"
                        >
                          <ShareIcon size={14} /> Share
                        </button>
                      </div>

                      <div className="talent-stats-row">
                        <div className="talent-stat">
                          <AwardIcon size={14} color="var(--primary-glow)" />
                          <span>Reputation Score</span>
                          <span className="tooltip-container">
                            <span className="tooltip-icon">?</span>
                            <span className="tooltip-text">A developer's trust score determined by verified profiles, links, and direct community backing.</span>
                          </span>
                          <span>: <strong>{talent.reputationScore}</strong></span>
                        </div>
                        <div className="talent-stat">
                          <Coins size={14} color="var(--secondary-glow)" />
                          <span>Backing Pool</span>
                          <span className="tooltip-container">
                            <span className="tooltip-icon">?</span>
                            <span className="tooltip-text">Total quantity of TAL tokens staked by backers supporting this developer's network validation.</span>
                          </span>
                          <span>: <strong>{talent.totalBacking.toLocaleString()} TAL</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="stake-action-col">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => {
                          if (!walletConnected) {
                            triggerNotification('Please connect your Stacks wallet first.');
                          } else {
                            openStakeModal(talent);
                          }
                        }}
                      >
                        Back Talent
                      </button>
                    </div>
                  </div>
                ))}

                {filteredTalents.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    No developer passports found matching that search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passport Tab View */}
          {activeTab === 'passport' && (
            <div>
              {!walletConnected ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <ShieldAlert size={48} color="#ffa500" style={{ marginBottom: '16px' }} />
                  <h3>Wallet Disconnected</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
                    Connect your Stacks wallet to view, register, or manage your developer passport.
                  </p>
                  <button className="btn btn-primary" onClick={handleConnect}>
                    Connect Stacks Wallet
                  </button>
                </div>
              ) : userPassport ? (
                <div className="talent-card glass-panel" style={{ background: 'rgba(138,43,226,0.03)', border: '1px solid rgba(138,43,226,0.2)' }}>
                  <img src={userPassport.avatarUrl} alt={userPassport.username} className="talent-avatar" style={{ width: '96px', height: '96px' }} />
                  
                  <div className="talent-info">
                    <div className="talent-header-row">
                      <div className="talent-name-wrapper">
                        <h2 style={{ fontSize: '1.75rem' }}>@{userPassport.username}</h2>
                        {userPassport.isVerified ? (
                          <span className="badge badge-verified">
                            <CheckCircle2 size={12} /> Verified Builder
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            Pending Verification
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="talent-bio" style={{ fontSize: '1.05rem', margin: '12px 0' }}>{userPassport.bio}</p>

                    <div className="talent-links" style={{ marginBottom: '20px' }}>
                      {userPassport.github && (
                        <a href={`https://github.com/${userPassport.github}`} target="_blank" rel="noreferrer" className="talent-link" style={{ fontSize: '1rem' }}>
                          <GithubIcon size={16} /> github.com/{userPassport.github}
                        </a>
                      )}
                      {userPassport.twitter && (
                        <a href={`https://twitter.com/${userPassport.twitter}`} target="_blank" rel="noreferrer" className="talent-link" style={{ fontSize: '1rem' }}>
                          <TwitterIcon size={16} /> @{userPassport.twitter}
                        </a>
                      )}
                      {userPassport.telegram && (
                        <a href={`https://t.me/${userPassport.telegram}`} target="_blank" rel="noreferrer" className="talent-link" style={{ fontSize: '1rem' }}>
                          <TelegramIcon size={16} /> t.me/{userPassport.telegram}
                        </a>
                      )}
                      {userPassport.linkedin && (
                        <a href={`https://linkedin.com/in/${userPassport.linkedin}`} target="_blank" rel="noreferrer" className="talent-link" style={{ fontSize: '1rem' }}>
                          <LinkedinIcon size={16} /> linkedin.com/in/{userPassport.linkedin}
                        </a>
                      )}
                    </div>

                    <div className="talent-stats-row" style={{ borderTopColor: 'rgba(138,43,226,0.1)', paddingTop: '20px' }}>
                      <div className="talent-stat" style={{ fontSize: '1.05rem' }}>
                        <AwardIcon size={18} color="var(--primary-glow)" />
                        Reputation Score: <strong style={{ fontSize: '1.25rem' }}>{userPassport.reputationScore}</strong>
                      </div>
                      <div className="talent-stat" style={{ fontSize: '1.05rem' }}>
                        <Coins size={18} color="var(--secondary-glow)" />
                        Backing Pool: <strong style={{ fontSize: '1.25rem' }}>{userPassport.totalBacking.toLocaleString()} TAL</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ marginBottom: '8px' }}>Register Your Talent Passport</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                    Publish your professional profile to the Stacks Mainnet registry. Your passport initializes with 100 reputation score.
                  </p>

                  <form onSubmit={handleRegister} className="passport-form glass-panel">
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        placeholder="username (e.g. alice_builder)"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Professional Bio / Core Skills</label>
                      <textarea
                        placeholder="Clarity developer crafting secure Web3 applications..."
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        className="form-input"
                        style={{ minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Avatar Image URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={regAvatar}
                        onChange={(e) => setRegAvatar(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GitHub Username</label>
                      <input
                        type="text"
                        placeholder="GitHub handle"
                        value={regGithub}
                        onChange={(e) => setRegGithub(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Twitter / X Handle</label>
                      <input
                        type="text"
                        placeholder="Twitter handle"
                        value={regTwitter}
                        onChange={(e) => setRegTwitter(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Telegram Username</label>
                      <input
                        type="text"
                        placeholder="Telegram handle"
                        value={regTelegram}
                        onChange={(e) => setRegTelegram(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">LinkedIn Username</label>
                      <input
                        type="text"
                        placeholder="LinkedIn profile name"
                        value={regLinkedin}
                        onChange={(e) => setRegLinkedin(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }}>
                      <PlusCircle size={16} /> Deploy Passport Contract
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sidebar Console Panel */}
        <aside className="glass-panel staking-panel">
          <div>
            <h3 className="section-title">Developer Staking Console</h3>
            <p className="section-desc">Back developers with TAL tokens to boost their reputation and claim real-time protocol rewards.</p>
            
            {walletConnected ? (
              <div className="active-stakes-list">
                 <div className="glass-panel" style={{ padding: '16px', background: 'rgba(0,191,255,0.03)', border: '1px solid rgba(0,191,255,0.1)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Staking Overview</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coins color="var(--secondary-glow)" size={20} />
                    {Object.values(userStakeOnTalents).reduce((sum, s) => sum + s.amount, 0).toLocaleString()} TAL
                  </div>
                </div>

                {/* Swap / Exchange Calculator */}
                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>STX to TAL Instant Swap</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="number" 
                        value={swapSTXAmount} 
                        onChange={(e) => setSwapSTXAmount(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', outline: 'none', fontSize: '0.85rem' }} 
                        placeholder="STX"
                      />
                      <span style={{ position: 'absolute', right: '8px', top: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>STX</span>
                    </div>
                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>➜</span>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <input 
                        type="text" 
                        value={isNaN(parseFloat(swapSTXAmount)) ? '0' : (parseFloat(swapSTXAmount) * 25).toString()} 
                        disabled
                        style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'var(--secondary-glow)', fontSize: '0.85rem' }} 
                      />
                      <span style={{ position: 'absolute', right: '8px', top: '8px', fontSize: '0.75rem', color: 'var(--secondary-glow)' }}>TAL</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSwap}
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '8px 0', fontSize: '0.8rem', justifyContent: 'center', borderRadius: '6px' }}
                  >
                    Swap Tokens (1 STX = 25 TAL)
                  </button>
                </div>

                <h4 style={{ fontSize: '0.95rem', marginTop: '12px', color: '#fff' }}>Your Backed Developers</h4>

                {Object.keys(userStakeOnTalents).length > 0 ? (
                  Object.values(userStakeOnTalents).map((stake) => {
                    const talent = talents.find((t) => t.address === stake.talentAddress);
                    if (!talent) return null;
                    const rewards = getPendingRewards(stake.talentAddress);

                    return (
                      <div key={stake.talentAddress} className="active-stake-card">
                        <div className="stake-card-header">
                          <span className="stake-username">@{talent.username}</span>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                            {stake.amount} TAL Staked
                          </span>
                        </div>

                        <div className="stake-reward-row">
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                              <span>Pending Yield</span>
                              <span className="tooltip-container">
                                <span className="tooltip-icon">?</span>
                                <span className="tooltip-text">Accrued staking rewards in TAL tokens that can be claimed immediately or left to accumulate.</span>
                              </span>
                            </div>
                            <div style={{ fontWeight: 600, color: 'var(--success-glow)' }}>+{rewards} TAL</div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              className="btn btn-success" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              onClick={() => handleClaim(stake.talentAddress)}
                              disabled={rewards <= 0}
                            >
                              Claim
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                              onClick={() => handleUnstake(stake.talentAddress, stake.amount)}
                            >
                              Unstake
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    You haven't backed any builders yet.
                  </div>
                )}

                {/* Simulated faucet for tests */}
                <div className="faucet-box" style={{ marginTop: '12px' }}>
                  <div className="faucet-info">
                    <span className="faucet-title">Staking Faucet</span>
                    <span className="faucet-desc">Get test STX & TAL</span>
                  </div>
                  <button className="btn btn-secondary" onClick={handleFaucet} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
                    Claim Faucet
                  </button>
                </div>

                {/* Transaction history ledger */}
                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255, 255, 255, 0.05)', marginTop: '12px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>On-Chain Event Ledger</span>
                    <span style={{ fontSize: '0.75rem', background: 'rgba(138,43,226,0.15)', color: 'var(--primary-glow)', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                    {ledgerTxs.map((tx, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.75rem', borderLeft: '2px solid var(--primary-glow)', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                          <span style={{ fontFamily: 'monospace' }}>{tx.txId}</span>
                          <span>{tx.timestamp}</span>
                        </div>
                        <div style={{ color: '#fff', fontWeight: 500 }}>{tx.details}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>Block #{tx.block}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner Admin Controls panel in sidebar */}
                {isAdminMode && (
                  <div className="glass-panel" style={{ padding: '16px', background: 'rgba(138,43,226,0.05)', border: '1px solid rgba(138, 43, 226, 0.15)', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'inline-block' }} />
                      Contract Owner Controls
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                      {talents.filter(t => !t.isVerified).length > 0 ? (
                        talents.filter(t => !t.isVerified).map(t => (
                          <div key={t.address} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.8rem' }}>
                            <span>@{t.username}</span>
                            <button 
                              onClick={() => handleVerifyBuilder(t.address)}
                              className="btn btn-success" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '8px 0' }}>
                          All builders verified!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Please connect your wallet to view your active backings.
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Staking Modal */}
      {stakingModalOpen && selectedTalent && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Back Developer: @{selectedTalent.username}</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px' }}
                onClick={() => setStakingModalOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Select the amount of TAL tokens you wish to stake to back @{selectedTalent.username}. This will increase their reputation score and grant you staking rewards.
            </p>

            <div className="slider-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>Amount to Stake:</span>
                <span style={{ color: 'var(--secondary-glow)' }}>{stakeAmount} TAL</span>
              </div>
              <input
                type="range"
                min="10"
                max={Math.max(10, Math.floor(talBalance))}
                step="10"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-values">
                <span>Min: 10 TAL</span>
                <span>Max Available: {Math.floor(talBalance)} TAL</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setStakingModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleStake}>
                Confirm Staking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Footer */}
      <footer className="footer glass-panel" style={{ marginTop: '48px', padding: '32px 24px', background: 'rgba(18, 18, 24, 0.5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', background: 'var(--cyber-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BitBacked
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Decentralized professional identity and backing protocol on Stacks. Support Bitcoin builders and verify developer reputation on-chain.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>Stacks Mainnet Registry</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
              <div>Passport: <span style={{ color: 'var(--primary-glow)' }}>SP3Z3KZR3GQ5C6W9W5X1T2Y6H4R9P8N2W4D4G7B3.talent-passport</span></div>
              <div>Token (TAL): <span style={{ color: 'var(--secondary-glow)' }}>SP3Z3KZR3GQ5C6W9W5X1T2Y6H4R9P8N2W4D4G7B3.talent-token</span></div>
              <div>Staking: <span style={{ color: 'var(--success-glow)' }}>SP3Z3KZR3GQ5C6W9W5X1T2Y6H4R9P8N2W4D4G7B3.talent-staking</span></div>
            </div>
          </div>
          
          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px' }}>Network Stats</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-glow" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success-glow)', display: 'inline-block', boxShadow: '0 0 8px var(--success-glow)' }} />
                Stacks Node: <strong style={{ color: '#fff' }}>Online (Mainnet)</strong>
              </div>
              <div>Block Speed: <strong style={{ color: '#fff' }}>~10 minutes (Bitcoin Anchored)</strong></div>
              <div>Connected Stakers: <strong style={{ color: '#fff' }}>1,284</strong></div>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>&copy; {new Date().getFullYear()} BitBacked Protocol. Built for Stacks Mainnet. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://stacks.org" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="talent-link">Stacks.org</a>
            <a href="https://github.com/Earnwithalee7890/bit-backed" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }} className="talent-link">GitHub Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
