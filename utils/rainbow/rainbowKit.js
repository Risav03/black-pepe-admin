"use client";
import React, { createContext, useContext } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, sepolia, WagmiConfig } from "wagmi";
import { phantomWallet, metaMaskWallet, coinbaseWallet, walletConnectWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import { mainnet, goerli, polygon, base } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
const WalletIdContext = createContext();

const { chains, publicClient } = configureChains(
  [base],
  [publicProvider()]
);

const { wallets } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "5d10af3027c340310f3a3da64cbcedac",
  chains,
});


// const connector = new WalletConnectConnector({
//   options: {
//     projectId: '5d10af3027c340310f3a3da64cbcedac',
//   },
// })


const connectors = connectorsForWallets(
  [
    ...wallets,
    {
      groupName: 'Phantom',
      wallets: [phantomWallet({ chains })],
    }],

  // { appName: 'RainbowKit App', projectId: '5d10af3027c340310f3a3da64cbcedac' }
);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});


const RainbowProvider = ({ children }) => {
  return (
    <WagmiConfig config={wagmiConfig}>
      {/* Provide the wallet ID through context */}

      <RainbowKitProvider coolMode chains={chains}>
        {children}
      </RainbowKitProvider>

    </WagmiConfig>
  );
};

export const useWalletId = () => useContext(WalletIdContext);

export default RainbowProvider;
