import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";

import { Input, Button, Menu, Row, Col, List, notification } from "antd";
import { useContractLoader } from "eth-hooks";
import ERC20ABI from "../contracts/ABI/ERC20ABI.json";
import { AddressInput } from "../components";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useLocalStorage } from "../hooks";
import { BiLinkExternal } from "react-icons/bi";

/**
 * web3 props can be passed from '../App.jsx' into your local view component for use
 * @param {*} yourLocalBalance balance on current network
 * @param {*} readContracts contracts from current chain already pre-loaded using ethers contract module. More here https://docs.ethers.io/v5/api/contract/contract/
 * @returns react component
 **/
function Home({
  tokenSplitterAddress,
  readContracts,
  provider,
  address,
  mainnetProvider,
  injectedProvider,
  writeContracts,
  tx,
  network,
}) {
  const purpose = useContractReader(readContracts, "YourContract", "purpose");
  const [loading, setLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState(null);
  const [isContract, setIsContract] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [equal, setEqual] = useState(true);
  // const [wallets, setWallets] = useLocalStorage("wallets", []);
  const [wallets, setWallets] = useState([]);
  const [amounts, setAmounts] = useState([]);
  const [singleAmount, setSingleAmount] = useState(0);
  // const [totalAmount, setTotalAmount] = useState(0);
  const [tokenContract, setTokenContract] = useState(null);
  const [sendState, setSendState] = useState("Send");

  console.log(wallets);

  console.log(amounts);

  console.log(tokenName);

  const getTokenData = async () => {
    const contract = new ethers.Contract(contractAddress, ERC20ABI, provider);
    console.log(contract);
    setTokenContract(contract);
    try {
      const name = await contract.name();
      setTokenName(name);
      let walletBalance = await contract.balanceOf(address);
      walletBalance = ethers.utils.formatEther(walletBalance);
      setTokenBalance(walletBalance);
      console.log(tokenBalance);

      setIsContract(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      notification.warning({
        message: "Contract is not an ERC20 Token",
        description: "Please submit a token contract",
        placement: "bottomRight",
      });
      setLoading(false);
      setIsContract(false);
    }
  };

  const checkIsContract = async () => {
    try {
      const code = await provider.getCode(contractAddress);
      // console.log(code);
      if (code == "0x") {
        setLoading(false);
        notification.warning({
          message: "EOA wallet Submitted",
          description: "Please submit a token contract",
          placement: "bottomRight",
        });
        setIsContract(false);
      } else {
        getTokenData();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      notification.warning({
        message: "Entry is not a contract",
        description: "Please Submit a contract",
        placement: "bottomRight",
      });
      setIsContract(false);
    }
  };

  const updateWallet = (value, index) => {
    // for a single addresss
    if (value.length <= 42) {
      const newWallets = [...wallets];
      newWallets[index] = value;
      setWallets(newWallets);
    }

    // if value is multiple addresses with comma
    if (value.length > 42) {
      addMultipleAddress(value);
    }
  };

  const updateAmounts = (value, index) => {
    const newAmounts = [...amounts];
    newAmounts[index] = value;
    setAmounts(newAmounts);
  };

  const addMultipleAddress = value => {
    // add basic validation a address should contains 0x with length of 42 chars
    const validateAddress = address => address.includes("0x") && address.length === 42;

    const addresses = value.trim().split(",");

    let uniqueAddresses = [...new Set([...addresses])];

    uniqueAddresses = uniqueAddresses.filter(validateAddress);
    if (equal) {
      setWallets(uniqueAddresses);
    } else {
      let finalUniqueAddresses = [...new Set([...wallets.filter(validateAddress), ...uniqueAddresses])];
      setWallets(finalUniqueAddresses);
    }
  };

  const addWalletField = () => {
    const newWallets = [...wallets, ""];
    setWallets(newWallets);
    const newAmounts = [...amounts, ""];
    setAmounts(newAmounts);
  };

  const removeWalletField = index => {
    const newWallets = [...wallets];
    newWallets.splice(index, 1);
    setWallets(newWallets);

    const newAmounts = [...amounts];
    newAmounts.splice(index, 1);
    setAmounts(newAmounts);
  };

  const resetSplitState = () => {
    // !equal ? setWallets([]) : setWallets([""]);
    setAmounts([""]);
    setSingleAmount(0);
    setSendState("Send");
  };

  console.log(network);

  const splitEqually = async () => {
    setSendState("Approving...");
    const signer = await injectedProvider.getSigner(address);
    const contract = new ethers.Contract(contractAddress, ERC20ABI, signer);
    let totalAmount = wallets.length * singleAmount;
    // totalAmount = totalAmount * 10 ** 18;

    try {
      const approveTx = await contract.approve(
        tokenSplitterAddress.toString(),
        ethers.utils.parseUnits(totalAmount.toString(), "ether"),
      );
      notification.info({
        message: "Approving Token Transfer",
        description: `Approving transfer of ${totalAmount} ${tokenName}`,
        placement: "bottomRight",
      });
      await approveTx.wait(1);
      const txhashLink = network.blockExplorer + "tx/" + approveTx.hash;
      console.log(txhashLink);
      notification.success({
        message: "Approve Transaction Success",
        description: `Approved ${totalAmount} ${tokenName} tokens`,
        placement: "bottomRight",
        onClick: () => window.open(txhashLink),
      });
      setSendState("Sending...");
    } catch (error) {
      notification.error({
        message: "Approve Transaction Error",
        description: `Error approving ${totalAmount} ${tokenName} tokens`,
        placement: "bottomRight",
      });
      setSendState("Send");
      return;
    }

    await tx(
      writeContracts.TokenSplitter.splitTokensEqually(
        wallets,
        contractAddress.toString(),
        ethers.utils.parseUnits(singleAmount.toString(), "ether"),
      ),
    );
    getTokenData();
    setSendState("Send");
  };

  const splitUnEqually = async () => {
    for (let i = 0; i < amounts.length; i++) {
      if (amounts[i] == "") {
        notification.warning({
          message: "Please Delete empty slots",
          description: `Delete Empty Slots`,
          placement: "bottomRight",
        });
        return;
      }
    }
    for (let i = 0; i < wallets.length; i++) {
      if (amounts[i] == "") {
        notification.warning({
          message: "Please Delete empty slots",
          description: `Delete Empty Slots`,
          placement: "bottomRight",
        });
        return;
      }
    }

    setSendState("Approving...");
    const signer = await injectedProvider.getSigner(address);
    const contract = new ethers.Contract(contractAddress, ERC20ABI, signer);
    let totalAmount = 0;
    let amountsInWei = [];
    try {
      for (let i = 0; i < amounts.length; i++) {
        totalAmount += parseFloat(amounts[i]);
        amountsInWei.push(ethers.utils.parseUnits(parseFloat(amounts[i]).toString(), "ether"));
      }

      const approveTx = await contract.approve(
        tokenSplitterAddress.toString(),
        ethers.utils.parseUnits(totalAmount.toString(), "ether"),
      );
      // console.log(approveTx);
      notification.info({
        message: "Approving Token Transfer",
        description: `Approving transfer of ${totalAmount} ${tokenName}`,
        placement: "bottomRight",
      });
      await approveTx.wait(1);
      const txhashLink = network.blockExplorer + "tx/" + approveTx.hash;
      // console.log(txhashLink);
      notification.success({
        message: "Approve Transaction Success",
        description: `Approved ${totalAmount} ${tokenName} tokens`,
        placement: "bottomRight",
        onClick: () => window.open(txhashLink),
      });
      setSendState("Sending...");
    } catch (error) {
      notification.error({
        message: "Approve Transaction Error",
        description: `Error approving ${totalAmount} ${tokenName} tokens`,
        placement: "bottomRight",
      });
      setSendState("Send");
      return;
    }

    await tx(writeContracts.TokenSplitter.splitTokensUnEqually(wallets, contractAddress.toString(), amountsInWei));
    getTokenData();
    setSendState("Send");
  };

  useEffect(() => {
    if (contractAddress) getTokenData();
  }, [tokenBalance, address, contractAddress]);

  return (
    <div>
      <div style={{ margin: 32 }}>
        <div
          style={{
            border: "1px solid #cccccc",
            borderRadius: "20px",
            padding: 16,
            width: 400,
            margin: "auto",
            marginTop: 32,
          }}
        >
          <h2>Enter Token Contract</h2>
          <Input
            placeholder="ERC20 contract"
            onChange={e => {
              setContractAddress(e.target.value);
              console.log(contractAddress);
              setLoading(false);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            key="submit"
            type="primary"
            disabled={loading || !contractAddress}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              checkIsContract(contractAddress);
            }}
          >
            Submit
          </Button>
        </div>
      </div>
      {isContract && (
        <div style={{ margin: 32 }}>
          <div style={{ padding: 16, width: 400, margin: "auto", marginTop: 32 }}>
            <h2>
              Token Name: {tokenName}
              <span
                onClick={() => {
                  window.open(network.blockExplorer + "token/" + contractAddress);
                }}
              >
                <BiLinkExternal style={{ cursor: "pointer", paddingTop: 5 }} />
              </span>
            </h2>
            <h3>Balance: {tokenBalance}</h3>
          </div>
          <div
            style={{
              border: "1px solid #cccccc",
              padding: 16,
              maxWidth: 550,
              width: "auto",
              margin: "auto",
              marginTop: 10,
            }}
          >
            <div>
              <Menu defaultSelectedKeys={["1"]} style={{ textAlign: "center", marginTop: 20 }} mode="horizontal">
                <Menu.Item
                  key={"1"}
                  onClick={() => {
                    setEqual(true);
                    setWallets([]);
                    resetSplitState();
                  }}
                >
                  Split Tokens Equally
                </Menu.Item>
                <Menu.Item
                  key={"2"}
                  onClick={() => {
                    setEqual(false);
                    setWallets([""]);
                    resetSplitState();
                  }}
                >
                  Spit Token Unequally
                </Menu.Item>
              </Menu>
            </div>
            {equal && (
              <div style={{ width: 400, paddingTop: 30, margin: "auto" }}>
                <div style={{ marginBottom: 10 }}>
                  <Input.TextArea
                    onChange={val => addMultipleAddress(val.target.value)}
                    placeholder="Unique recipient wallets seperated with a coma only"
                  />
                  {wallets.length > 0 && (
                    <p style={{ textAlign: "right", fontSize: 12 }}>Number of Wallets: {wallets.length} </p>
                  )}
                </div>
                <div style={{ marginBottom: 5 }}>
                  <Input onChange={val => setSingleAmount(val.target.value)} type="number" placeholder="Tokens each" />
                  {wallets.length > 0 && (
                    <p style={{ textAlign: "right", fontSize: 12 }}>Total Tokens: {wallets.length * singleAmount} </p>
                  )}
                </div>
                <Button
                  type="primary"
                  disabled={
                    sendState == "Approving..." ||
                    sendState === "Sending..." ||
                    singleAmount <= 0 ||
                    wallets.length == 0
                  }
                  onClick={() => {
                    splitEqually();
                  }}
                >
                  {sendState}
                </Button>
              </div>
            )}
            {!equal && (
              <div>
                {wallets.map((wallet, index) => (
                  <div key={index} style={{ display: "flex", gap: "1rem", marginTop: 10 }}>
                    <div style={{ width: "90%" }}>
                      <Row>
                        <Col span={19}>
                          <AddressInput
                            autoFocus
                            ensProvider={mainnetProvider}
                            placeholder={"Recipient's address"}
                            value={wallet}
                            onChange={val => updateWallet(val, index)}
                          />
                        </Col>
                        <Col style={{ paddingLeft: 6 }} span={5}>
                          <Input
                            type="number"
                            onChange={val => updateAmounts(val.target.value, index)}
                            placeholder="Amount"
                          />
                        </Col>
                      </Row>
                    </div>
                    {index > 0 && (
                      <Button
                        style={{ padding: "0 0.5rem" }}
                        danger
                        onClick={() => {
                          removeWalletField(index);
                        }}
                      >
                        <DeleteOutlined />
                      </Button>
                    )}
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", width: "90%", marginTop: 10 }}>
                  <Button onClick={addWalletField}>
                    <PlusOutlined />
                  </Button>
                </div>
                <div>
                  <Button
                    type="primary"
                    disabled={
                      sendState == "Approving..." ||
                      sendState == "Sending..." ||
                      wallets.length == 0 ||
                      amounts[0] == "" ||
                      wallets[0] == ""
                    }
                    onClick={() => {
                      splitUnEqually();
                    }}
                  >
                    {sendState}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div
        style={{
          border: "1px solid #cccccc",
          borderRadius: "20px",
          padding: 16,
          width: 400,
          margin: "auto",
          marginTop: 32,
          marginBottom: 64,
        }}
      >
        <h2 style={{ opacity: "0.5" }}>Transaction History</h2>
        <List></List>
      </div>
    </div>
  );
}

export default Home;
