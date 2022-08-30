/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource } from '@angular/material/table';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'bh-dashboard',
    templateUrl: './dashboard.template.html'
})

export class dashboardComponent extends NBaseComponent implements OnInit {
    @ViewChild('tblPaginator', {static: true}) tblPaginator: MatPaginator;
    @ViewChild('tblSort', {static: true}) tblSort: MatSort;

    mm: ModelMethods;
    getPayload = {};
    dataSource;
    userInfo;
    displayedColumns = [];

    constructor(private bdms: NDataModelService,
        private common: commonService,
        private user: userService,
        private session: NSessionStorageService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        let filter, keys;
        this.userInfo = this.session.getValue('userInfo');
        //console.log(this.userInfo());

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        if (this.userInfo.userRole == 'director') {
            filter = { assignedTo: { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } };
            keys = { '_id': 0, 'name': 1, 'assignedTo.$': 1, 'quarter': 1, 'closingDate': 1 };
            this.displayedColumns.push('quarter', 'closingDate', 'status');

            this.get('schedulesassigned', filter, keys);
        } else if (this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            filter = {
                '$or': [
                    { 'nominatedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole } } },
                    { 'assignedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole } } }
                ]
            };
            keys = { '_id': 0, 'name': 1, 'nominatedTo': 1, 'assignedTo': 1, 'quarter': 1, 'closingDate': 1 };
            this.displayedColumns.push('quarter', 'closingDate', 'status');

            this.get('schedulesassigned', filter, keys);
        } else if (this.userInfo.userRole == 'admin') {
            //this.common.navigate({ path: '/home/r' });
        }
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
                } else if (this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
                    //userArr = 'nominatedTo';
                    this.dataSource.data = this.processUsersData(result)
                } 
            },
            error => {
                // Handle errors here
            });
    }

    processUsersData(result){
        const data = []; 
        result.forEach((value) => { 
            
            const assignedObj = value.assignedTo ? value.assignedTo.find((val) => { return val.email == this.userInfo.email}) : undefined;
            const nominatedObj = value.nominatedTo ? value.nominatedTo.find((val) => { return val.email == this.userInfo.email}) : undefined;
            
            if(assignedObj){
                value.status = assignedObj.status;
            } else if(nominatedObj) {
                value.status = nominatedObj.status;
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
}
