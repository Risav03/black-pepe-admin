'use client'
import { WalletConnectButton } from "@/components/walletConnectButton";
import { ethers } from "ethers";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getWalletClient } from "wagmi/actions";
import { contractAdds } from "@/utils/contractAdds";
import abi from "@/utils/abis/token-abi"
import { walletClientToSigner } from "@/utils/services/walletClientToSigner";
import { useAccount } from "wagmi";

export default function Home() {

  const[owner, setOwner] = useState<string>('');

  const [newOwner, setNewOwner] = useState<string>('');
  const [holderCount, setHolderCount] = useState<number>(0);
  const [currentMaxSupply, setCurrentMaxSupply] = useState<string>('0');
  const [maxSupply, setMaxSupply] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>('');

  const[status, setStatus] = useState<boolean>(false);

  const[minter, setMinter] = useState<string>('');

  const[holderCheck, setHolderCheck] = useState<string>('');
  const[holderStatus, setHolderStatus] = useState<string>("");

  const[amount, setAmount] = useState<string>('0');
  const[mintTo, setMintTo] = useState<string>('');

  const { address } = useAccount();

  async function mint(){
    try{
      const contract = await contractSetup();
      const tx = await contract?.mint(mintTo, ethers.utils.parseEther(amount.toString()));
      await tx.wait();
    }
    catch(err){
      setError("Either address is not valid or exceeding max supply limit.");
      console.log(err)
    }
    finally{
      setLoading(false);
    }
  }

  async function contractSetup() {
    setLoading(true);
    try {

      // @ts-ignore
      if (typeof window.ethereum !== 'undefined') {
        //@ts-ignore
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(contractAdds.token, abi, signer);
        console.log(contract);
        return contract;
      }
    }
    catch (err) {
      console.log(err);
    }

  }

  async function getInfo() {
    try {
      const contract = await contractSetup();
      const maxSupply = await contract?._maxSupply();
      const holderCount = await contract?.numberOfHolders();

      const totalSupply = await contract?.totalSupply();
      const owner = await contract?.owner();

      
      const status = await contract?.paused();
      setOwner(owner);

      setStatus(status);
      setTotalSupply(Number(ethers.utils.formatEther(totalSupply)).toLocaleString());
      setCurrentMaxSupply(Number(ethers.utils.formatEther(maxSupply)).toLocaleString());
      setHolderCount(Number(holderCount));

    }
    catch (err) {
      console.log(err);
    }
    finally {
      setLoading(false)
    }
  }

  async function transferOwnership() {
    if (newOwner === '') return;
    try {
      const contract = await contractSetup();

      const tx = await contract?.transferOwnership(newOwner);
      await tx.wait();

    }
    catch (err) {
      setError('Either address is not valid or something unexpected happened.');
      console.log(err);
    }
    finally {
      setLoading(false);
    }
  }

  async function changeMaxSupply() {
    if (maxSupply === '') return;
    try {
      const contract = await contractSetup();

      const tx = await contract?.setMaxSupply(maxSupply);
      await tx.wait();

    }
    catch (err) {
      setError('Either Max supply cannot be less than total supply or something unexpected happened.');
      console.log(err);
    }
    finally {
      setLoading(false);
    }
  }

  async function pauseMint(){
    try{
      const contract = await contractSetup();
      const tx = await contract?.pause();
      await tx.wait();
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  async function unPauseMint(){
    try{
      const contract = await contractSetup();
      const tx = await contract?.unpause();
      await tx.wait();
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  async function addMinter(){
    if(minter == '') {
      setError("Enter a valid address");
      return;}
    try{
      const contract = await contractSetup();
      const already = await contract?.allowedMinters(minter);

      if(already){
        setError("Address is already a minter");
        return;
      }
      
      const tx = await contract?.configureMinters(minter, true);
      await tx.wait();
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  async function removeMinter(){
    if(minter == '') {
      setError("Enter a valid address");
      return;}
    try{
      const contract = await contractSetup();
      const already = await contract?.allowedMinters(minter);

      if(!already){
        setError("Address is not a minter");
        return;
      }
      
      const tx = await contract?.configureMinters(minter, false);
      await tx.wait();
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  async function checkHolder(){
    if(holderCheck == '') {
      setError("Enter a valid address");
      return;}
    try{
      const contract = await contractSetup();
      const holder = await contract?.balanceOf(holderCheck);

      if(holder == 0){
        setError("Address is not a holder");
        setHolderStatus("0");
        return;
      }
      
      setHolderStatus(ethers.utils.formatEther(holder));
    }
    catch(err){
      setError("Unexpected Error occured. Check the address.");
      console.log(err);
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    if (address)
      getInfo();
  }, [address]);

  useEffect(() => {
    if (error !== '') {
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  }, [error])

  if(address)
  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-24 bg-black text-white">
      {loading && <div className="fixed z-50 top-0 left-0 w-screen h-screen backdrop-blur-sm animate-pulse bg-black bg-opacity-50 flex items-center justify-center">Loading...</div>}
      {error !== '' && <div className="fixed z-50 bottom-2 right-2 w-60 h-20 text-sm bg-red-500 p-2 rounded-sm flex items-center justify-center">{error}</div>}
      <div className="absolute top-4 right-4">
        <WalletConnectButton />
      </div>

      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <h2>Owner: {owner}</h2>

      <div className="flex gap-2 text-xl">
        <div className="p-4 rounded-lg bg-orange-500 text-white">
          Total Supply: <b>{totalSupply} $BPC</b>
        </div>
        <div className="p-4 rounded-lg bg-blue-500 text-white">
          Total Holders: <b>{holderCount}</b>
        </div>
      </div>

      <div className="bg-blue-700 p-4 rounded-lg">
        <h2 className="text-lg font-bold">Mint status: <span className="text-yellow-400">{status ? "Paused" : "Not Paused"}</span></h2>
        <button disabled={status} onClick={pauseMint} className="bg-red-500 p-4 rounded-lg text-white mr-2 hover:scale-105 duration-200">Pause Mint</button>
        <button disabled={!status} onClick={unPauseMint} className="bg-green-500 p-4 rounded-lg text-white hover:scale-105 duration-200">Unpause Mint</button>
      </div>

      <div className="bg-green-700 p-4 md:w-full rounded-lg text-white flex max-md:flex-col gap-2 md:items-center justify-center">
        <h2 className="text-lg font-bold md:w-[25%]">Transfer Ownership: </h2>
        <input type="text" placeholder="New Owner Address" className="p-2 md:w-[60%] rounded-lg bg-white/20 text-white placeholder:text-white/80" value={newOwner} onChange={(e) => setNewOwner(e.target.value)} />
        <button onClick={transferOwnership} className="bg-black md:w-[15%] rounded-lg hover:scale-105 duration-200 px-5 block py-3">Execute</button>
      </div>

      <div className="bg-pink-700 p-4 md:w-full rounded-lg text-white flex max-md:flex-col gap-2 md:items-center justify-center">
        <h2 className="text-lg font-bold md:w-[25%]">Mint: </h2>
        <div className="md:w-[60%] flex flex-col gap-1">
          <input type="text" placeholder="To Address" className="p-2 rounded-lg bg-white/20 text-white placeholder:text-white/80" value={mintTo} onChange={(e) => setMintTo(e.target.value)} />
          <input type="number" placeholder="Amount" className="p-2 rounded-lg bg-white/20 text-white placeholder:text-white/80" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <button onClick={mint} className="bg-black md:w-[15%] rounded-lg hover:scale-105 duration-200 px-5 block py-3">Execute</button>
      </div>

      <div className="bg-red-700 p-4 md:w-full rounded-lg text-white flex max-md:flex-col gap-2 md:items-center justify-center">
        <div className=" md:w-[25%]">
          <h2 className="text-lg font-bold">Change Max Supply: </h2>
          <h3 className="text-sm">Current: {currentMaxSupply}</h3>
        </div>
        <input type='number' placeholder="New Owner Address" className="p-2 md:w-[60%] rounded-lg bg-white/20 text-white" value={maxSupply} onChange={(e) => setMaxSupply(e.target.value)} />
        <button onClick={changeMaxSupply} className="bg-black md:w-[15%] rounded-lg hover:scale-105 duration-200 px-5 block py-3">Execute</button>
      </div>

      <div className="flex gap-2 w-full bg-emerald-800 p-4 rounded-lg items-center justify-center">
        <h2 className="text-lg font-bold md:w-[25%]">Add or Remove Minter: </h2>
        <input type="text" placeholder="Minter Address" className="p-2 md:w-[60%] rounded-lg bg-white/20 text-white placeholder:text-white/80" value={minter} onChange={(e) => setMinter(e.target.value)} />
        <div className="w-[15%] flex gap-1">
          <button onClick={addMinter} className="bg-green-500 text-xl rounded-lg hover:scale-105 duration-200 px-5 block py-3">+</button>
          <button onClick={removeMinter} className="bg-red-500 text-xl rounded-lg hover:scale-105 duration-200 px-5 block py-3">-</button>
        </div>
      </div>
  
  <div className={`${holderStatus !== "0" && holderStatus.length != 0 && "bg-green-600"} ${holderStatus == "0" && "bg-red-600"} ${holderStatus == "" && "bg-slate-800"} p-4 rounded-lg w-full`}>
      <div className="flex gap-2 w-full items-center justify-center">
        <h2 className="text-lg font-bold md:w-[25%]">Check Wallet Holder: </h2>
        <input type="text" placeholder="Enter Address" className="p-2 md:w-[60%] rounded-lg bg-white/20 text-white placeholder:text-white/80" value={holderCheck} onChange={(e) =>{setHolderStatus(""); setHolderCheck(e.target.value)}} />
        <div className="w-[15%] flex gap-1">
          <button onClick={checkHolder} className="bg-black text-xl rounded-lg hover:scale-105 duration-200 px-5 block py-3">Check</button>
        </div>
      </div>
      {holderStatus !== "0" && holderStatus.length != 0 && "Address is a holder with balance: " + holderStatus + " $BPC"}
      {holderStatus == "0" && "Address is not a holder"}

  </div>
    </main>
  );

  else return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-24 bg-black text-white">
      <div className="absolute top-4 right-4">
        <WalletConnectButton />
      </div>
      <h1 className="text-4xl">Connect Wallet to view this page</h1>
    </main>
  )
}
