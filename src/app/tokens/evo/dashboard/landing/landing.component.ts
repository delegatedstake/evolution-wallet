import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CryptoService} from '../../../../services/crypto.service';
import {BodyOutputType, Toast, ToasterConfig, ToasterService} from 'angular2-toaster';
import * as ethers from 'ethers';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-landing-evo',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
})
export class EvoLandingComponent implements OnInit {
    importForm: FormGroup;
    privateKey = '';
    config: ToasterConfig;
    errormsg: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private crypto: CryptoService,
        private toaster: ToasterService,
    ) {
      this.importForm = this.fb.group({
        privateKey: ['', Validators.required],
      });
    }

    ngOnInit() {
      if (localStorage.getItem('eth-private-key') !== null) {
        // Adrian (Issue - 11): Private key was imported so redirect to dashboard
        this.router.navigate(['/token/evo/dashboard/wallets/eth']).catch(() => {
          alert('cannot navigate :(');
        });
      }

      // Testing
      /**this.crypto.initEthKeys('0x17c227c16ccfe9bbcb6cb2bc43195ff6c246d0e1').then(() => {
        this.crypto.encryptAndStoreEthKey('').then(() => {
          this.crypto.decryptEthKey().then((result) => {
            console.log(result);
          }).catch((error) => {
            console.log('Error', error);
          });
        }).catch((err) => {
          console.log(err);
        });
      });**/
    }

    importPrivateKey() {
      this.privateKey = this.importForm.get('privateKey').value;

      if(this.privateKey.length != 64) {
        this.importForm.controls['privateKey'].setErrors({'incorrect': true});
        this.errormsg = 'Invalid private key';
        this.showToast('danger', 'Invalid private key.', 'The private key must have a length of 64 alphanumeric characters.');
      } else {
        if (this.privateKey.substring(0, 2) !== '0x') {
          this.privateKey = '0x' + this.privateKey;
        }

        try {
          let wallet = new ethers.Wallet(this.privateKey);
          wallet.provider = new ethers.providers.getDefaultProvider();
          let publicKey = wallet.address;

          // Adrian (): Encrypt and Store key
          this.crypto.initEthKeys(publicKey).then(() => {
            this.crypto.encryptAndStoreEthKey(this.privateKey).then(() => {
              this.showToast('success', 'Private key has been successfully imported.', 'Please save you private key in a safe place.');

              this.importForm.controls['privateKey'].setErrors(null);
              this.errormsg = '';

              localStorage.setItem('eth-public-key', publicKey);

              this.router.navigate(['/token/evo/dashboard/wallet/eth']).catch(() => {
                alert('cannot navigate :(');
              });
            }).catch((err) => {
              console.log(err);
            });
          });
          //localStorage.setItem(key, this.privateKey);
        } catch(error) {
          this.importForm.controls['privateKey'].setErrors({'incorrect': true});
          this.errormsg = 'Invalid private key';
          this.showToast('danger', 'Invalid private key.', 'You entered an invalid private key2.');
        }
      }
    }

    checkKey() {
      let key = this.importForm.get('privateKey').value.toLowerCase();

      if(key.length != 64) {
        this.importForm.controls['privateKey'].setErrors({'incorrect': true});
        this.errormsg = 'Invalid private key';
      } else {
        try {
          let wallet = new ethers.Wallet(key);
          wallet.provider = new ethers.providers.getDefaultProvider(false);
          this.importForm.controls['privateKey'].setErrors(null);
          this.errormsg = 'Invalid private key';
        } catch(error) {
          this.importForm.controls['privateKey'].setErrors({'incorrect': true});
          this.errormsg = 'Invalid private key';
          this.showToast('danger', 'Invalid private key.', 'You entered an invalid private key.');
        }
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
