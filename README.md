<h1 align="center">
  <br>
  Evolution
  <br>
</h1>
<h3 align="center">
EOS Wallet and Decentralized App Ecosystem
</h3>

[![Build Status](https://travis-ci.com/eos/simpleos.svg?branch=master)](https://travis-ci.com/eosrio/simpleos)

# About

The Evolution Wallet and Decentralized App Store is a cross chain development enviroment for Dapps and tokens to coexist through one intuitive UI.
 
It is a desktop application compatible with the most popular operation systems (Windows, Linux and MacOS). All data is stored locally on your device.

## Warning

Only download Evolution from our [website](https://evolutionos.com/wallet) or [github](https://github.com/EvolutionOS/evolution-wallet). Avoid scams, do not trust any other source.

Evolution doesn't keep any of your information. All information is stored locally, not in any cloud services or databases.

## Main Features
As of 08/25/2018

- Ethereum Wallet and Evolution ERC-20 Token Managment
- Dapp Ecosystem Support
- EOS Wallet
- EOS Token Support

## Security Measures
### Encryption & Local storage only
Your private keys are stored locally only and are properly encrypted with a user defined password of 10+ characters.

## Build it yourself

[Yarn](http://yarnpkg.com/) is [strongly](https://github.com/electron-userland/electron-builder/issues/1147#issuecomment-276284477) recommended instead of npm.

### Dependencies Setup

#### Windows
- [Node.js](https://nodejs.org/en/download/current/)
- [Yarn](https://yarnpkg.com/en/docs/install#windows-stable)

#### Ubuntu
```
# Install Node.js 10
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y build-essential

# Install Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```

#### Fedora / Red Hat®
```
# Install Node.js 10
curl --silent --location https://rpm.nodesource.com/setup_10.x | sudo bash -
sudo yum -y install nodejs
sudo yum install gcc-c++ make

# Install Yarn
curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | sudo tee /etc/yum.repos.d/yarn.repo
sudo yum install yarn
```

#### MacOS
```
# Install brew
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

# Install Node.js 10
brew install node

# Install Yarn
brew install yarn
```

## Setup sources:
```console
git clone https://github.com/EvolutionOS/evolution-wallet.git
cd simpleos
yarn install
yarn run build:prod
```
Create installer:
```
yarn dist
```
The packages will be available on the `/dist` folder.

## Further help

To get more help please contact our team at join@evolutionos.com or at our [Telegram channel](https://t.me/evolutionos).
