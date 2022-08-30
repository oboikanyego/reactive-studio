/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
    selector: 'bh-users',
    templateUrl: './users.template.html'
})

export class usersComponent extends NBaseComponent implements OnInit {
    @ViewChild('tblPaginator', { static: true }) tblPaginator: MatPaginator;
    @ViewChild('tblSort', { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    tableSearch;
    dataSource;
    listBTN = {
        admin: 'Admins',
        director: 'Directors',
        manager: 'Manager',
        user: 'Others',
        deleted: 'Archive'
    };
    getPayload = {
        admin: [],
        director: [],
        manager: [],
        user: [],
        deleted: []
    };
    curSelected = 'director';
    Object = Object;
    action;
    adminInfo;
    loading;
    countObj = {};
    ngModelObj = {
        selectedUsers: {}
    };
    displayColumns= ["checkbox", "firstName", "lastName", "email", "mobile", "action"];
    exportAsConfig: ExportAsConfig = {
        type: 'csv', // the type you want to download
        elementIdOrContent: 'downloadTable', // the id of html/table element
    }

    constructor(private bdms: NDataModelService,
        private common: commonService,
        private user: userService,
        private router: Router,
        private aroute: ActivatedRoute,
        private snackbar: NSnackbarService,
        private session: NSessionStorageService,
        private exportAsService : ExportAsService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {

        this.aroute.params.subscribe((params: { cat: string }) => {
            this.curSelected = params.cat;
            this.getUsersList(this.curSelected);

            if (this.curSelected == 'deleted') {
                this.get('registeredusers', { 'is_active': false }, { '_id': 0 }, '', 1, 3000);
            } else {
                this.get('registeredusers', { 'userRole': this.curSelected, 'is_active': true }, { '_id': 0 }, '', 1, 3000);
            }
        });

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;
        this.getUsersCount();
    }

    getUsersCount() {
        Object.keys(this.listBTN).forEach((key) => {
            this.user.getUsersCount(key).subscribe(res => {
                this.countObj[key] = res['count'];
            }, error => {
                this.snackbar.openSnackBar('Unable to fetch count of user roles');
            });
        });
    }

    addUsers() {
        this.action = 'Activate';
        var dialogRef = this.common.openModal('component', { component: 'userForm', mode: 'create', title: 'Add User', selectedRole: this.curSelected });
        console.log("This Value",dialogRef)
    }

    editUsers(table) {
        console.log(table, "Data BK")
        this.common.openModal('component', { component: 'userForm', mode: 'edit', title: 'Edit User', tableData: table });
        this.getUsersList();
    }

    deleteUsers(table) {
        this.action = 'De-activate';
        var dialogRef = this.common.openModal('confirm', { mode: 'delete', title: 'Delete User', tableData: table, collection: 'registeredusers' });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let deleteObj = {
                    filter: { email: table.email },
                    userUpdateObj: { $set: { 'is_active': false } },
                    scheduleUpdateObj: { $set: { 'is_active': false } }
                };

                this.update('registeredusers', { $set: { 'is_active': false } }, { email: table.email }, {});
            }
        });
    }

    activateUser(table) {
        this.action = 'Activate';
        var dialogRef = this.common.openModal('confirm', { mode: 'activate', title: 'Activate User', tableData: table, collection: 'registeredusers' });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.update('registeredusers', { $set: { 'is_active': true } }, { email: table.email }, {});
            }
        });
    }

    searchUsers(e) {
        //console.log(e, this.tableSearch);
        this.dataSource.filter = this.tableSearch;
    }

    download(){
        //console.log(this.exportAsConfig);
        this.displayColumns= ["firstName", "lastName", "role", "email", "mobile"];
        this.loading = true;
        
        setTimeout(() => {
            if(this.dataSource.data && this.dataSource.data.length > 0){
                this.exportAsService.save(this.exportAsConfig, `users_${this.curSelected}`).subscribe((res) => {
                    // save started
                    //console.log(res);
                    this.displayColumns= ["checkbox", "firstName", "lastName", "email", "mobile", "action"];
                    this.loading = false;
                });            
            }
        }, 2000);
    }

    changeListener(e) {
        var files = e.target.files;
        //console.log(files, files[0].name);
        if (files && files.length > 0 && files[0].name.endsWith(".csv")) {
            let file: File = files.item(0);
            let reader: FileReader = new FileReader();
            reader.readAsText(file);
            reader.onload = (e) => {
                let csvData: string = reader.result as string;
                let csvRecordsArray = csvData.split(/\r\n|\n/);
                let parsedData = [];

                csvRecordsArray.forEach((str, index) => {
                    let splitArr = str.split(',');
                    if (index !== 0) {
                        let dataObj = {
                            firstName: splitArr[0] ? splitArr[0].trim() : null,
                            lastName: splitArr[1] ? splitArr[1].trim() : null,
                            userRole: splitArr[2] ? splitArr[2].trim() : null,
                            email: splitArr[3] ? splitArr[3].trim() : null,
                            mobile: splitArr[4] ? splitArr[4].trim() : null,
                        }

                        if (dataObj.email && dataObj.userRole && dataObj.firstName && dataObj.lastName) {
                            dataObj = this.user.createUserObjForPost(dataObj);
                            
                            parsedData.push(dataObj);
                        }
                    }
                });
                this.confirmBeforeUpload(parsedData, files[0].name);
                console.log(parsedData);
            }
        } else {
            this.snackbar.openSnackBar('Please upload .csv file with valid data');
        }
    }

    confirmBeforeUpload(parsedData, fileName) {
        var dialogRef = this.common.openModal('confirm', { mode: 'uploadUsers', title: 'Upload ' + fileName });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.user.uploadUser(parsedData).subscribe(res => {
                    this.loading = false;
                    // let resFilter = res.filter((resObj) => {
                    //     return resObj == 'User already exists';
                    // });
                    //console.log(res, resFilter, parsedData);
                    //this.snackbar.openSnackBar(resFilter.length + ' records failed to insert out of ' + res.length + '.. Please refresh to check data', '5000');
                    this.snackbar.openSnackBar('Users uploaded successfully');
                    this.getUsersList();
                }, error => {
                    this.loading = false;
                    this.snackbar.openSnackBar(error.error, '6000');
                });
            }
        });
    }

    // Selected users actions start //
    changeRole() {
        const selectedUsersList = this.processSelectedItems();
        
        if (selectedUsersList.length <= 0){
            this.snackbar.openSnackBar('No users selected', 2000);
            return false;
        }

        const dialogRef = this.common.openModal('changeRole', { mode: 'changeRole', title: 'Change role(s)', collection: 'registeredusers' });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.confirm && result.selected) {
                this.action == 'Change';

                //console.log(result);
                this.update('registeredusers', { $set: { 'userRole': result.selected } }, { email: { $in: this.processSelectedItems() } }, {});
                //console.log(this.processSelectedItems());
            }
        });
    }

        // Selected Department //
    selectDepartment() {
        const selectedUsersList = this.processSelectedItems();
        
        if (selectedUsersList.length <= 0){
            this.snackbar.openSnackBar('No users selected', 2000);
            return false;
        }

        const dialogRef = this.common.openModal('changeRole', { mode: 'changeRole', title: 'Change role(s)', collection: 'registeredusers' });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.confirm && result.selected) {
                this.action == 'Change';

                //console.log(result);
                this.update('registeredusers', { $set: { 'userRole': result.selected } }, { email: { $in: this.processSelectedItems() } }, {});
                //console.log(this.processSelectedItems());
            }
        });
    }

    //open dialog departmant
        changeDepartment() {
        const selectedUsersList = this.processSelectedItems();
        
        if (selectedUsersList.length <= 0){
            this.snackbar.openSnackBar('No users selected', 2000);
            return false;
        }

        const dialogRef = this.common.openModal('changeDepartment', { mode: 'changeDepartment', title: 'Change department(s)', collection: 'registeredusers' });
        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.confirm && result.selected) {
                this.action == 'Change';

                //console.log(result);
                this.update('registeredusers', { $set: { 'department': result.selected } }, { email: { $in: this.processSelectedItems() } }, {});
                //console.log(this.processSelectedItems());
            }
        });
    }

    activeUsers() {
        const selectedUsersList = this.processSelectedItems();
        
        if (selectedUsersList.length <= 0){
            this.snackbar.openSnackBar('No users selected', 2000);
            return false;
        }

        const dialogRef = this.common.openModal('confirm', { mode: 'activate', title: 'Activate User(s)', collection: 'registeredusers' });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.action == 'Activate';
                this.update('registeredusers', { $set: { 'is_active': true } }, { email: { $in: this.processSelectedItems() } }, {});
                //console.log(this.processSelectedItems());
            }
        });
    }

    deactiveUsers() {
        const selectedUsersList = this.processSelectedItems();
        
        if (selectedUsersList.length <= 0){
            this.snackbar.openSnackBar('No users selected', 2000);
            return false;
        }

        const dialogRef = this.common.openModal('confirm', { mode: 'delete', title: 'De-activate User(s)', collection: 'registeredusers' });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.action == 'De-activate';
                this.update('registeredusers', { $set: { 'is_active': false } }, { email: { $in: this.processSelectedItems() } }, {});
            }
        });
    }

    deleteFUsers() {
        const selectedUsersList = this.processSelectedItems();
        
        if (selectedUsersList.length <= 0){
            this.snackbar.openSnackBar('No users selected', 2000);
            return false;
        }
        
        this.action = 'Delete forever';
        var dialogRef = this.common.openModal('confirm', { mode: 'delete', title: 'Delete User(s) forever', collection: 'registeredusers' });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.user.deleteUser({ email: { $in: this.processSelectedItems() }}).subscribe(res => {
                    this.snackbar.openSnackBar('Selected users removed successfully.');

                    this.getUsersList();
                }, error => {
                    this.snackbar.openSnackBar('Error while removing selected users.');
                });
            }
        });
    }

    processSelectedItems() {
        const selectedEmails = [];

        Object.keys(this.ngModelObj['selectedUsers']).forEach((userEmail) => {
            if (this.ngModelObj['selectedUsers'][userEmail]) {
                selectedEmails.push(userEmail);
            }
        });

        return selectedEmails;
    }
    // Selected users actions end //

    getUsersList(val?) {
        this.curSelected = val ? val : (this.curSelected == 'admin' ? 'director' : 'admin');
        this.common.navigate({ path: '/home/users/' + this.curSelected });

        //this.get('registeredusers', {'is_active': true}, {'_id': 0});
        // this.changeUsersTable();
    }

    changeUsersTable() {
        this.ngModelObj['selectedUsers'] = {};
        this.getUsersCount();
        this.dataSource.data = this.getPayload[this.curSelected];
        console.log("Test", this.getPayload)
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.loading = true;

        if (dataModelName == 'registeredusers') {
            this.user.genericGet(dataModelName, filter, keys).subscribe((res) => {
                this.dataSource.data = res;
                this.getPayload[this.curSelected] = res;
                this.changeUsersTable();
                this.loading = false;
            }, error => {
                this.loading = false;
            });
        }
    }

    update(dataModelName, update, filter, options) {
        const updateObject = {
            update: update,
            filter: filter,
            options: options
        };

        this.user.genericPut(dataModelName, updateObject, filter).subscribe((res) => {
            if ((this.action == 'De-activate' || this.action == 'Activate') && dataModelName == 'registeredusers') {
                this.action == 'Schedule update';
                //console.log(filter.email);
                this.update('schedulesfilled', { $set: { 'is_active': this.action == 'Activate' ? true : false } }, { filledBy: filter.email }, {});
            }

            if (dataModelName !== 'schedulesfilled') {
                this.snackbar.openSnackBar('User ' + this.action + 'd successfully', 2000);
                this.router.navigate(['/home/users/director']);
            }
        }, error => {
            this.snackbar.openSnackBar('Unable to ' + this.action + ' user. Please try later', 2000);
        });
    }


}
