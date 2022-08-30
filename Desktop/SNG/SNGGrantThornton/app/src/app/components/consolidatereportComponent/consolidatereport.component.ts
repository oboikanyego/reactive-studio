/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { MatTableDataSource } from '@angular/material/table';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'bh-consolidatereport',
    templateUrl: './consolidatereport.template.html'
})

export class consolidatereportComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    loading = false;
    Object = Object;
    userInfo;
    curDate = new Date();
    fyOptions;
    quarters;
    curQuarter;
    fyear;
    queryParams;
    getPayload = {};
    schedulesList = [];
    schedulesUsers = [];
    schedulesStatus = {};
    tableSearch;
    dataSource;
    displayColumns = ['username'];
    exportAsConfig: ExportAsConfig = {
        type: 'xlsx', // the type you want to download
        elementIdOrContent: 'downloadTable', // the id of html/table element
    }

    constructor(private bdms: NDataModelService,
        private common: commonService,
        private user: userService,
        private scheduleSer: scheduleService,
        private exportAsService: ExportAsService) {
        super();
        this.mm = new ModelMethods(bdms);

        this.fyear = this.scheduleSer.fyear || this.scheduleSer.getFYear();
        this.curQuarter = this.scheduleSer.curQuarter || this.scheduleSer.getCurQuarter();

        this.scheduleSer.changeQuarter.subscribe(() => {
            this.changeQuarter();
        });
    }

    ngOnInit() {

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

        //this.common.navigate({path: 'home/reports/consolidateReport/'+ this.fyear});
        //console.log(this.curQuarter, this.fyear);
    }

    getStatement() {
        this.loading = true;
        this.displayColumns = ['username'];

        this.get('schedulesassigned', { 'quarter': this.fyear }, { _id: 0 }, '', 1, 3000);
    }

    download() {
        if (this.dataSource.data && this.dataSource.data.length > 0) {
            this.exportAsService.save(this.exportAsConfig, 'consolidateReport' + this.fyear).subscribe(() => {
                // save started
            });
        }
    }

    searchUsers(e) {
        if (this.tableSearch && this.tableSearch.length > 1) {
            this.dataSource.filter = this.tableSearch;
        } else {
            this.dataSource.filter = '';
        }
    }

    processReportData(result, dataModelName) {
        const consolidateReportData = [];
        if (dataModelName == 'schedulesassigned') {
            //console.log(result, this.fyear);
            result.forEach((schedule) => {
                this.schedulesList.push(schedule.name);
                this.displayColumns.push(schedule.name);

                if (schedule['assignedTo']) {
                    schedule['assignedTo'].forEach((assignedTo) => {
                        //if(schedule.quarter == this.fyear){
                        let filterUser = consolidateReportData.findIndex(function (obj) {
                            return obj.username === assignedTo.email;
                        });
                        let scheduleObj = {};
                        scheduleObj[schedule.name] = assignedTo.status

                        if (filterUser < 0) {
                            let pushObj = Object.assign({}, {
                                'username': assignedTo.email,
                                'displayName': assignedTo.displayName
                            }, scheduleObj);
                            consolidateReportData.push(pushObj);
                        } else {
                            let newObj = Object.assign({}, consolidateReportData[filterUser], scheduleObj);
                            consolidateReportData[filterUser] = newObj;
                        }
                        //}
                    });
                }
            });
            //console.log(this.displayColumns, consolidateReportData);
        } //console.log(consolidateReportData);
        this.dataSource.data = consolidateReportData;
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.getPayload[dataModelName] = result;
                this.processReportData(result, dataModelName);
                this.loading = false;
            },
            error => {
                // Handle errors here
            }
        );
    }
}
