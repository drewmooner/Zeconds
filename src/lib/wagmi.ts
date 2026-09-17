import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain, mainnet, type AppKitNetwork } from "@reown/appkit/networks";
import { http } from "wagmi";

export const robinhoodChain = defineChain({
  id: 4663,
  caipNetworkId: "eip155:4663",
  chainNamespace: "eip155",
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  caipNetworkId: "eip155:46630",
  chainNamespace: "eip155",
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.testnet.chain.robinhood.com",
    },
  },
  testnet: true,
  contracts: {
    multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" },
  },
});

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [robinhoodChain, robinhoodTestnet, mainnet];

/** Reown Cloud project id. Override with VITE_REOWN_PROJECT_ID. Localhost fallback is the public demo id. */
export const projectId =
  import.meta.env.VITE_REOWN_PROJECT_ID || "b56e18d47c72ab683b10814fe9495694";

const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
  transports: {
    [robinhoodChain.id]: http("https://rpc.mainnet.chain.robinhood.com"),
    [robinhoodTestnet.id]: http("https://rpc.testnet.chain.robinhood.com"),
    [mainnet.id]: http(),
  },
});

let modal: ReturnType<typeof createAppKit> | undefined;
try {
  modal = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    defaultNetwork: robinhoodChain,
    metadata: {
      name: "Zeconds",
      description: "Seconds-scale stock prediction market on Robinhood Chain",
      url: origin,
      icons: [`${origin}/logo.png`],
    },
    features: {
      analytics: false,
      email: false,
      socials: false,
      onramp: false,
    },
    allowUnsupportedChain: true,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#f2f2f2",
      "--w3m-border-radius-master": "1.5px",
    },
  });
} catch (err) {
  console.error("AppKit failed to start", err);
}

export const wagmiConfig = wagmiAdapter.wagmiConfig;

export function openAppKit(view?: "Account") {
  if (!modal) {
    console.error("AppKit is not ready");
    return;
  }
  return modal.open(view ? { view } : undefined);
}

export function disconnectAppKit() {
  try {
    return modal?.disconnect?.();
  } catch {
    /* ignore */
  }
}
