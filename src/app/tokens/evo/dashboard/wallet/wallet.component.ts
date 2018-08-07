import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {EthTokensService} from '../../../../services/eth-tokens.service';
import {BodyOutputType, Toast, ToasterConfig, ToasterService} from 'angular2-toaster';

import * as moment from 'moment';
import * as ethers from 'ethers';

@Component({
  selector: 'evo-app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class EvoWalletComponent {
  transactions: Object;
  transactionCount = 0;
  moment: any;
  symbol: string;
  selectedToken: Object;
  publicAddress: string;
  config: ToasterConfig;
  busy: boolean;

  constructor(private router: Router,
    private ethTokens: EthTokensService,
    private toaster: ToasterService,
    private http: HttpClient,
    private activeRoute: ActivatedRoute) {

    if (localStorage.getItem('eth-private-key') === null) {
      // Adrian (Issue - 11): Private key not yet imported
      this.router.navigate(['/token/evo/dashboard/landing']).catch(() => {
        alert('cannot navigate :(');
      });
    }

    this.moment = moment;
    this.busy = false;

    this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.transactions = [];
        this.initializeComponent();
      }
    });
  }

  initializeComponent() {
    this.symbol = this.activeRoute.snapshot.params.symbol;

    for (let key in this.ethTokens.tokens) {
      if(this.ethTokens.tokens[key].symbol.toLowerCase() === this.symbol.toLowerCase()) {
        this.selectedToken = this.ethTokens.tokens[key];
        break;
      }
    }

    let privateKey = localStorage.getItem('eth-private-key');
    if(privateKey !== null) {
      if(privateKey.substring(0, 2) !== '0x') {
        privateKey = "0x" + privateKey;
      }
      let wallet = new ethers.Wallet(privateKey);
      this.publicAddress = wallet.address;

      this.getTransactionsHistory();
    }
  }

  /**
   * Get a list of all transactions linked to an address
   * https://etherscan.io/apis#accounts
   */
  getTransactionsHistory() {
    this.busy = true;
    if(this.symbol.toLowerCase() == 'eth') {
      this.http.get('http://api.etherscan.io/api?module=account&action=txlist&address=' + this.publicAddress + '&startblock=0&endblock=999999999&sort=desc').subscribe((result: any) => {
        this.transactions = result.result;
        this.transactionCount = result.result.length;
        this.busy = false;
      },
      err => {
        this.showToast('danger', 'Unable to retrieve Transaction History!', err.message);
        this.busy = false;
      });
    } else {
      //this.http.get('http://api.etherscan.io/api?module=account&action=txlist&token=' + token + '&address=' + publicAddress + '&startblock=0&endblock=9999999999999&sort=desc').subscribe((result: any) => {
      this.http.get('http://api.etherscan.io/api?module=account&action=tokentx&contractaddress=' + this.selectedToken['contractAddress'] + '&address=' + this.publicAddress + '&startblock=0&endblock=999999999&sort=desc').subscribe((result: any) => {
        this.transactions = result.result;
        this.transactionCount = result.result.length;
        this.busy = false;
      },
      err => {
        this.showToast('danger', 'Unable to retrieve Transaction History!', err.message);
        this.busy = false;
      });
    }
  }

  getValueTransaction(value) {
    return ethers.utils.formatEther(value, { commify: true });
  }

  private showToast(type: string, title: string, body: string) {
    this.config = new ToasterConfig({
      positionClass: 'toast-top-right',
      timeout: 10000,
      newestOnTop: true,
      tapToDismiss: true,
      preventDuplicates: false,
      animation: 'slideDown',
      limit: 1,
    });
    const toast: Toast = {
      type: type,
      title: title,
      body: body,
      timeout: 10000,
      showCloseButton: true,
      bodyOutputType: BodyOutputType.TrustedHtml,
    };
    this.toaster.popAsync(toast);
  }

}
