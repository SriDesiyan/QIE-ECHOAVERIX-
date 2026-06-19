export interface EchoAgent {
  id: string;
  creator: string;
  metadataUri: string;
  name: string;
  domain: string;
  description: string;
  systemPrompt: string;
  baseModel: string;
  activeVersion: number;
  priceType: 'subscription' | 'pay_per_query' | 'free';
  priceAmount: number;
  echoScore: number;
}

export interface EchoScoreResult {
  agentId: string;
  accuracy: number;
  reliability: number;
  safety: number;
  consistency: number;
  quality: number;
  community: number;
  composite: number;
}

export interface LicenseTier {
  id: string;
  agentId: string;
  userAddress: string;
  licenseType: string;
  expiryTime: number;
  active: boolean;
}

export interface KnowledgeSource {
  id: string;
  agentId: string;
  sourceName: string;
  sourceType: 'file' | 'url' | 'text';
  sourceContent: string;
}

export interface MeshSession {
  id: string;
  query: string;
  response: string;
  attribution: Record<string, {
    name: string;
    domain: string;
    weight: number;
  }>;
  timestamp: number;
}

export const QIE_NETWORK_CONFIG = {
  chainId: 9789, // Hypothetical QIE Chain ID
  chainName: 'QIE Mainnet',
  rpcUrl: 'https://rpc.qie.space',
  blockExplorer: 'https://explorer.qie.space',
  contracts: {
    accessController: '0x1111111111111111111111111111111111111111',
    agentRegistry: '0x2222222222222222222222222222222222222222',
    licenseVault: '0x3333333333333333333333333333333333333333',
    royaltySplitter: '0x4444444444444444444444444444444444444444',
    legacyTransfer: '0x5555555555555555555555555555555555555555',
    reputationAnchor: '0x6666666666666666666666666666666666666666',
    meshRouter: '0x7777777777777777777777777777777777777777',
    qusdc: '0x8888888888888888888888888888888888888888'
  }
};
