/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE CLASS NAME*/
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { commonService } from '../../services/common/common.service';

@Injectable({
    providedIn: 'root'
})
export class authserviceService implements CanActivate {

    constructor(
        private router: Router,
        private session: NSessionStorageService,
        private snackbar: NSnackbarService,
        private common: commonService
    ) {
        this.metaData = this.common.getMetaData('hasAccess');
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let userInfo = this.session.getValue('userInfo');
        this.metaData = this.common.getMetaData();

        if (!userInfo) {
            this.router.navigate(['/login']);
            this.snackbar.openSnackBar("Authenticate your self", 3000);
        } else {
            let userType = userInfo.userRole;

            const curRoute = state.url.split('/')[2] ? state.url.split('/')[2] : state.url.split('/')[1];
            //console.log(this.metaData.hasAccess[userType].indexOf(curRoute));

            if (userInfo.ethicsLeader) {
                this.metaData.hasAccess[userType].push("reviews")
            }
            console.log(curRoute, userType);
            if (this.metaData.hasAccess[userType].indexOf(curRoute) < 0) {
                this.router.navigate(['/noaccess']);
                this.snackbar.openSnackBar("You're not authorised to access page", 3000);
                return false;
            }
            return true;
        } //console.log(this.metaData.hasAccess[userType].indexOf(curRoute));
        return false;
    }

    metaData: any = {};

}
