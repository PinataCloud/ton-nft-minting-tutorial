"use client";

import { useState } from "react";
import { uploadFile, uploadJson } from "@/utils/uploads";
import * as constants from "../constants.config";
import TonWeb from "tonweb";

const { NftCollection, NftItem } = TonWeb.token.nft;

const tonweb = new TonWeb(
  new TonWeb.HttpProvider(constants.NETWORK, {
    apiKey: constants.API_KEY,
  }),
);

export default function Home() {
  const [walletAddress, setWalletAddress]: any = useState("");

  const [collectionName, setCollectionName] = useState<string>();
  const [collectionDescription, setCollectionDescription] = useState<string>();
  const [collectionExternalUrl, setCollectionExternalUrl] = useState<string>();
  const [collectionRoyalty, setCollectionRoyalty] = useState<number>(5);
  const [collectionFile, setCollectionFile] = useState<File | undefined>();
  const [collectionAddress, setCollectionAddress]: any = useState(null);
  const [nftCollection, setNftCollection]: any = useState(null);

  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [externalUrl, setExternalUrl] = useState<string>();
  const [file, setFile] = useState<File | undefined>();

  const [complete, setComplete] = useState(false);

  const connectWallet = async () => {
    try {
      if (window.tonProtocolVersion || window.tonProtocolVersion > 1) {
        if (window.ton.isTonWallet) {
          console.log("TON Wallet Extension found!");
        }

        const provider = window.ton;
        const accounts = await provider.send("ton_requestWallets");

        const walletAddress = new TonWeb.utils.Address(accounts[0].address);

        console.log("Connected accounts:", accounts);

        console.log(
          "Connected wallet address:",
          walletAddress.toString(true, true, true),
        );

        setWalletAddress(walletAddress);
      } else {
        alert("Please update your TON Wallet Extension 💎");
        location.href =
          "https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd";
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deployNftCollection = async () => {
    const provider = window.ton;

    const collectionImageCid = await uploadFile(collectionFile);

    const collectionData = {
      name: collectionName,
      description: collectionDescription,
      external_link: collectionExternalUrl,
      image: `ipfs://${collectionImageCid}`,
      seller_fee_basis_points: 100,
      fee_recipient: walletAddress.toString(true, true, true),
    };

    const collectionUri = await uploadJson(collectionData);

    const nftCollection = new NftCollection(tonweb.provider, {
      ownerAddress: walletAddress, // owner of the collection
      royalty: collectionRoyalty / 100, // royalty in %
      royaltyAddress: walletAddress, // address to receive the royalties
      collectionContentUri: `ipfs://${collectionUri}`, // url to the collection content
      nftItemContentBaseUri: "", // url to the nft item content
      nftItemCodeHex: NftItem.codeHex, // format of the nft item
    });
    console.log("Collection data:", nftCollection);
    const nftCollectionAddress = await nftCollection.getAddress();

    console.log(
      "Collection address (changes with provided data):",
      nftCollectionAddress.toString(true, true, true),
    );

    const stateInit = (await nftCollection.createStateInit()).stateInit;
    const stateInitBoc = await stateInit.toBoc(false);
    const stateInitBase64 = TonWeb.utils.bytesToBase64(stateInitBoc);

    provider
      .send("ton_sendTransaction", [
        {
          to: nftCollectionAddress.toString(true, true, true),
          value: TonWeb.utils.toNano((0.05).toString()).toString(), // 0.05 TON to cover the gas
          stateInit: stateInitBase64,
          dataType: "boc",
        },
      ])
      .then(async (res: any) => {
        if (res) {
          console.log("Transaction successful");

          setCollectionAddress(nftCollectionAddress);
          setNftCollection(nftCollection);
        } else {
          console.log("Wallet didn't approved minting transaction");
        }
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const deployNftItem = async () => {
    const provider = window.ton;
    const amount = TonWeb.utils.toNano((0.05).toString());

    const nftImageCid = await uploadFile(file);
    const nftData = {
      name: name,
      description: description,
      image: `ipfs://${nftImageCid}`,
      external_link: externalUrl,
    };
    const nftUri = await uploadJson(nftData);

    const body = await nftCollection.createMintBody({
      amount: amount,
      itemIndex: "0", // Typically you will want to fetch the existing colleciton to see the next token id
      itemContentUri: `ipfs://${nftUri}`,
      itemOwnerAddress: walletAddress,
    });

    const bodyBoc = await body.toBoc(false);
    const bodyBase64 = TonWeb.utils.bytesToBase64(bodyBoc);

    provider
      .send("ton_sendTransaction", [
        {
          to: collectionAddress.toString(true, true, true),
          value: amount.toString(),
          data: bodyBase64,
          dataType: "boc",
        },
      ])
      .then((res: any) => {
        if (res) {
          setComplete(true);
          console.log("Transaction successful");
        } else {
          console.log("Wallet didn't approved minting transaction");
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      {walletAddress && !collectionAddress && !complete && (
        <>
          <h2 className="text-3xl font-bold">Create NFT Collection</h2>
          <div>Connected: {walletAddress.toString(true, true, true)}</div>
          <input
            className="border border-black rounded-md p-2"
            placeholder="Collection Name"
            type="text"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            placeholder="Collection Description"
            type="text"
            value={collectionDescription}
            onChange={(e) => setCollectionDescription(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            placeholder="https://pinata.cloud"
            type="text"
            value={collectionExternalUrl}
            onChange={(e) => setCollectionExternalUrl(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            placeholder="royalty percentage (e.g. 5 for 5%)"
            type="number"
            value={collectionRoyalty}
            onChange={(e: any) => setCollectionRoyalty(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            type="file"
            onChange={(e) =>
              setCollectionFile(
                e.target.files && e.target.files.length > 0
                  ? e.target.files[0]
                  : undefined,
              )
            }
          />
          <button
            onClick={deployNftCollection}
            className="border border-black rounded-md p-2"
          >
            Create Collection
          </button>
        </>
      )}
      {walletAddress && collectionAddress && !complete && (
        <>
          <h2 className="text-3xl font-bold">Mint an NFT</h2>
          <div>Connected: {walletAddress.toString(true, true, true)}</div>
          <div>
            Collection Address: {collectionAddress.toString(true, true, true)}
          </div>
          <input
            className="border border-black rounded-md p-2"
            placeholder="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            placeholder="Description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            placeholder="https://pinata.cloud"
            type="text"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
          />
          <input
            className="border border-black rounded-md p-2"
            type="file"
            onChange={(e) =>
              setFile(
                e.target.files && e.target.files.length > 0
                  ? e.target.files[0]
                  : undefined,
              )
            }
          />
          <button
            onClick={deployNftItem}
            className="border border-black rounded-md p-2"
          >
            Mint NFT
          </button>
        </>
      )}{" "}
      {walletAddress && collectionAddress && complete && (
        <>
          <h2>Mint Complete! 🎉</h2>
          <a
            href={`https://testnet.getgems.io/collection/${collectionAddress}`}
            className="underline font-bold"
          >
            View NFT
          </a>
        </>
      )}
      {!walletAddress && !complete && (
        <button
          className="border border-black rounded-md p-2"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
