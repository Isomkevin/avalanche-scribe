import { InjectedConnector } from '@web3-react/injected-connector';
import { useWeb3React } from '@web3-react/core';

export const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42, 43114] });

export const ConnectWallet = () => {
  const { active, account, library, connector, activate, deactivate } = useWeb3React();

  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <div>
      {active ? (
        <div>
          <p>Connected with {account}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connect}>Connect to Core</button>
      )}
    </div>
  );
};
