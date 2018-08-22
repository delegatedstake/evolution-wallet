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
      // Adrian (): Rposten EVO contract address
      //{symbol: 'EVO', decimals: 18, contractAddress: '0x0726d8f4c24410d22bf1fcf8cbe58d2e8d24164d', logo: 'evo_logo.png'},
      {symbol: 'PRA', decimals: 18, contractAddress: '0x9041fe5b3fdea0f5e4afdc17e75180738d877a01', logo: 'prochain_logo.png'},
    ];

    // The ERC-20 ABI
    this.abi = [
      "function balanceOf(address owner) view returns (uint)",
      "function transfer(address to, uint amount)",
      "event Transfer(address indexed from, address indexed to, uint amount)"
    ];
  }

  getTokens() {
    return this.tokens;
  }

  getAbi() {
    return this.abi;
  }

}
