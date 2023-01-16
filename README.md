# ➗ Token-Splitter

> Built with sacfold-Eth

🧪 Token Splitter allows for sharing of ERC20 tokens amongst multiple wallets. It offers two options of sharing tokens equally or unequally

visit [token.splitter.surge.sh](https://token.splitter.surge.sh) to try it out.

![Screenshot_577](https://user-images.githubusercontent.com/86206128/212751569-16f03505-5b01-401d-8444-02e1f820c425.png)



# 🏄‍♂️ Code Quick Start


> 1️⃣ clone/fork 🏗 token-splitter:

```bash
git clone https://github.com/Avelous/Token-Splitter.git
```

> 2️⃣ install Packages

```bash
cd token-splitter
yarn install
```

> 3️⃣ in a second terminal window, start your 📱 frontend:

🚨 if your contracts are not deployed to localhost, you will need to update the default network in `App.jsx` to match your default network in `hardhat-config.js`.

```bash
cd token-splitter
yarn start
```

> 4️⃣ in a third terminal window, 🛰 deploy your contract:

🚨 if you are not deploying to localhost, you will need to run `yarn generate` (using node v16.x) first and then fund the deployer account. To view account balances, run `yarn account`. You will aslo need to update `hardhat-config.js` with the correct default network.

```bash
cd scaffold-eth
yarn deploy
```

📱 Open http://localhost:3000 to see the app

# 📝 To-do

1. Store and render transaction history for each user wallet in localStorage
2. Improve Website UX
3. Possibly Implement superfluid streaming
4. more...


# 📚 Visit Scaffold-Eth

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

