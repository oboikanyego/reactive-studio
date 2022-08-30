/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, HostListener, ViewChild, ChangeDetectorRef } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService, NHTTPLoaderService  } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatSidenav } from '@angular/material/sidenav';

import { Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

import { userService } from '../../services/user/user.service';
import { commonService } from '../../services/common/common.service';

@Component({
    selector: 'bh-home',
    templateUrl: './home.template.html'
})

export class homeComponent extends NBaseComponent implements OnInit {
    @ViewChild('sidenav', {static: false}) sidenav: MatSidenav;

    mm: ModelMethods;
    userType;
    userInfo;
    screenHeight:any;
    screenWidth:any;
    sideNavMode = 'side';
    pageURL;
    loading;
    idleTimeOutInterval;
    timeOutInterval;
    /*   If idle timeout as 10. Please give 1000 * 60 * 5. 
    else if idel timeout as 20. Please give 1000 * 60 * 10. */
    idleTimeout = 1000 * 60 * 5;
    metaData: any = {};
    showSidenavSublink;

    constructor(private bdms: NDataModelService,
                private user: userService,
                private common: commonService,
                private session: NSessionStorageService,
                private router: Router,
                private snackbar: NSnackbarService,
                private httpLoader: NHTTPLoaderService,
                 private cdrf: ChangeDetectorRef) {
        super();
        this.mm = new ModelMethods(bdms);        
    }

    @HostListener('window:resize', ['$event'])
    getScreenSize(event?) {
        this.screenHeight = window.innerHeight;
        this.screenWidth = window.innerWidth;
        
        this.sideNavMode = this.screenWidth > 850 ? 'side' : 'over';
        if(['reports', 'schedules'].indexOf(this.pageURL.split('/')[2]) >= 0){
            //this.sideNavMode = 'over';
        }
    }

    
    @HostListener('click')
    @HostListener('keyup')
    clickedOnSomething() {
        //clearTimeout(this.timeOutInterval);
        //clearTimeout(this.idleTimeOutInterval);
        this.startTimeout();
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');
        this.userType = this.userInfo.userRole;
        this.pageURL = this.router.url;

        this.showSidenavSublink = this.common.showSublink

        this.metaData = this.common.getMetaData();
        this.router.events.subscribe((val) => {
            if(val instanceof NavigationEnd) {
                //console.log(val);
                this.pageURL = val.url
                this.getScreenSize();
            }
        });
        
        if(this.userInfo.ethicsLeader || this.userInfo.userRole == 'admin'){
            this.metaData.menuLinks[this.userType].push({linkTitle: 'Reviews', icon: 'storage', url: '/home/reviews'});
        }

        this.common.menuToggleChange.subscribe(val => { 
            //if (val) this.sideNavMode = ''; 
            //else this.sideNavMode = 'side';
            //this.sidenav.toggle();
        });
        this.showHideSubMenu(this.pageURL)
        //this.startTimeout();
    }

    showHideSubMenu(obj :any) {
        if(obj.linkTitle){//for when the menu is selected
        this.metaData.menuLinks[this.userType].forEach( item => item.url==obj.url ? item.showSubmenu=!item.showSubmenu : item.showSubmenu=false)}
        else{//for when the website just refreshed
            this.metaData.menuLinks[this.userType].forEach( item => {
                let val;
                if(item?.subLinks){
                 val=item?.subLinks?.filter( item => item.url==this.pageURL);
                }
            if(val?.length==1){
            item.showSubmenu=!item.showSubmenu
            }
            })
            }
        
    }

    openCloseSublinkReports(){
        
        this.showSidenavSublink = !this.showSidenavSublink
    }

    ngAfterViewInit(){
        this.httpLoader._isHTTPRequestInProgress$.subscribe(res => {
            this.loading = res;
            this.cdrf.detectChanges();
        });
    }

    startTimeout() {
        //console.log('Idle Timeout started', this.idleTimeout);
        this.timeOutInterval = setTimeout(() => {
            //this.currentTime = this.currentTime + 10;
            this.startIdleTimeout();
        }, this.idleTimeout);
    }



    startIdleTimeout(){
        //console.log('Idle Timeout executed', this.idleTimeout);
        this.idleTimeOutInterval = setTimeout(() => {
            //this.currentTime = this.currentTime + 10;
            //console.log('Loggingout the user');
            //this.logoutUser();
        }, this.idleTimeout);
    }

    logoutUser(){
        this.user.logoutUser();
        //this.common.navigate();
    }

    userProfile() {
        this.common.openModal('userProfile', { 'mode': 'userProfile', 'title': 'User details' });
    }
}
