import {Component, OnInit} from '@angular/core';
import {CryptoService} from '../services/crypto.service';
import {Router} from '@angular/router';
import {NetworkService} from '../network.service';
import {EOSJSService} from '../eosjs.service';

@Component({
    selector: 'app-lockscreen',
    templateUrl: './lockscreen.component.html',
    styleUrls: ['./lockscreen.component.css']
})
export class LockscreenComponent implements OnInit {

    pin = '';
    nAttempts = 5;
    wrongpass = false;
    logoutModal: boolean;
    clearContacts: boolean;
    anim: any;
    lottieConfig: Object;

    static resetApp() {
        window['remote']['app']['relaunch']();
        window['remote']['app'].exit(0);
    }

    constructor(private crypto: CryptoService,
        public eos: EOSJSService,
        private router: Router,
        private network: NetworkService) {
        this.logoutModal = false;
        this.clearContacts = false;
        this.lottieConfig = {
            path: 'assets/logoanim.json',
            autoplay: true,
            loop: false
        };
    }

    ngOnInit() {
        const chain_id = this.eos.chainID;
        console.log('Chain ID: ' + chain_id);
        console.log('EOS Keys: ' + localStorage.getItem('eos_keys.' + chain_id));
        if (localStorage.getItem('eos_keys.' + chain_id) === null) {
            // Adrian (Issue - 11): Change redirect to new EOS Landing page
            this.router.navigate(['/dashboard/landing']).catch(() => {
                alert('cannot navigate :(');
            });
        }
    }

    handleAnimation(anim: any) {
        this.anim = anim;
        this.anim['setSpeed'](0.8);
    }

    unlock() {
        let target = ['dashboard/landing']; // Adrian (11): Redirect to this landing page
        if (this.network.networkingReady.getValue()) {
            target = ['dashboard', 'wallet'];
        }
        if (!this.crypto.unlock(this.pin, target)) {
            this.wrongpass = true;
            this.nAttempts--;
            if (this.nAttempts === 0) {
                localStorage.clear();
                LockscreenComponent.resetApp();
            }
        }
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
        LockscreenComponent.resetApp();
    }

}
