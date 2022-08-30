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
    selector: 'bh-compliancereport',
    templateUrl: './compliancereport.template.html'
})

export class compliancereportComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    loading = false;
    Object = Object;
    getPayload = {};
    curDate = new Date();
    userInfo;
    fyOptions;
    quarters;
    curQuarter;
    fyear;
    schedulesQuarter = {};
    complianceReport = [];
    tableSearch;
    displayColumns = [];
    exportAsConfig: ExportAsConfig = {
        type: 'xlsx', // the type you want to download
        elementIdOrContent: 'downloadTable', // the id of html/table element
    }
    dataSource;
    curFullYear;

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

        this.curFullYear = this.curDate.getFullYear().toString().substring(2);
        //console.log(this.fyear, this.curQuarter);
    }

    ngOnInit() {

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        this.schedulesQuarter['F' + this.curFullYear + 'Q1'] = {
            columns: ['Q1'],
            query: ['F' + this.curFullYear + 'Q1']
        };
        this.schedulesQuarter['F' + this.curFullYear + 'Q2'] = {
            columns: ['Q1', 'Q2'],
            query: ['F' + this.curFullYear + 'Q1', 'F' + this.curFullYear + 'Q2']
        };
        this.schedulesQuarter['F' + this.curFullYear + 'Q3'] = {
            columns: ['Q1', 'Q2', 'Q3'],
            query: ['F' + this.curFullYear + 'Q1', 'F' + this.curFullYear + 'Q2', 'F' + this.curFullYear + 'Q3']
        };
        this.schedulesQuarter['F' + this.curFullYear + 'Q4'] = {
            columns: ['Q1', 'Q2', 'Q3', 'Q4'],
            query: ['F' + this.curFullYear + 'Q1', 'F' + this.curFullYear + 'Q2',
            'F' + this.curFullYear + 'Q3', 'F' + this.curFullYear + 'Q4']
        };

        this.getStatement();
    }

    changeQuarter(e?) {
        this.curQuarter = this.scheduleSer.curQuarter; //'Q' + e.value.split('Q')[1];
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        this.fyear = this.scheduleSer.fyear; //e.value;

        this.getStatement();
    }

    download() {
        //console.log(this.exportAsConfig);
        if (this.dataSource.data && this.dataSource.data.length > 0) {
            this.exportAsService.save(this.exportAsConfig, 'complianceReport_' + this.fyear).subscribe((res) => {
                // save started
                //console.log(res);
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

    getStatement() {
        this.loading = true;
        /*let filter = { 'assignedTo.quarter': { $in : this.schedulesQuarter[this.fyear].query } };
        let projection =  {
            assignedTo: { $filter: {
                        input: '$assignedTo',
                        as: 'assignedTo',
                        cond: { $eq: ['$$assignedTo.quarter', { $in : this.schedulesQuarter[this.fyear].query }]}
                    }},
            _id: 0
        }; console.log(filter, projection);

        this.get('scheduleslist', filter, { $project: projection});*/

        if (!this.schedulesQuarter[this.fyear]) {
            let yearSplitArr = this.fyear.split('Q');

            this.schedulesQuarter[this.fyear] = {
                columns: [],
                query: []
            };
            for (let i = 1; i <= yearSplitArr[1]; i++) {
                this.schedulesQuarter[this.fyear]['columns'].push('Q' + i);
                this.schedulesQuarter[this.fyear]['query'].push(yearSplitArr[0] + 'Q' + i);
            }
        }

        this.get('schedulesassigned',
            { 'quarter': { $in: this.schedulesQuarter[this.fyear]['query'] } },
            { _id: 0 }, '', 1, 3000);

    }

    processReportData(result) {
        result.forEach((schedule) => {
            if (schedule.assignedTo) {
                schedule.assignedTo.forEach((assignedTo) => {
                    let quarterInSchedule = schedule.quarter.split('Q')[1];
                    let filterUser = this.complianceReport.findIndex((obj) => {
                        return obj.username === assignedTo.email;
                    });

                    if (filterUser < 0) {
                        let quartersObj = {};
                        this.schedulesQuarter[this.fyear].columns.forEach((quarter) => {
                            quartersObj[quarter] = [];
                            if (quarter == 'Q' + quarterInSchedule) {
                                quartersObj[quarter].push(assignedTo.status);
                            }
                        });

                        let pushObj = Object.assign({}, {
                            'username': assignedTo.email,
                            'displayName': assignedTo.displayName
                        }, quartersObj);
                        this.complianceReport.push(pushObj);
                    } else {
                        if (!this.complianceReport[filterUser]['Q' + quarterInSchedule]) {
                            this.complianceReport[filterUser]['Q' + quarterInSchedule] = [];
                        }

                        this.complianceReport[filterUser]['Q' + quarterInSchedule].push(assignedTo.status);
                    }
                });
            }
        });
        this.dataSource.data = this.complianceReport;
        this.displayColumns = ['username', ...this.schedulesQuarter[this.fyear].columns];
        //console.log(this.complianceReport, this.displayColumns);
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                this.processReportData(result);
                this.loading = false;
            },
            error => {
                // Handle errors here
            }
        );
    }

}
