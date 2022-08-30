/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Input, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { userService } from '../../services/user/user.service';

@Component({
    selector: 'bh-assignusers',
    templateUrl: './assignusers.template.html'
})

export class assignusersComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    userInfo;
    userData;
    mode;
    @Input() dialog;
    @Input() data;
    getPayload = {};
    dataSource;
    selectedUsers = {};
    closingDate;
    Object = Object;
    scheduleData;
    curState1 = 'active';
    curState2 = 'active';
    curState3 = 'active';
    defaultFilter = false;
    deletedUsers = [];
    selectableRoles = {
        all: [
            { label: '', value: 'all', 'state': 'Select' },
            { label: 'Directors', value: 'director', 'state': 'Select' },
            { label: 'Managers', value: 'manager', 'state': 'Select' },
            { label: 'Users', value: 'user', 'state': 'Select' }
        ],
        director: [{ label: 'Directors', value: 'director', 'state': 'Select' }],
        manager: [{ label: 'Managers', value: 'manager', 'state': 'Select' }],
        managerUser: [
            { label: 'Managers', value: 'manager', 'state': 'Select' },
            { label: 'Users', value: 'user', 'state': 'Select' }
        ],
        user: [{ label: 'Users', value: 'user', 'state': 'Select' }]
    };
    availableList = 'user';
    selectedBTNLabels = {};

    constructor(private bdms: NDataModelService,
        private user: userService,
        private session: NSessionStorageService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;
        this.scheduleData = this.data.data.getPayload ? this.data.data.getPayload['scheduleslist'] : {};

        const filter = { is_active: true };
        if (this.userInfo.userRole == 'admin' && this.scheduleData.name == 'Gifts Register') {
            filter['userRole'] = { $ne: 'admin' };
            this.availableList = 'all';
        } else if (this.userInfo.userRole == 'admin') {
            filter['userRole'] = 'director';
            this.availableList = 'director';
        } else if (this.userInfo.userRole == 'director') {
            //filter['userRole'] = 'user';

            filter['userRole'] = { $in: ['manager', 'user'] };
            this.availableList = 'managerUser';
        }

        //console.log(this.data.data.getPayload['scheduleslist']);
        if (this.data.data.getPayload['scheduleslist'].roles &&
            this.data.data.getPayload['scheduleslist'].roles == 'manager') {
            this.defaultFilter = true;
            filter['userRole'] = 'manager';
            this.availableList = 'manager';
        } else if (this.data.data.getPayload['scheduleslist'].roles &&
            this.data.data.getPayload['scheduleslist'].roles == 'user') {
            this.defaultFilter = true;
            filter['userRole'] = 'user';
            this.availableList = 'user';
        }

        this.get('registeredusers', filter, { '_id': 0 }, '', 1, 3000);

        if (this.data.data && this.data.data.assignedTo) { //console.log(this.data.data.assignedTo);
            this.data.data.assignedTo.forEach((value) => {
                this.selectedUsers[value.email] = {
                    email: value.email,
                    displayName: value.displayName,
                    disable: value.disable,
                    role: value.role,
                    assignedDate: value.assignedDate
                };
            });

            this.closingDate = this.data.data.closingDate;
        }
    }

    saveUsers() {
        console.log(this.selectedUsers);
    }

    onNoClick(): void {
        this.dialog.close();
    }

    selectUser(table, e) {
        if (e.checked) {
            this.selectedUsers[table.email] = {
                email: table.email,
                displayName: table.displayName,
                disable: false,
                assignedDate: new Date().getTime(),
                role: table.userRole
            }
        } else {
            this.deletedUsers.push(table.email);
            delete this.selectedUsers[table.email];
        }
    }

    searchUsers(e) {
        let val = e.target.value;
        if (val.length > 2) {
            this.dataSource.filter = val;
        } else {
            this.dataSource.filter = '';
        }
    }

    // selectAll() {
    //     let usersLength = this.getPayload['registeredusers'].length;
    //     let selectedLength = Object.keys(this.selectedUsers).length;

    //     if (usersLength == selectedLength) {
    //         let filteredList = {};
    //         Object.keys(this.selectedUsers).forEach((userEmail) => {
    //             if (this.selectedUsers[userEmail].disable) {
    //                 filteredList[userEmail] = this.selectedUsers[userEmail];
    //             }
    //         });
    //         this.selectedUsers = filteredList;
    //         this.curState1 = 'active';
    //         this.curState2 = 'active';
    //         this.curState3 = 'active';
    //     } else {
    //         this.getPayload['registeredusers'].forEach((user) => {
    //             if (this.selectedUsers[user.email] && this.selectedUsers[user.email].disable) {
    //                 return false;
    //             } else {
    //                 this.selectedUsers[user.email] = {
    //                     email: user.email,
    //                     displayName: user.displayName,
    //                     role: user.userRole,
    //                     disable: false,
    //                     assignedDate: new Date().getTime(),
    //                 };

    //             }
    //         });
    //         this.curState1 = 'de-active';
    //         this.curState2 = 'de-active';
    //         this.curState3 = 'de-active';
    //     }
    // }

    // selectAllOthers(key, state) {
    //     let filteredList = this.getPayload['registeredusers'].filter(item => item.userRole == key);
    //     let usersLength = filteredList.length;
    //     let selectedLength = Object.keys(this.selectedUsers).length;

    //     filteredList.forEach((user) => {
    //         //console.log(user.userRole, key, this.selectedUsers[user.email]);
    //         if (this.selectedUsers[user.email] && this.selectedUsers[user.email].disable) {
    //             return false;
    //         } else if (this[state] == 'active') {
    //             this.selectedUsers[user.email] = {
    //                 email: user.email,
    //                 displayName: user.displayName,
    //                 role: user.userRole,
    //                 disable: false,
    //                 assignedDate: new Date().getTime(),
    //             };
    //         } else {
    //             delete this.selectedUsers[user.email];
    //         }
    //     });
    //     this[state] = (this[state] == 'active') ? 'de-active' : 'active';
    // }

    selectAlluserList(role, roleObj) {
        let usersLength = 0;
        if (role !== 'all') {
            usersLength = this.getPayload['registeredusers'].filter(item => item.userRole == role ).length;
        } else {
            usersLength = this.getPayload['registeredusers'].filter(item => item.userRole !== '' ).length;
        }
        let selectedLength = Object.keys(this.selectedUsers).length;

        if(usersLength == selectedLength || roleObj['state'] == 'De-Select'){
            this.selectedUsers = {};
            roleObj['state'] = 'Select';
        } else {
            this.getPayload['registeredusers'].forEach((user, index) => {
                console.log(this.selectedUsers[user.email]);
                if(user.userRole == role && role !== 'all'){
                    this.selectedUsers[user.email] = {
                        email: user.email,
                        displayName: user.displayName,
                        role: user.userRole,
                        disable: false,
                        assignedDate: new Date().getTime(),
                    };
                } else if(role == 'all') {
                    this.selectedUsers[user.email] = {
                        email: user.email,
                        displayName: user.displayName,
                        role: user.userRole,
                        disable: false,
                        assignedDate: new Date().getTime(),
                    };
                }
            });
            roleObj['state'] = 'De-Select';
        }

    }

    /*selectAllUsers(){
        let usersLength = this.getPayload['registeredusers'].filter(item => item.userRole == 'user' ).length;
        let selectedLength = Object.keys(this.selectedUsers).length;
        //console.log(usersLength, selectedLength, this.selectedUsers, this.getPayload['registeredusers'].filter(item => item.userRole == 'user' ));
        if(usersLength == selectedLength){
            this.selectedUsers = {};
            this.curState = 'active';
        } else {
            this.getPayload['registeredusers'].forEach((user) => {
                if(user.userRole == 'user'){
                    this.selectedUsers[user.email] = {
                        email: user.email,
                        displayName: user.displayName
                    };
                }
            });
            this.curState = 'de-active';
        }
    }*/

    metaData = {
        'active': {
            selectAllName: 'Select all',
            selectAllDirectorsName: 'Select all directors',
            selectAllUsersName: 'Select all other users'
        },
        'de-active': {
            selectAllName: 'De-select all',
            selectAllDirectorsName: 'De-select all directors',
            selectAllUsersName: 'De-select all other users'
        }
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.getPayload[dataModelName] = result;
                this.dataSource.data = result;

                if (this.data.data.tableSearch) {
                    this.dataSource.filter = this.data.data.tableSearch;
                }
                //console.log(this.getPayload);
            },
            error => {
                // Handle errors here
            }
        );
    }

}
