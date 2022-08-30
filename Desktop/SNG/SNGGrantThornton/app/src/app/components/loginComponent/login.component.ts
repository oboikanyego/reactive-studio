/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService, NLoginService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';
import { userService } from '../../services/user/user.service';
import { commonService } from '../../services/common/common.service';

@Component({
    selector: 'bh-login',
    templateUrl: './login.template.html'
})

export class loginComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    loginForm: FormGroup;
    loading;
    userInfo;

    constructor(private bdms: NDataModelService,
        private formBuilder: FormBuilder,
        private snackbar: NSnackbarService,
        private user: userService,
        private adalSvc: MsAdalAngular6Service,
        private common: commonService,
        private loginSer: NLoginService,
        private session: NSessionStorageService) {
        super();
        this.mm = new ModelMethods(bdms);

        this.loginForm = formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required,]]
        });
    }

    ngOnInit() {
        this.userInfo = this.adalSvc;

        if (this.userInfo.LoggedInUserEmail && this.userInfo.isAuthenticated) {
            this.get('registeredusers', { email: this.userInfo.LoggedInUserEmail.toLowerCase(), is_active: true }, { '_id': 0 });
        } else {
            this.user.logoutUser();
        }
    }

    loginUser() {
        if (this.loginForm.valid) {
            this.loading = true;
            this.loginSer.login(this.loginForm.value.email, this.loginForm.value.password, false).subscribe(res => {
                
                this.userInfo = this.user.checkUser();
                if (this.userInfo) {
                    this.get('registeredusers', { email: this.userInfo.username, is_active: true }, { '_id': 0 });
                }
            }, err => {
                this.loading = false;
                this.snackbar.openSnackBar(err.error, '2000');
            });
        } else {
            this.snackbar.openSnackBar('Please enter valid Credentials', '2000');
        }
    }

    autoRegisterUser() {
        let userNameArr = this.userInfo.LoggedInUserName.split(' ');
        let userObj = {
            email: this.userInfo.LoggedInUserEmail,
            displayName: this.userInfo.LoggedInUserName,
            firstName: userNameArr[0],
            lastName: userNameArr[1],
            is_active: true,
            userRole: 'user'
        }
        console.log(this.userInfo, userObj);
        /*this.user.registerUser(userObj).subscribe( res => {
                this.dialog.close();
                this.loading = false;
                //console.log(urlRole, this.userForm);
                this.snackBar.openSnackBar('User registered successfully','2000');
                this.common.navigate({path:'/home/users/'+urlRole});
            }, error => {          
                this.loading = false;      
                this.snackBar.openSnackBar(error.error,'2000');
            });*/
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.loading = false;
                if (result.length > 0) { 
                    this.session.setValue('userInfo', JSON.stringify(result[0]));

                    if (result[0].userRole == 'admin') {
                        this.common.navigate({ path: '/home/dashboard' });
                    } else {
                        this.common.navigate({ path: '/home/dash' });
                    }
                    this.snackbar.openSnackBar('You logged in successfully', '3000');
                } else {
                    //this.common.navigate();
                    this.common.navigate({ path: '/noaccess' });
                    //this.user.logoutUser();
                    
                    //this.autoRegisterUser();
                    this.snackbar.openSnackBar('You are not authorised to access', '3000');
                }
            },
            error => {
                // Handle errors here
            });
    }
}
