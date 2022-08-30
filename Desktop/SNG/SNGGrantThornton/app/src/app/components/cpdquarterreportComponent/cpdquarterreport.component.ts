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
    selector: 'bh-cpdquarterreport',
    templateUrl: './cpdquarterreport.template.html'
})

export class cpdquarterreportComponent extends NBaseComponent implements OnInit {
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
    tableColSpanObj = {};
    getPayload = {};
    displayColumns = ['name', 'cpdActivity', 'professionalBody', 'allocatedHours', 'completedDate', 'target', 'lastUpdated', 'certificate'];

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

        //this.get('scheduleslist', {'type':'AIDView'});
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
        //['name', 'email', 'cpdActivity', 'quarter', 'professionalBody', 'allocatedHours', 'completedDate', 'target', 'declared', 'certificate', 'comments']
        if (this.dataSource.data && this.dataSource.data.length > 0) {
            this.exportAsService.save(this.exportAsConfig, 'CPDReport_' + this.fyear).subscribe((res) => {
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

        this.get('cpdlist', { quarter: this.fyear });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                this.getPayload[dataModelName] = result;

                //if (dataModelName == 'schedulesfilled') {
                    this.processReportData(result);
                //}
                this.loading = false;
            },
            error => {
                // Handle errors here

            }
        );
    }

    processReportData(result) {
        this.dataSource.data = result;
    }


}
