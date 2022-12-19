import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/common/appStateService';
import { TEXTS } from '../../shared/constants/common';
import { IUser } from '../../shared/model/IUser';

@Component({
  selector: 'conduit-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  providers: [AuthService]
})
export class AuthComponent implements OnInit, OnDestroy {
  public pageType = '';
  public title = '';
  public submitText = '';
  public switchQuestion = '';
  public userEmail = '';
  public userPassword = '';
  public username = '';
  public authErr = '';
  public authSuccessText = '';

  private routeSubscription: Subscription = new Subscription();
  // private getUserSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private appStateService: AppStateService,
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.url.subscribe(urlSegment => {
      this.pageType = urlSegment[urlSegment.length - 1].path;
      this.title, this.submitText = this.pageType;
      this.switchQuestion = this.pageType === 'login' ? 'Need an account?' : 'Have an account?';
    });
  }

  public onSubmit() {
    if (this.pageType === 'login') {
      this.login();
    } else if (this.pageType === 'register') {
      this.register();
    }
  }

  private register() {
    if (this.username?.trim() && this.userEmail?.trim().length && this.userPassword?.trim().length) {
      this.authService
        .register(this.username, this.userEmail, this.userPassword)
        .subscribe((response) => {
          if (response.errors) {
            this.authErr = response.errors[0].message;
          }

          this.authSuccessText = TEXTS.AuthSuccessText;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        });
    }
  }

  private login() {
    if (this.userEmail?.trim().length && this.userPassword?.trim().length) {
      this.appStateService.resetUser();
      this.authService
        .login(this.userEmail, this.userPassword)
        .subscribe((response) => {
          if (response.errors) {
            this.authErr = response.errors[0].message;
          }

          if (response.data) {
            this.authErr = '';
            const data = response.data;
            const dataObj = Object(data);
            const access_token = dataObj.loginUser.token;
            this.appStateService.setUserToken(access_token);
            const userInfo: IUser = {
              email: dataObj.loginUser.email,
              username: dataObj.loginUser.username,
              password: this.userPassword,
              bio: dataObj.loginUser.bio,
              image: dataObj.loginUser.image
            };
            this.appStateService.setCurrentUser(userInfo);
            this.router.navigate(['/']);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}

export interface IData {
  loginUser: any;
}
