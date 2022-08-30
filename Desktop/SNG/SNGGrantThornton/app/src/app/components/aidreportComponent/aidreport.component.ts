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
    selector: 'bh-aidreport',
    templateUrl: './aidreport.template.html'
})

export class aidreportComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    fyear;
    curQuarter;
    exportAsConfig: ExportAsConfig = {
        type: 'xlsx', // the type you want to download
        elementIdOrContent: 'downloadTable', // the id of html/table element
    }
    dataSource;
    curFullYear;
    loading = false;
    tableSearch;
    getPayload = {};
    displayColumns = ['name', 'position', 'serviceLine', 'regionalOffice', 'policySection', 'questionNumber', 'actualQuestion', 'response', 'comment'];

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
        //console.log(this.fyear, this.curQuarter);
    }

    ngOnInit() {
        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        this.get('scheduleslist', {'type':'AIDView'});
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
            this.exportAsService.save(this.exportAsConfig, 'AIDReport_' + this.fyear).subscribe((res) => {
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
        const keys = { '_id':0, 'name' : 1, 'type' : 1, 'is_active' : 1, 'assignedTo' : 1  };

        this.get('schedulesfilled', {'type':'AIDView', 'status':'completed', quarter: this.fyear});
    }

    processReportData(data) {
        const tableData = [];

        data.forEach((record) => {
            const scheduleQuestions = this.getPayload['scheduleslist'].find((aid) => { 
                return aid.name == record.name 
            });
            const schedulePolicyInfo = scheduleQuestions.stepper['policyInfo'];
            const recordPolicyInfo = record.output['policyInfo'];
            const recordMainInfo = record.output['mainInfo'];

            if (scheduleQuestions && scheduleQuestions.stepper) {
                Object.keys(schedulePolicyInfo).forEach((policyQuestionCat) => {
                    schedulePolicyInfo[policyQuestionCat].forEach((questionCat, index) => {
                        if (!recordPolicyInfo[policyQuestionCat]) {
                            return false;
                        }

                        const questionRes = recordPolicyInfo[policyQuestionCat]['radioKeys'][index];
                        const questionComment = recordPolicyInfo[policyQuestionCat]['comments'][index];

                        if ((questionCat['exception'] && questionCat['exception'].indexOf(questionRes) >= 0) || questionCat['defaultException']) {
                            const pushobj = {
                                'name': record.filledByName,
                                'position': recordMainInfo['Position'],
                                'serviceLine': recordMainInfo['Service Line'],
                                'regionalOffice': recordMainInfo['Regional office'],
                                'policySection': policyQuestionCat,
                                'questionNumber': index + 1,
                                'actualQuestion': questionCat['question'],
                                'response': questionRes,
                                'comment': questionComment,
                                'exception': questionCat['exception']
                            };

                            tableData.push(pushobj);
                        }
                    });
                });
            }
        });

        this.dataSource.data = tableData;
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                this.getPayload[dataModelName] = result;

                if (dataModelName == 'schedulesfilled') {
                    this.processReportData(result);
                }
                this.loading = false;
            },
            error => {
                // Handle errors here
                
            }
        );
    }


}
