import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LandingComponent} from './landing/landing.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {WalletComponent} from './dashboard/wallet/wallet.component';
import {HistoryComponent} from './dashboard/history/history.component';
import {VoteComponent} from './dashboard/vote/vote.component';
import {SendComponent} from './dashboard/send/send.component';
import {ConfigComponent} from './dashboard/config/config.component';
import {AboutComponent} from './dashboard/about/about.component';
import {LockscreenComponent} from './lockscreen/lockscreen.component';
import {LockGuard} from './lock.guard';
import {RamMarketComponent} from './dashboard/ram-market/ram-market.component';
import {EvoDashboardComponent} from './tokens/evo/dashboard/dashboard.component'; // Adrian ()
import {EosLandingComponent} from './dashboard/landing/landing.component'; // Adrian (Issue - 11)
import {EvoLandingComponent} from './tokens/evo/dashboard/landing/landing.component'; // Adrian (Issue - 11)
import {EvoWalletComponent} from './tokens/evo/dashboard/wallet/wallet.component'; // Adrian (Issue - 11)
import {EvoSendComponent} from './tokens/evo/dashboard/send/send.component'; // Adrian (Issue - 11)

const routes: Routes = [
  {
    path: '',
    component: LockscreenComponent
  },
  {
    path: 'landing',
    component: LandingComponent,
    canActivate: [LockGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [LockGuard],
    children: [
      // Adrian (Issue - 11): New Landing page for EOS
      {
        path: 'landing',
        component: EosLandingComponent,
      },
      {
        path: 'wallet',
        component: WalletComponent,
      },
      {
        path: 'send',
        component: SendComponent,
      },
      {
        path: 'history',
        component: HistoryComponent,
      },
      {
        path: 'vote',
        component: VoteComponent,
      },
      {
        path: 'config',
        component: ConfigComponent,
      },
      {
        path: 'ram',
        component: RamMarketComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      }
    ],
    runGuardsAndResolvers: 'always'
  },
  // Adrian ()
  {
    path: 'token/evo/dashboard',
    component: EvoDashboardComponent,
    canActivate: [LockGuard],
    children: [
      {
        path: 'landing',
        component: EvoLandingComponent,
      },
      {
        path: 'wallet/:symbol',
        component: EvoWalletComponent,
      },
      {
        path: 'send/:symbol',
        component: EvoSendComponent,
      },
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true, onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
