import Head from "next/head";
import Image from "next/image";
import { useState, useRef } from "react";
import { NFTCard } from "../components/nftCard";
// import dotenv from "dotenv";
// dotenv.config();

const Home = () => {
  const [wallet, setWalletAddress] = useState("");
  const [collection, setCollection] = useState("");
  const [fetchForCollection, setFetchForCollection] = useState(false);
  const [NFTs, setNFTs] = useState([]);
  const enteredWallet = useRef();
  const enteredCollection = useRef();
  let baseURL;
  let nfts;
  let fetchURL;
  const requestOptions = {
    method: "GET",
  };
  const changeWalletHandler = () => {
    setWalletAddress(enteredWallet.current.value);
  };

  const changeCollectionHandler = () => {
    setCollection(enteredCollection.current.value);
  };

  const fetchNFTs = async () => {
    console.log("fetching nfts");
    baseURL = `https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_API_KEY}/getNFTs/`;
    console.log(baseURL);
    if (!collection.length) {
      fetchURL = `${baseURL}?owner=${wallet}`;
      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());
    } else {
      console.log("fetching nfts for collection owned by address");
      fetchURL = `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}`;
      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());
    }

    if (nfts) {
      console.log("nfts:", nfts);
      setNFTs(nfts.ownedNfts);
      console.log(NFTs);
    }
  };

  const fetchNFTsForCollection = async () => {
    if (collection.length) {
      baseURL = `https://polygon-mumbai.g.alchemy.com/nft/v2/${process.env.NEXT_PUBLIC_API_KEY}/getNFTsForCollection/`;
      console.log(baseURL);
      fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}`;
      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());
      if (nfts) {
        console.log("NFTs in collection:", nfts);
        setNFTs(nfts.nfts);
        console.log(NFTs);
      }
    }
  };
  const checkboxHandler = (event) => {
    setFetchForCollection(event.target.checked);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <input
          className="w-2/5 bg-slate-300 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50"
          disabled={fetchForCollection}
          type={"text"}
          placeholder="Add your wallet address"
          onChange={changeWalletHandler}
          ref={enteredWallet}
          value={wallet}
        ></input>
        <input
          className="w-2/5 bg-slate-300 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-400 disabled:bg-slate-50 disabled:text-gray-50"
          type={"text"}
          placeholder="Add the collection address"
          onChange={changeCollectionHandler}
          ref={enteredCollection}
          value={collection}
        ></input>
        <label className="text-gray-600 ">
          <input
            type={"checkbox"}
            className="mr-2"
            onChange={checkboxHandler}
          ></input>
          Fetch for collection
        </label>
        <button
          className={
            "disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"
          }
          onClick={fetchForCollection ? fetchNFTsForCollection : fetchNFTs}
        >
          Let's go!{" "}
        </button>
      </div>
      <div className="flex flex-wrap  gap-y-12 mt-4 w-3/5 gap-x-2 justify-center">
        {NFTs.length &&
          NFTs.map((nft) => {
            return (
              <NFTCard
                key={nft.id.tokenId}
                id={nft.id.tokenId}
                src={nft.media[0].gateway}
                address={nft.contract.address}
                description={nft.description}
                title={nft.title}
              ></NFTCard>
            );
          })}
      </div>
    </div>
  );
};

export default Home;
