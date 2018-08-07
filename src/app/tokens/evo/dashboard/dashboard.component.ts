import {Component, OnInit, ViewChild} from '@angular/core';
import {ClrWizard} from '@clr/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BodyOutputType, Toast, ToasterConfig, ToasterService} from 'angular2-toaster';
import * as ethers from 'ethers';
import * as moment from 'moment';
import {createNumberMask} from 'text-mask-addons/dist/textMaskAddons';
import {HttpClient} from '@angular/common/http';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {EthTokensService} from '../../../services/eth-tokens.service';

@Component({
  selector: 'evo-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
//export class EvoDashboardComponent implements OnInit {
export class EvoDashboardComponent {
  transactions: Object;
  transactionCount = 0;
  moment: any;
  symbol: string;
  selectedToken: Object;
  publicAddress: string;
  config: ToasterConfig;
  privateKeyImported: boolean; // Adrian (Issue - 11)

  constructor(private http: HttpClient,
    private fb: FormBuilder,
    private toaster: ToasterService,
    private activeRoute: ActivatedRoute,
    public ethTokens: EthTokensService,
    private router: Router) {

    // Adrian (Issue - 11): Figure out if the user has imported an ETH private key
    this.privateKeyImported = false;
    if (localStorage.getItem('eth-private-key') !== null) {
      this.privateKeyImported = true;
    }

    this.moment = moment;
    this.publicAddress = '';

    this.router.events.subscribe((e: any) => {
      // If the URL paramter is changed this event will be called to re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  //ngOnInit() {
  initializeComponent() {
    //this.symbol = this.activeRoute.snapshot.params.symbol;
    /**
     * activeRoute is only able to access the parent route that called
     * this component and the route used for the child is not accessible.
     * Need to find a concrete solution but below is a quick fix.
     */
    let url = this.router.url.split('/', -1);
    this.symbol = url[url.length - 1];

    for (let key in this.ethTokens.tokens) {
      if(this.ethTokens.tokens[key].symbol.toLowerCase() === this.symbol.toLowerCase()) {
        this.selectedToken = this.ethTokens.tokens[key];
        break;
      }
    }

    let privateKey = localStorage.getItem('eth-private-key');
    if(privateKey === null) {
        this.privateKeyImported = false;
    } else {
      let wallet = new ethers.Wallet(privateKey);
      wallet.provider = ethers.providers.getDefaultProvider();
      this.publicAddress = wallet.address;
      this.privateKeyImported = true;
    }
  }

  selectAccount(idx) {
    console.log(idx);
    //this.aService.select(idx);
  }

  // Adrian (): Changed to a select list and value returned in a different format
  selectAccount2(idx) {
    console.log(idx);
    //this.aService.select(idx.value);
  }

  loadStoredAccounts() {

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
