import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs/Rx';
import {map, startWith} from 'rxjs/operators';
import {createNumberMask} from 'text-mask-addons/dist/textMaskAddons';
import {BodyOutputType, Toast, ToasterConfig, ToasterService} from 'angular2-toaster';
import {CryptoService} from '../../../../services/crypto.service';
import {HttpClient} from '@angular/common/http';
import * as ethers from 'ethers';
import Web3 from 'web3';
import {EthTokensService} from '../../../../services/eth-tokens.service';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'evo-app-send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.css'],
})
export class EvoSendComponent {
  sendForm: FormGroup;
  confirmForm: FormGroup;
  numberMask = createNumberMask({
    prefix: '',
    allowDecimal: true,
    includeThousandsSeparator: false,
    decimalLimit: 8,
  });
  sendModal: boolean;
  errormsg: string;
  adderrormsg: string;
  amounterror: string;
  gasLimitError: string;
  transactionErrorMsg: string;
  config: ToasterConfig;
  fromAccount: string;
  token_balance: number;
  token: string;
  busy: boolean;
  abi: Object;
  contractAddress: string;
  gasPrice: any;
  originalGasPrice: any;
  transactionCost: any;
  wrongpass: string;
  numberOfDecimals: number;
  symbol: string;
  selectedToken: Object;
  publicAddress: string;

  constructor(private fb: FormBuilder,
              private crypto: CryptoService,
              private activeRoute: ActivatedRoute,
              private http: HttpClient,
              private ethTokens: EthTokensService,
              private router: Router,
              private toaster: ToasterService) {
    this.sendForm = this.fb.group({
      to: ['', Validators.required],
      amount: ['', Validators.required],
      gasLimit: [40000, Validators.required],
      showGasLimit: [false]
    });
    this.confirmForm = this.fb.group({
      pass: ['', [Validators.required, Validators.minLength(10)]]
    });
    this.sendModal = false;
    this.fromAccount = '';
    this.busy = false;
    this.errormsg = '';
    this.adderrormsg = '';
    this.amounterror = '';
    this.gasLimitError = '';
    this.transactionErrorMsg = '';
    this.wrongpass = '';

    this.router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.initializeComponent(); // Instead of calling ngOnInit() because need to reload page when parameter changes
      }
    });
  }

  initializeComponent() {
    this.getGasPrice();

    this.symbol = this.activeRoute.snapshot.params.symbol;
    this.abi = this.ethTokens.abi;

    for (let key in this.ethTokens.tokens) {
      if(this.ethTokens.tokens[key].symbol.toLowerCase() === this.symbol.toLowerCase()) {
        this.selectedToken = this.ethTokens.tokens[key];
        this.contractAddress = this.selectedToken['contractAddress'];
        this.numberOfDecimals = this.selectedToken['decimals'];
        break;
      }
    }

    this.getBalance();

    // Adrian (): Need to check if the '0x' was added via the import and if not add it
    /**let privateKey = localStorage.getItem('eth-private-key');
    if(privateKey.substring(0, 2) !== '0x') {
      privateKey = "0x" + privateKey;
    }

    let wallet = new ethers.Wallet(privateKey);
    this.fromAccount = wallet.address; // This is the public key

    wallet.provider = ethers.providers.getDefaultProvider('ropsten');
    //wallet.provider = ethers.providers.getDefaultProvider();

    if(this.symbol.toLowerCase() == 'eth') {
      wallet.getBalance().then((balance) => {
        this.token_balance = ethers.utils.formatEther(balance);
      });
    } else {
      let contract = new ethers.Contract(this.contractAddress, this.abi, wallet.provider);
      contract.balanceOf(this.fromAccount).then((balance) => {
        this.token_balance = this.getValueTransaction(balance);
      }).catch((e) => {
        this.showToast('danger', 'Unable to retrieve Account Balance!', e.message);
      });
    }**/
  }

  getBalance() {
    // Adrian (): Need to check if the '0x' was added via the import and if not add it
    let privateKey = localStorage.getItem('eth-private-key');
    if(privateKey.substring(0, 2) !== '0x') {
      privateKey = "0x" + privateKey;
    }

    let wallet = new ethers.Wallet(privateKey);
    this.fromAccount = wallet.address; // This is the public key

    //wallet.provider = ethers.providers.getDefaultProvider('ropsten');
    wallet.provider = ethers.providers.getDefaultProvider();

    if(this.symbol.toLowerCase() == 'eth') {
      wallet.getBalance().then((balance) => {
        this.token_balance = ethers.utils.formatEther(balance);
      });
    } else {
      let contract = new ethers.Contract(this.contractAddress, this.abi, wallet.provider);
      contract.balanceOf(this.fromAccount).then((balance) => {
        this.token_balance = this.getValueTransaction(balance);
      }).catch((e) => {
        this.showToast('danger', 'Unable to retrieve Account Balance!', e.message);
      });
    }
  }

  getValueTransaction(value) {
    return ethers.utils.formatEther(value, { commify: false });
  }

  getGasPrice() {
    this.busy = true;
    this.http.get('https://api.etherscan.io/api?module=proxy&action=eth_gasPrice').subscribe((result: any) => {
      this.originalGasPrice = result.result;
      this.gasPrice = this.originalGasPrice * 1;
      this.transactionCost = this.calculateTransacctionCost();
      this.busy = false;
    },
    err => {
      this.showToast('danger', 'Unable to retrieve Gas Price!', err.message);
    });
  }

  calculateTransacctionCost() {
    const gasLimit = this.sendForm.get('gasLimit').value;
    return ethers.utils.formatEther(this.originalGasPrice * gasLimit);
  }

  setMax() {
    this.sendForm.patchValue({
      amount: this.token_balance
    });
  }

  /**
   * Check if the address is a valid one
   */
  checkAddress() {
    try {
        const to = this.sendForm.get('to').value.toLowerCase();
        ethers.utils.getAddress(to);
        this.sendForm.controls['to'].setErrors(null);
        this.errormsg = '';
    } catch (error) {
        this.sendForm.controls['to'].setErrors({'incorrect': true});
        this.errormsg = 'Invalid address';
    }

    return true;
  }

  checkAmount() {
    if (parseFloat(this.sendForm.value.amount) === 0 || this.sendForm.value.amount === '') {
      this.sendForm.controls['amount'].setErrors({'incorrect': true});
      this.amounterror = 'invalid amount';
      return false;
    } else {
      const max = this.token_balance;
      if (parseFloat(this.sendForm.value.amount) > max) {
        this.sendForm.controls['amount'].setErrors({'incorrect': true});
        this.amounterror = 'invalid amount';
        return false;
      } else {
        this.sendForm.controls['amount'].setErrors(null);
        this.amounterror = '';
      }
    }

    return true;
  }

  checkGasLimit() {
    if (parseFloat(this.sendForm.value.gasLimit) <= 0 || this.sendForm.value.gasLimit === '') {
      this.sendForm.controls['gasLimit'].setErrors({'incorrect': true});
      this.gasLimitError = 'invalid amount';
      return false;
    } else {
        this.sendForm.controls['gasLimit'].setErrors(null);
        this.gasLimitError = '';
    }

    // Update transaction cost calculation
    this.transactionCost = this.calculateTransacctionCost();

    return true;
  }

  openSendModal() {
    //this.fromAccount = this.aService.selected.getValue().name;
    this.sendModal = true;
  }

  transfer() {
    this.busy = true;

    const to = this.sendForm.get('to').value.toLowerCase();
    const amount = this.sendForm.get('amount').value;
    const gasLimit = this.sendForm.get('gasLimit').value;

    let privateKey = localStorage.getItem('eth-private-key');
    if(privateKey.substring(0, 2) !== '0x') {
      privateKey = "0x" + privateKey;
    }
    let wallet = new ethers.Wallet(privateKey);
    //wallet.provider = ethers.providers.getDefaultProvider('ropsten');
    wallet.provider = ethers.providers.getDefaultProvider();

    // Send tokens
    if(this.symbol.toLowerCase() === 'eth') {
      console.log('Send ETH');
      let transaction = {
        // Gas Limit; 21000 will send ether to another use, but to execute contracts
        // larger limits are required. The provider.estimateGas can be used for this.
        gasLimit: gasLimit,
        // Recommendations: omit gasPrice; the provider will query the network
        gasPrice: this.gasPrice,
        // Required; unless deploying a contract (in which case omit)
        to: to,
        // Optional
        //data: "0x",
        value: ethers.utils.parseEther(amount),
      };

      // Send the transaction
      wallet.sendTransaction(transaction).then(transactionHash => {
        console.log(transactionHash);
        this.showToast('success', 'Your transaction was sent successfully!', 'Transaction with hash code: ' + transactionHash.hash
 + ' was created.');
        this.sendForm.controls['to'].setValue('');
        this.sendForm.controls['amount'].setValue('');
        // Adrian (): Do a setTimeout to redirect to the History page
        this.busy = false;
        this.sendModal = false;
        this.getBalance();
      }).catch((e) => {
        // Show the error message
        this.showToast('danger', 'An error occured when sending the transaction!', e.message);
        this.transactionErrorMsg = e.message;
        this.busy = false;
        this.sendModal = false;
      });
    } else {
      let contract = new ethers.Contract(this.contractAddress, this.abi, wallet);
      let numberOfTokens = ethers.utils.parseUnits(amount, this.numberOfDecimals);

      let options = {
        gasPrice: this.gasPrice,
        gasLimit: gasLimit
      };

      contract.transfer(to, numberOfTokens, options).then(tx => {
        console.log(tx);
        this.showToast('success', 'Your transaction was sent successfully!', 'Transaction with hash code: ' + tx.hash + ' was created.');
        // Adrian (): Do a setTimeout to redirect to the History page
        this.sendForm.controls['to'].setValue('');
        this.sendForm.controls['amount'].setValue('');
        this.busy = false;
        this.sendModal = false;
        this.getBalance();
      }).catch((e) => {
        console.log(e);
        // Show the error message
        this.showToast('danger', 'An error occured when sending the transaction!', e.message);
        this.transactionErrorMsg = e.message;
        this.busy = false;
        this.sendModal = false;
      });
    }
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
