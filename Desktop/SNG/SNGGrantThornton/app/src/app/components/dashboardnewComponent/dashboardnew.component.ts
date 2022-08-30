/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'bh-dashboardnew',
    templateUrl: './dashboardnew.template.html'
})

export class dashboardnewComponent extends NBaseComponent implements OnInit {
    @ViewChild('tblPaginator', { static: true }) tblPaginator: MatPaginator;
    @ViewChild('tblSort', { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    getPayload = {};
    dataSource;
    userInfo;
    displayedColumns = [];
    fyear;
    curQuarter;
    curFullYear;
    curDate = new Date();
    countObj = [];
    processedAdminObj = {};
    pieChartData1 = [];
    pieChartData2 = [];

    constructor(private bdms: NDataModelService,
        private common: commonService,
        private scheduleSer: scheduleService,
        private user: userService,
        private snackbar: NSnackbarService,
        private router: Router,
        private session: NSessionStorageService) {
        super();
        this.mm = new ModelMethods(bdms);

        this.fyear = this.scheduleSer.fyear || this.scheduleSer.getFYear();
        this.curQuarter = this.scheduleSer.curQuarter || this.scheduleSer.getCurQuarter();

        this.scheduleSer.changeQuarter.subscribe(() => {
            this.changeQuarter();
        });

        this.curFullYear = this.curDate.getFullYear().toString().substring(2);
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');
        //console.log(this.userInfo());

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        this.getStatement();
    }

    changeQuarter(e?) {
        this.curQuarter = this.scheduleSer.curQuarter; //'Q' + e.value.split('Q')[1];
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        this.fyear = this.scheduleSer.fyear; //e.value;

        this.getStatement();
    }

    getStatement() {
        let filter, keys;

        if (this.userInfo.userRole == 'director') {
            // filter = { assignedTo: { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } };
            // keys = { '_id': 0, 'name': 1, 'assignedTo.$': 1, 'quarter': 1, 'closingDate': 1 };
            // this.displayedColumns.push('quarter', 'closingDate', 'status');
            
            this.common.navigate({ path: '/home/dash' });
        } else if (this.userInfo.userRole == 'user') {
            // filter = {
            //     '$or': [
            //         { 'nominatedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole, 'status': { '$ne': 'completed' } } } },
            //         { 'assignedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole, 'status': { '$ne': 'completed' } } } }
            //     ]
            // };
            // keys = { '_id': 0, 'name': 1, 'nominatedTo': 1, 'assignedTo': 1, 'quarter': 1, 'closingDate': 1 };
            // this.displayedColumns.push('quarter', 'closingDate', 'status');
            
            this.common.navigate({ path: '/home/dash' });
        } else if (this.userInfo.userRole == 'manager') {
            // filter = {
            //     '$or': [
            //         { 'nominatedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole, 'status': { '$ne': 'completed' } } } },
            //         { 'assignedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole, 'status': { '$ne': 'completed' } } } }
            //     ]
            // };
            // keys = { '_id': 0, 'name': 1, 'nominatedTo': 1, 'assignedTo': 1, 'quarter': 1, 'closingDate': 1 };
            // this.displayedColumns.push('quarter', 'closingDate', 'status');
            
            this.common.navigate({ path: '/home/dash' });
        } else if (this.userInfo.userRole == 'admin') {
            filter = { quarter: this.fyear };
            keys = {};

            this.countObj = [];
            this.getUsersCount();
            this.get('schedulesassigned', filter, keys);
            //this.common.navigate({ path: '/home/reports/consolidateReport' });
        }
    }

    getUsersCount() {
        ['admin', 'director', 'manager', 'user', 'deleted'].forEach((key) => {
            this.user.getUsersCount(key).subscribe(res => {
                const pushObj = {
                    name: key,
                    value: res['count']
                };

                this.countObj.push(pushObj);
            }, error => {
                this.snackbar.openSnackBar('Unable to fetch count of user roles');
            });
        });
    }

    scheduleClicked(table) {
        this.common.navigate({ path: 'home/schedules/' + table.quarter });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.getPayload[dataModelName] = result;
                if (this.userInfo.userRole == 'director') {
                    this.dataSource.data = this.processDirectorData(result, 'assignedTo');
                } else if (this.userInfo.userRole == 'user') {
                    //userArr = 'nominatedTo';
                    this.dataSource.data = this.processUsersData(result)
                } else if (this.userInfo.userRole == 'admin') {
                    this.processAdminData(dataModelName, result);

                    // if(!this.getPayload['schedulesfilled']) {
                    //     this.get('schedulesfilled', filter);
                    // }
                }
            },
            error => {
                // Handle errors here
            });
    }

    processUsersData(result) {
        const data = [];
        result.forEach((value) => {
            if (value.assignedTo.find((val) => { return val.email == this.userInfo.email })) {
                value.status = value.assignedTo.find((val) => { return val.email == this.userInfo.email }).status;
            } else if (value.nominatedTo.find((val) => { return val.email == this.userInfo.email })) {
                value.status = value.nominatedTo.find((val) => { return val.email == this.userInfo.email }).status;
            }

            if (!data.find(o => o.quarter == value.quarter)) {
                data.push({
                    quarter: value.quarter,
                    closingDate: value.closingDate,
                    status: [value.status]
                });
            } else {
                let quarterObj = data.find(o => o.quarter == value.quarter);
                quarterObj.status.push(value.status);
            }
        });

        return data;
        /*result.forEach((value) => {
            console.log(value);
            if(value.nominatedTo){

            }
        });*/
    }

    processDirectorData(result, userArr) {
        const data = [];
        result.forEach((value) => { //console.log(value, userArr);
            if (!data.find(o => o.quarter == value.quarter)) {
                data.push({
                    quarter: value.quarter,
                    closingDate: value.closingDate,
                    status: value[userArr] ? [value[userArr][0].status] : []
                });
            } else {
                let quarterObj = data.find(o => o.quarter == value.quarter);
                quarterObj.status.push(value[userArr][0].status);
            }
        });

        return data;
    }

    resetChartsData() {
        this.processedAdminObj = {};
        this.pieChartData1 = [];
        this.pieChartData2 = [];
    }

    processAdminData(dataModelName, result) {
        if (dataModelName == 'schedulesassigned') {
            this.resetChartsData();
            
            result.forEach((schedules) => {
                const schedule = schedules.name;
                this.processedAdminObj[schedule] = {
                    name: schedule,
                    type: schedules.type,
                    assignedTo: schedules.assignedTo,
                    assignedCount: schedules.assignedTo.length,
                    completedCount: 0,
                    pendingCount: 0,
                    completedUsers: [],
                    pendingUsers: [],
                    approvedCount: 0,
                    approvedUsers: [],
                    inReviewCount: 0,
                    inReviewUsers: []
                };

                const curSelObj = this.processedAdminObj[schedule];
                schedules.assignedTo.forEach((userRecord) => {
                    if (userRecord.status == 'completed') {
                        curSelObj.completedCount = curSelObj.completedCount + 1;
                        curSelObj.completedUsers.push(userRecord.email);
                    } else if (userRecord.status == 'outstanding') {
                        curSelObj.pendingCount = curSelObj.pendingCount + 1;
                        curSelObj.pendingUsers.push(userRecord.email);
                    }

                    if (userRecord.approvedDetails) {
                        curSelObj.approvedCount = curSelObj.approvedCount + 1;
                        curSelObj.approvedUsers.push(userRecord.email);
                    } else {
                        curSelObj.inReviewCount = curSelObj.inReviewCount + 1;
                        curSelObj.inReviewUsers.push(userRecord.email);
                    }
                });

                this.pieChartData1.push({
                    "name": schedule,
                    "series": [
                        {
                            "name": "Completed",
                            "value": curSelObj.completedCount
                        },
                        {
                            "name": "Outstanding",
                            "value": curSelObj.pendingCount
                        }
                    ]
                });

                if (curSelObj.type == 'AIDView') {
                    this.pieChartData2.push({
                        "name": schedule,
                        "series": [
                            {
                                "name": "Approved",
                                "value": curSelObj.approvedCount
                            },
                            {
                                "name": "Review Pending",
                                "value": curSelObj.inReviewCount
                            }
                        ]
                    });
                }
            });
        }
    }

}
