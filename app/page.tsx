import { WalletConnectButton } from "@/components/walletConnectButton";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="absolute top-4 right-4">
        <WalletConnectButton />
      </div>
    </main>
  );
}
