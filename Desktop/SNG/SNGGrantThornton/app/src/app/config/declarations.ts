import { NeutrinosAuthGuardService } from 'neutrinos-oauth-client';
import { PageNotFoundComponent } from '../not-found.component';
import { LayoutComponent } from '../layout/layout.component';
import { ImgSrcDirective } from '../directives/imgSrc.directive';
import { APP_INITIALIZER } from '@angular/core';
import { NDataSourceService } from '../n-services/n-dataSorce.service';
import { environment } from '../../environments/environment';
import { NMapComponent } from '../n-components/nMapComponent/n-map.component';
import { NLocaleResource } from '../n-services/n-localeResources.service';
import { NAuthGuardService } from 'neutrinos-seed-services';
import { ArtImgSrcDirective } from '../directives/artImgSrc.directive';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';

window['neutrinos'] = {
  environments: environment
}

//CORE_REFERENCE_IMPORTS
//CORE_REFERENCE_IMPORT-cpdquarterreportComponent
import { cpdquarterreportComponent } from '../components/cpdquarterreportComponent/cpdquarterreport.component';
//CORE_REFERENCE_IMPORT-aidfilesreportComponent
import { aidfilesreportComponent } from '../components/aidfilesreportComponent/aidfilesreport.component';
//CORE_REFERENCE_IMPORT-cpddeclarationComponent
import { cpddeclarationComponent } from '../components/cpddeclarationComponent/cpddeclaration.component';
//CORE_REFERENCE_IMPORT-cpdlistComponent
import { cpdlistComponent } from '../components/cpdlistComponent/cpdlist.component';
//CORE_REFERENCE_IMPORT-uploadscheduleComponent
import { uploadscheduleComponent } from '../components/uploadscheduleComponent/uploadschedule.component';
//CORE_REFERENCE_IMPORT-aidreportComponent
import { aidreportComponent } from '../components/aidreportComponent/aidreport.component';
//CORE_REFERENCE_IMPORT-dashboardnewComponent
import { dashboardnewComponent } from '../components/dashboardnewComponent/dashboardnew.component';
//CORE_REFERENCE_IMPORT-quarterselectionComponent
import { quarterselectionComponent } from '../components/quarterselectionComponent/quarterselection.component';
//CORE_REFERENCE_IMPORT-aidsdownloadComponent
import { aidsdownloadComponent } from '../components/aidsdownloadComponent/aidsdownload.component';
//CORE_REFERENCE_IMPORT-jsonextractComponent
import { jsonextractComponent } from '../components/jsonextractComponent/jsonextract.component';
//CORE_REFERENCE_IMPORT-nominatepageComponent
import { nominatepageComponent } from '../components/nominatepageComponent/nominatepage.component';
//CORE_REFERENCE_IMPORT-assignpageComponent
import { assignpageComponent } from '../components/assignpageComponent/assignpage.component';
//CORE_REFERENCE_IMPORT-guidelinestabComponent
import { guidelinestabComponent } from '../components/guidelinestabComponent/guidelinestab.component';
//CORE_REFERENCE_IMPORT-listtableComponent
import { listtableComponent } from '../components/listtableComponent/listtable.component';
//CORE_REFERENCE_IMPORT-consolidatereportComponent
import { consolidatereportComponent } from '../components/consolidatereportComponent/consolidatereport.component';
//CORE_REFERENCE_IMPORT-compliancereportComponent
import { compliancereportComponent } from '../components/compliancereportComponent/compliancereport.component';
//CORE_REFERENCE_IMPORT-schedulereportComponent
import { schedulereportComponent } from '../components/schedulereportComponent/schedulereport.component';
//CORE_REFERENCE_IMPORT-assignusersComponent
import { assignusersComponent } from '../components/assignusersComponent/assignusers.component';
//CORE_REFERENCE_IMPORT-authserviceService
import { authserviceService } from '../services/authservice/authservice.service';
//CORE_REFERENCE_IMPORT-accessdeniedComponent
import { accessdeniedComponent } from '../components/accessdeniedComponent/accessdenied.component';
//CORE_REFERENCE_IMPORT-schedulesviewComponent
import { schedulesviewComponent } from '../components/schedulesviewComponent/schedulesview.component';
//CORE_REFERENCE_IMPORT-scheduledeclarationComponent
import { scheduledeclarationComponent } from '../components/scheduledeclarationComponent/scheduledeclaration.component';
//CORE_REFERENCE_IMPORT-userformComponent
import { userformComponent } from '../components/userformComponent/userform.component';
//CORE_REFERENCE_IMPORT-dialogconfirmationComponent
import { dialogconfirmationComponent } from '../components/dialogconfirmationComponent/dialogconfirmation.component';
//CORE_REFERENCE_IMPORT-pageheaderComponent
import { pageheaderComponent } from '../components/pageheaderComponent/pageheader.component';
//CORE_REFERENCE_IMPORT-commonService
import { commonService } from '../services/common/common.service';
//CORE_REFERENCE_IMPORT-userService
import { userService } from '../services/user/user.service';
//CORE_REFERENCE_IMPORT-usersComponent
import { usersComponent } from '../components/usersComponent/users.component';
//CORE_REFERENCE_IMPORT-reportsComponent
import { reportsComponent } from '../components/reportsComponent/reports.component';
//CORE_REFERENCE_IMPORT-schedulesComponent
import { schedulesComponent } from '../components/schedulesComponent/schedules.component';
//CORE_REFERENCE_IMPORT-footerComponent
import { footerComponent } from '../components/footerComponent/footer.component';
//CORE_REFERENCE_IMPORT-homeComponent
import { homeComponent } from '../components/homeComponent/home.component';
//CORE_REFERENCE_IMPORT-dashboardComponent
import { dashboardComponent } from '../components/dashboardComponent/dashboard.component';
//CORE_REFERENCE_IMPORT-loginComponent
import { loginComponent } from '../components/loginComponent/login.component';
import { ExportAsService } from 'ngx-export-as';

export function initializer(adalService: MsAdalAngular6Service) {
  return () => new Promise((resolve, reject) => {
    if(window.location.href.match('/noaccess')) {
      resolve();
    } else if (adalService.isAuthenticated) {
      resolve();
    } else {
      adalService.login();
    }
  });
}


/**
 * Reads datasource object and injects the datasource object into window object
 * Injects the imported environment object into the window object
 *
 */
export function startupServiceFactory(startupService: NDataSourceService) {
  return () => startupService.getDataSource();
}

/**
*bootstrap for @NgModule
*/
export const appBootstrap: any = [
  LayoutComponent,
];


/**
*Entry Components for @NgModule
*/
export const appEntryComponents: any = [
  //CORE_REFERENCE_PUSH_TO_ENTRY_ARRAY
  dialogconfirmationComponent,
  cpddeclarationComponent
];

/**
*declarations for @NgModule
*/
export const appDeclarations = [
  ImgSrcDirective,
  LayoutComponent,
  PageNotFoundComponent,
  NMapComponent,
  ArtImgSrcDirective,
  //CORE_REFERENCE_PUSH_TO_DEC_ARRAY
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-cpdquarterreportComponent
cpdquarterreportComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-aidfilesreportComponent
aidfilesreportComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-cpddeclarationComponent
cpddeclarationComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-cpdlistComponent
cpdlistComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-uploadscheduleComponent
uploadscheduleComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-aidreportComponent
aidreportComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-dashboardnewComponent
dashboardnewComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-quarterselectionComponent
quarterselectionComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-aidsdownloadComponent
aidsdownloadComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-jsonextractComponent
jsonextractComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-guidelinestabComponent
guidelinestabComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-listtableComponent
listtableComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-consolidatereportComponent
consolidatereportComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-compliancereportComponent
compliancereportComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-schedulereportComponent
schedulereportComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-assignusersComponent
assignusersComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-accessdeniedComponent
accessdeniedComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-schedulesviewComponent
schedulesviewComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-userformComponent
userformComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-dialogconfirmationComponent
dialogconfirmationComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-pageheaderComponent
pageheaderComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-usersComponent
usersComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-reportsComponent
reportsComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-schedulesComponent
schedulesComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-footerComponent
footerComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-homeComponent
homeComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-dashboardComponent
dashboardComponent,
//CORE_REFERENCE_PUSH_TO_DEC_ARRAY-loginComponent
loginComponent,
scheduledeclarationComponent,
nominatepageComponent,
assignpageComponent,

];

/**
* provider for @NgModuke
*/
export const appProviders = [
  NDataSourceService,
  
  {
    // Provider for APP_INITIALIZER
    provide: APP_INITIALIZER,
    useFactory: initializer,
    deps: [MsAdalAngular6Service],
    multi: true
  },
  {
    // Provider for APP_INITIALIZER
    provide: APP_INITIALIZER,
    useFactory: startupServiceFactory,
    deps: [NDataSourceService],
    multi: true
  },
  NAuthGuardService,
  ExportAsService,
  //CORE_REFERENCE_PUSH_TO_PRO_ARRAY
//CORE_REFERENCE_PUSH_TO_PRO_ARRAY-authserviceService
authserviceService,
//CORE_REFERENCE_PUSH_TO_PRO_ARRAY-commonService
commonService,
//CORE_REFERENCE_PUSH_TO_PRO_ARRAY-userService
userService,

];

/**
* Routes available for bApp
*/

// CORE_REFERENCE_PUSH_TO_ROUTE_ARRAY_START
export const appRoutes = [{path: 'login', component: loginComponent},{path: 'home', component: homeComponent, canActivate: [authserviceService],
children: [{path: 'dashboard', component: dashboardnewComponent},{path: '', component: dashboardnewComponent},{path: 'schedules', component: schedulesComponent},{path: 'reports/schedulesReport', component: schedulereportComponent},{path: 'users/:cat', component: usersComponent},{path: 'schedules/:fyear/:cat', component: schedulesviewComponent},{path: 'schedules/:fyear', component: schedulesComponent},{path: 'reports', redirectTo: 'reports/schedulesReport', pathMatch: 'full'},{path: 'reports/complianceReport', component: compliancereportComponent},{path: 'reports/consolidateReport', component: consolidatereportComponent},{path: 'schedules/:fyear/:cat/:user', component: schedulesviewComponent},{path: 'schedulesAID/:fyear/:cat', component: scheduledeclarationComponent},{path: 'reviews', component: schedulesComponent, data: {pageName: 'reviews'}},{path: 'reviews/:fyear', component: schedulesComponent, data: {pageName: 'reviews'}},{path: 'reports/aidReport', component: aidreportComponent},{path: 'dash', component: dashboardComponent},{path: 'uploadschedule', component: uploadscheduleComponent},{path: 'cpd/:cat', component: cpdlistComponent},{path: 'reports/aidFilesReport', component: aidfilesreportComponent},{path: 'reports/cpdReport', component: cpdquarterreportComponent}]},{path: 'noaccess', component: accessdeniedComponent},{path: 'jsonExtract', component: jsonextractComponent},{path: '', redirectTo: 'login', pathMatch: 'full'},{path: '**', component: PageNotFoundComponent}]
// CORE_REFERENCE_PUSH_TO_ROUTE_ARRAY_END
