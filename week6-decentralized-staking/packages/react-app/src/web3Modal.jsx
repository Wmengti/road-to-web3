import Web3Modal from "web3modal";
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    // torus: {
    //   package: Torus,
    //   options: {
    //     networkParams: {
    //       host: "https://localhost:8545", // optional
    //       chainId: 1337, // optional
    //       networkId: 1337 // optional
    //     },
    //     config: {
    //       buildEnv: "development" // optional
    //     },
    //   },
    // },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});

const [injectedProvider, setInjectedProvider] = useState();

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
    await injectedProvider.provider.disconnect();
  }
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

let networkDisplay = "";
if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
  const networkSelected = NETWORK(selectedChainId);
  const networkLocal = NETWORK(localChainId);
  if (selectedChainId === 1337 && localChainId === 31337) {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message="⚠️ Wrong Network ID"
          description={
            <div>
              You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
              HardHat.
              <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  } else {
    networkDisplay = (
      <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
        <Alert
          message="⚠️ Wrong Network"
          description={
            <div>
              You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
              <Button
                onClick={async () => {
                  const ethereum = window.ethereum;
                  const data = [
                    {
                      chainId: "0x" + targetNetwork.chainId.toString(16),
                      chainName: targetNetwork.name,
                      nativeCurrency: targetNetwork.nativeCurrency,
                      rpcUrls: [targetNetwork.rpcUrl],
                      blockExplorerUrls: [targetNetwork.blockExplorer],
                    },
                  ];
                  console.log("data", data);

                  let switchTx;
                  // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                  try {
                    switchTx = await ethereum.request({
                      method: "wallet_switchEthereumChain",
                      params: [{ chainId: data[0].chainId }],
                    });
                  } catch (switchError) {
                    // not checking specific error code, because maybe we're not using MetaMask
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: data,
                      });
                    } catch (addError) {
                      // handle "add" error
                    }
                  }

                  if (switchTx) {
                    console.log(switchTx);
                  }
                }}
              >
                <b>{networkLocal && networkLocal.name}</b>
              </Button>
            </div>
          }
          type="error"
          closable={false}
        />
      </div>
    );
  }
} else {
  networkDisplay = (
    <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
      {targetNetwork.name}
    </div>
  );
}

const loadWeb3Modal = useCallback(async () => {
  const provider = await web3Modal.connect();
  setInjectedProvider(new ethers.providers.Web3Provider(provider));

  provider.on("chainChanged", chainId => {
    console.log(`chain changed to ${chainId}! updating providers`);
    setInjectedProvider(new ethers.providers.Web3Provider(provider));
  });

  provider.on("accountsChanged", () => {
    console.log(`account changed!`);
    setInjectedProvider(new ethers.providers.Web3Provider(provider));
  });

  // Subscribe to session disconnection
  provider.on("disconnect", (code, reason) => {
    console.log(code, reason);
    logoutOfWeb3Modal();
  });
}, [setInjectedProvider]);

useEffect(() => {
  if (web3Modal.cachedProvider) {
    loadWeb3Modal();
  }
}, [loadWeb3Modal]);
