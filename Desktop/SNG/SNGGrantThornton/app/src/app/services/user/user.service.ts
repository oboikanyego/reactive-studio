/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE CLASS NAME*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpParams } from '@angular/common/http';
import { NDataModelService, NSnackbarService, NSessionStorageService, NLoginService, NLogoutService } from 'neutrinos-seed-services';
import { ModelMethods } from '../../lib/model.methods';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { MsAdalAngular6Service } from 'microsoft-adal-angular6';

@Injectable({
    providedIn: 'root'
})
export class userService {
    dm: ModelMethods;
    sysProps;
    systemProperties;
    adminInfo;

    constructor(
        private http: HttpClient,
        private router: Router,
        private bDataModelService: NDataModelService,
        private login: NLoginService,
        private logout: NLogoutService,
        private adalSvc: MsAdalAngular6Service,
        private sessions: NSessionStorageService
    ) {
        this.dm = new ModelMethods(bDataModelService);
        this.sysProps = this.bDataModelService;
        this.systemProperties = this.sysProps.systemService.properties;

        this.adminInfo = this.sessions.getValue('userInfo');
    }

    loginUser(data):Observable<any>{
        return this.login.login(data.email, data.password, true);
    }

    logoutUser(){
        this.logout.logout();
        this.sessions.clearSessionStorage();
        localStorage.clear();
        this.adalSvc.logout();
        return true;
    }

    getTitles(){
        let url = this.getSSDURL();
        let headers = this.getReqHeaders();
        url += 'getTitles';
        return this.http.get(url, {headers});
    }

    registerUser(data):Observable<any>{
        // let url = this.getModularURL();
        // let headers = this.getReqHeaders();
        // url += 'registerUser';

        return this.genericPost('registeredusers', [data]);
        //return this.http.post(url, data, {headers});
    }

    uploadUser(data):Observable<any>{
        //let url = this.getModularURL();
        //let headers = this.getReqHeaders();
        //url += 'uploadUsers';

        return this.genericPost('registeredusers', data);
        //return this.http.post(url, data, {headers});
    }

    deleteUsers(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = this.getReqHeaders();

        url += 'deleteUsers';

        return this.http.post(url, {'userRole': 'Other'}, {headers});
    }

    createUserObjForPost(data) {
        console.log("Data from user Serv edit", data)
        this.adminInfo = this.sessions.getValue('userInfo');
        const payload = {
            firstName: data.firstName.replace(/[0-9]/g, ''),
            lastName: data.lastName.replace(/[0-9]/g, ''),
            userRole: data.userRole.replace(/[0-9]/g, ''),
            mobile: data.mobile,
            email: data.email,
            is_active: true,
            createdOn: new Date(),
            createdBy: this.adminInfo.email,
            displayName: data.firstName + ' ' + data.lastName,
            department: data.department
        };

        payload['email'] = payload['email'] ? payload['email'].toLowerCase() : '';
        payload['userRole'] = payload.userRole == 'Other' ? 'user' : payload.userRole;

        return payload;
    }

    scheduleFill(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();
        url += 'addScheduleOutput';

        return this.http.post(url, data, {headers});
    }

    scheduleSignOff(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();
        url += 'scheduleSignOff';

        return this.http.post(url, data, {headers});
    }

    scheduleApproval(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();
        url += 'scheduleApproval';

        return this.http.post(url, data, {headers});
    }

    scheduleCommit(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();
        url += 'scheduleCommit';

        return this.http.post(url, data, {headers});
    }

    deleteUser(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();

        url += `gendelete/registeredusers`;

        return this.http.post(url, data, {headers});
    }

    sendEmail(data):Observable<any>{
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();
        url += 'sendEmail';

        return this.http.post(url, data, {headers});
    }

    resetPassword(email?){

    }

    checkUser(){
        /*let isLoggedIn = false;
        this.login.isLoggedIn().then(res => {
            isLoggedIn
        })*/

        return this.sessions.getValue('userObj');
    }

    getModularURL(){
        return this.systemProperties.modularUrl;
    }

    getSSDURL() {
        return this.systemProperties.ssdURL;
    }

    getNodeURL() {
        return this.systemProperties.nodeURL;
    }

    getReqHeaders(){
        //console.log(Buffer.from(this.systemProperties.basicAuthUser+':'+this.systemProperties.basicAuthPassword).toString('base64'));
        //console.log(this.systemProperties)
        let token = this.systemProperties.basicAuthUser+':'+this.systemProperties.basicAuthPassword;
        let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                        .set('token', btoa(token));

        return headers;
    }

    uploadAFile(body) {
        let url = this.getNodeURL();
        let headers = new HttpHeaders(); //.set('Content-Type', 'multipart/form-data');
        url += 'upload';

        return this.http.post(url, body, {headers});
    }

    deleteAFile(body) {
        let url = this.getNodeURL();
        let headers = new HttpHeaders();
        url += 'delete';

        return this.http.post(url, body, {headers});
    }

    viewAFile(body) {
        let url = this.getNodeURL();
        let headers = new HttpHeaders();
        //url += body.filepath.split('./')[1];
        url += 'public/'+ body.name;

        return url;
        //return this.http.get(url, {headers});
    }

    getUsersCount(key): Observable<any> {
        //let url = this.getModularURL();
        //let headers = this.getReqHeaders();
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        url += 'userscount/' + key;

        return this.http.get(url, {headers});
    }

    getSchedulesfilledData(query): Observable<any> {
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        url += 'getSchedulesFilled';

        return this.http.post(url, query, {headers});

    }

    genericGet(collectionName, filter?, options?): Observable<any> {
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();

        url += `genget/${collectionName}`;

        Object.keys(filter).forEach((queryParam) => {
            params = params.set(queryParam, JSON.stringify(filter[queryParam]));
        });

        // Object.keys(filter).forEach((queryParam) => {
        //     params = params.set(queryParam, JSON.stringify(filter[queryParam]));
        // });

        if (options) {
            params = params.append('projections', JSON.stringify(options));
        }
        return this.http.get(url, {headers, params});
    }

    genericPost(collectionName, body): Observable<any> {
        let url = this.getSSDURL();
        let headers = new HttpHeaders();

        url += `genpost/${collectionName}`;

        return this.http.post(url, body, {headers});
    }

    genericPut(collectionName, update, filter): Observable<any> {
        let url = this.getSSDURL();
        let headers = new HttpHeaders();
        let params = new HttpParams();

        url += `genput/${collectionName}`;

        return this.http.put(url, update, {headers, params});
    }

}
