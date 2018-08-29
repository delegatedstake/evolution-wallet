import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {EOSJSService} from '../../eosjs.service';
import {AccountsService} from '../../accounts.service';
import {VotingService} from '../vote/voting.service';
import {NetworkService} from '../../network.service';
import {CryptoService} from '../../services/crypto.service';
import {BodyOutputType, Toast, ToasterConfig, ToasterService} from 'angular2-toaster';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  endpointModal: boolean;
  logoutModal: boolean;
  confirmModal: boolean;
  pinModal: boolean;
  clearPinModal: boolean;
  changePassModal: boolean;
  createPassModal: boolean;
  passForm: FormGroup;
  passForm2: FormGroup;
  pinForm: FormGroup;
  passmatch: boolean;
  passmatch2: boolean;
  clearContacts: boolean;
  config: ToasterConfig;
  passwordSet: boolean;

  selectedEndpoint = null;

  static resetApp() {
    window['remote']['app']['relaunch']();
    window['remote']['app'].exit(0);
  }

  constructor(private fb: FormBuilder,
              public voteService: VotingService,
              public network: NetworkService,
              private router: Router,
              private eos: EOSJSService,
              private crypto: CryptoService,
              public aService: AccountsService,
              private toaster: ToasterService) {
    this.endpointModal = false;
    this.logoutModal = false;
    this.confirmModal = false;
    this.pinModal = false;
    this.clearPinModal = false;
    this.clearContacts = false;
    this.changePassModal = false;
    this.createPassModal = false;
    this.passForm = this.fb.group({
      oldpass: ['', [Validators.required, Validators.minLength(10)]],
      matchingPassword: this.fb.group({
        pass1: ['', [Validators.required, Validators.minLength(10)]],
        pass2: ['', [Validators.required, Validators.minLength(10)]]
      })
    });
    this.passForm2 = this.fb.group({
      matchingPassword2: this.fb.group({
        pass1: ['', [Validators.required, Validators.minLength(10)]],
        pass2: ['', [Validators.required, Validators.minLength(10)]]
      })
    });
    this.pinForm = this.fb.group({
      pin: ['', Validators.required],
    });

    const saved_hash = localStorage.getItem('evo-hash');
    this.passwordSet = false;
    if(saved_hash !== '' && saved_hash !== null) {
      console.log(saved_hash);
      this.passwordSet = true;
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

  ngOnInit() {
  }

  logout() {
    if (this.clearContacts) {
      localStorage.clear();
    } else {
      const arr = [];
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i) !== 'simpleos.contacts') {
          arr.push(localStorage.key(i));
        }
      }
      arr.forEach((k) => {
        localStorage.removeItem(k);
      });
    }
    ConfigComponent.resetApp();
  }

  selectEndpoint(data) {
    this.selectedEndpoint = data;
    this.confirmModal = true;
  }

  connectEndpoint() {
    this.network.selectedEndpoint.next(this.selectedEndpoint);
    this.network.networkingReady.next(false);
    this.network.startup(null);
    this.confirmModal = false;
  }

  connectCustom(url) {
    this.network.selectedEndpoint.next({url: url, owner: 'Other', latency: 0, filters: []});
    this.network.networkingReady.next(false);
    this.network.startup(url);
    this.endpointModal = false;
  }

  changePass() {
    if (this.passmatch) {
      if(this.crypto.validWalletPassword(this.passForm.value.oldpass)) {
        this.crypto.createWalletPassword(this.passForm.value.matchingPassword.pass2);
        this.showToast('success', 'New Password defined!', '');
        this.passForm.controls['oldpass'].setValue('');
        this.passForm.controls['matchingPassword']['controls'].pass1.setValue('');
        this.passForm.controls['matchingPassword']['controls'].pass2.setValue('');
        this.changePassModal = false;
      } else {
          this.showToast('error', 'Invalid Old Password', '');
      }
    }
  }

  /**
   * Adrian (Issue - 13): Create a new password if one
   * was not yet created.
   */
  createPass() {
    console.log('Doors');
    if (this.passmatch2) {
      console.log(this.passForm2.value.matchingPassword2.pass2)
      // Adrian (): Using the same method used to store pin
      this.crypto.createWalletPassword(this.passForm2.value.matchingPassword2.pass2);
      this.showToast('success', 'New Password defined!', '');
      this.createPassModal = false;
      this.passwordSet = true;
      //ConfigComponent.resetApp();
    }
  }

  passCompare() {
    if (this.passForm.value.matchingPassword.pass1 && this.passForm.value.matchingPassword.pass2) {
      if (this.passForm.value.matchingPassword.pass1 === this.passForm.value.matchingPassword.pass2) {
        this.passForm['controls'].matchingPassword['controls']['pass2'].setErrors(null);
        this.passmatch = true;
      } else {
        this.passForm['controls'].matchingPassword['controls']['pass2'].setErrors({'incorrect': true});
        this.passmatch = false;
      }
    }
  }

  passCompare2() {
    if (this.passForm2.value.matchingPassword2.pass1 && this.passForm2.value.matchingPassword2.pass2) {
      if (this.passForm2.value.matchingPassword2.pass1 === this.passForm2.value.matchingPassword2.pass2) {
        this.passForm2['controls'].matchingPassword2['controls']['pass2'].setErrors(null);
        this.passmatch2 = true;
      } else {
        this.passForm2['controls'].matchingPassword2['controls']['pass2'].setErrors({'incorrect': true});
        this.passmatch2 = false;
      }
    }
  }

  clearPin() {
    this.crypto.removePIN();
    this.clearPinModal = false;
    this.showToast('success', 'Lockscreen PIN removed!', '');
  }

  setPIN() {
    if (this.pinForm.value.pin !== '') {
      if (localStorage.getItem('simpleos-hash')) {
        this.crypto.updatePIN(this.pinForm.value.pin);
      } else {
        this.crypto.createPIN(this.pinForm.value.pin);
      }
      this.showToast('success', 'New Lockscreen PIN defined!', '');
    }
    this.pinModal = false;
  }


}
