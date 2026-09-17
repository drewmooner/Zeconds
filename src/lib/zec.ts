import { useEffect } from "react";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { useAppKitAccount } from "@reown/appkit/react";
import { erc20Abi, formatUnits, isAddress } from "viem";
import { robinhoodChain, robinhoodTestnet } from "./wagmi";
import { useTerminal } from "../store";

function parseToken(raw: unknown): `0x${string}` | undefined {
  if (typeof raw !== "string") return undefined;
  const v = raw.trim();
  if (!isAddress(v)) return undefined;
  return v;
}

/** ZEC chip on Robinhood Chain. Other tokens never count. Set VITE_ZEC_TOKEN. */
export const ZEC_TOKEN = parseToken(import.meta.env.VITE_ZEC_TOKEN);

export const ZEC_CHAIN_IDS = new Set([robinhoodChain.id, robinhoodTestnet.id]);

export function useDeskAccount() {
  const kit = useAppKitAccount();
  const wagmi = useAccount();
  const address = (kit.address || wagmi.address) as `0x${string}` | undefined;
  const isConnected = Boolean(kit.isConnected || wagmi.isConnected || address);
  return { address, isConnected, chainId: wagmi.chainId };
}

export function useZecGate() {
  const { address, isConnected, chainId } = useDeskAccount();
  const { switchChain } = useSwitchChain();
  const setZec = useTerminal((s) => s.setZec);
  const onRobinhood = Boolean(chainId && ZEC_CHAIN_IDS.has(chainId));
  const readChain = onRobinhood && chainId ? chainId : robinhoodChain.id;

  const enabled = Boolean(isConnected && address && ZEC_TOKEN && onRobinhood);

  const { data: raw } = useReadContract({
    address: ZEC_TOKEN,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: readChain,
    query: { enabled, refetchInterval: 8_000 },
  });

  const { data: decimals } = useReadContract({
    address: ZEC_TOKEN,
    abi: erc20Abi,
    functionName: "decimals",
    chainId: readChain,
    query: { enabled: Boolean(ZEC_TOKEN) },
  });

  const zec =
    enabled && raw != null ? Number(formatUnits(raw, Number(decimals ?? 18))) : 0;

  useEffect(() => {
    setZec(zec);
  }, [zec, setZec]);

  const switchToRobinhood = () => {
    try {
      switchChain({ chainId: robinhoodChain.id });
    } catch {
      /* user rejected */
    }
  };

  return {
    address,
    isConnected,
    onRobinhood,
    tokenReady: Boolean(ZEC_TOKEN),
    zec,
    switchToRobinhood,
  };
}

export type BetBlock =
  | "live"
  | "connect"
  | "network"
  | "token"
  | "balance"
  | "size"
  | null;

export function betBlock(opts: {
  phase: string;
  stake: number;
  isConnected: boolean;
  onRobinhood: boolean;
  tokenReady: boolean;
  zec: number;
}): BetBlock {
  if (opts.phase === "live") return "live";
  if (!opts.isConnected) return "connect";
  if (!opts.onRobinhood) return "network";
  if (!opts.tokenReady) return "token";
  if (opts.zec <= 0 || opts.stake > opts.zec) return "balance";
  if (opts.stake < 1) return "size";
  return null;
}

export function betBlockCopy(block: BetBlock) {
  switch (block) {
    case "connect":
      return "Connect a wallet to bet. $ZEC only.";
    case "network":
      return "Switch to Robinhood Chain.";
    case "token":
      return "$ZEC is not live on this desk yet.";
    case "balance":
      return "You need $ZEC in this wallet. Other tokens do not count.";
    case "size":
      return "Set a size in $ZEC.";
    default:
      return null;
  }
}
