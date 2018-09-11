import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {AccountsService} from '../../accounts.service';
import {EOSJSService} from '../../eosjs.service';
import {Router} from '@angular/router';

import * as moment from 'moment';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit, AfterViewInit, OnDestroy {
  fullBalance: number;
  staked: number;
  unstaked: number;
  moment: any;
  openTX = WalletComponent.openTXID;
  actions: any[];
  headBlock: number;
  LIB: number;
  blockTracker: any;
  tokens: any[];

  static openTXID(value) {
    window['shell']['openExternal']('https://eosflare.io/tx/' + value);
  }

  constructor(public aService: AccountsService, public eos: EOSJSService, private router: Router,) {
    this.moment = moment;
    this.actions = [];
    this.tokens = [];
    this.headBlock = 0;
    this.fullBalance = 0;
    this.staked = 0;
    this.unstaked = 0;
    this.LIB = 0;
    this.blockTracker = null;
  }

  getInfo() {
    this.eos['eos']['getInfo']({}).then((info) => {
      this.headBlock = info['head_block_num'];
      this.LIB = info['last_irreversible_block_num'];
    });
  }

  ngOnInit() {
    // Adrian (Issue - 11): Change redirect to new EOS Landing page if private key is not imported
    const chain_id = this.eos.chainID;
    //console.log('Chain ID 4: ' + this.eos);
    //console.log('EOS Keys 4: ' + localStorage.getItem('eos_keys.' + chain_id));
    if (localStorage.getItem('eos_keys.' + chain_id) === null) {
      /**this.router.navigate(['dashboard/landing']).catch(() => {
        alert('cannot navigate :(');
      });**/
    }

    this.aService.lastUpdate.asObservable().subscribe(value => {
      if (value.account === this.aService.selected.getValue().name) {
        this.updateBalances();
      }
    });
    this.getInfo();
    if (!this.blockTracker) {
      this.blockTracker = setInterval(() => {
        this.getInfo();
      }, 5000);
    }
  }

  ngOnDestroy() {
    if (this.blockTracker) {
      clearInterval(this.blockTracker);
      this.blockTracker = null;
    }
  }

  ngAfterViewInit() {
    this.aService.selected.asObservable().subscribe((sel) => {
      if (sel['name']) {
        setImmediate(() => {
          this.fullBalance = sel.full_balance;
          this.staked = sel.staked;
          this.unstaked = sel.full_balance - sel.staked;
          this.tokens = [];
          this.aService.reloadActions(sel.name);
          this.aService.refreshFromChain();
        });
      }
    });
  }

  updateBalances() {
    const sel = this.aService.selected.getValue();
    this.fullBalance = sel.full_balance;
    this.staked = sel.staked;
    this.unstaked = sel.full_balance - sel.staked;
  }

  refresh() {
    this.aService.reloadActions(this.aService.selected.getValue().name);
    this.aService.refreshFromChain();
  }

}
