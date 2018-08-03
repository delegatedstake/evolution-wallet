import {Injectable} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class EthTokensService {

  tokens: Object;
  abi: Object;
  selectedToken: Object;
  symbol: string;

  constructor(private activeRoute: ActivatedRoute) {
    this.tokens = [
      {symbol: 'ETH', decimals: 18, contractAddress: '', logo: 'eth_logo.png'},
      {symbol: 'EVO', decimals: 18, contractAddress: '0xefbd6d7def37ffae990503ecdb1291b2f7e38788', logo: 'evo_logo.png'},
    ];

    this.abi = [
      {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{
          "name": "",
          "type": "string"
         }],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{
            "name": "",
            "type": "uint8"
        }],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [{
          "name": "_owner",
          "type": "address"
        }],
        "name": "balanceOf",
        "outputs": [{
          "name": "balance",
          "type": "uint256"
        }],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{
          "name": "",
          "type": "string"
        }],
        "payable": false,
        "type": "function"
      }
    ];
  }

  /**
  initialize() {
      this.symbol = this.activeRoute.snapshot.params.symbol;
      console.log('This is symbol: ' + this.symbol);

      for (let key in this.tokens) {
        console.log(key + " = " + this.tokens[key].symbol);
        console.log(this.symbol);
        if(this.tokens[key].symbol.toLowerCase() === this.symbol.toLowerCase()) {
          console.log(key + " = " + this.tokens[key]);
          break;
        }
      }
  }
  **/

  getTokens() {
    return this.tokens;
  }

  getAbi() {
    return this.abi;
  }

}
