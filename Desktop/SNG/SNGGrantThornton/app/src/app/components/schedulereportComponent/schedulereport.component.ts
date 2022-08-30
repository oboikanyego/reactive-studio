/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { MatTableDataSource } from '@angular/material/table';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
    selector: 'bh-schedulereport',
    templateUrl: './schedulereport.template.html'
})

export class schedulereportComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    object = Object;
    userInfo;
    curDate = new Date();
    loading = false;
    fyOptions;
    quarters;
    curQuarter;
    fyear;
    queryParams;
    getPayload = {
        scheduleNames: []
    };
    scheduleByDirector = [];
    scheduleOutput = [];
    curSchedule;
    schedulesFormatted = {};
    schedulesFormattedOutput = {};
    exportAsConfig: ExportAsConfig = {
        'type': 'xlsx', // the type you want to download
        'elementIdOrContent': 'downloadTable', // the id of html/table element
    };
    dataSource;
    displayColsTypes = {};
    directorsArr = {};
    updateAction;
    diffCol = 2;


    constructor(private bdms: NDataModelService,
        private common: commonService,
        private router: Router,
        private snackbar: NSnackbarService,
        private session: NSessionStorageService,
        private aroute: ActivatedRoute,
        private scheduleSer: scheduleService,
        private user: userService,
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
        this.dataSource.filterPredicate = (data: Element, filter: string) => {
            //console.log(data, filter);
            //let fileterData = '';
            if (filter.length > 0) {
                //data.director == filter;
                /*filter.forEach(value => {
                    return data.director == value;
                });*/
            } else {
                return true;
            }
        };

        this.userInfo = this.session.getValue('userInfo');
        this.queryParams = this.aroute.snapshot.queryParams;
        //console.log(this.aroute.snapshot, this.queryParams, this.aroute.snapshot.url[0].path);

        if (this.queryParams && this.queryParams.quarter) {
            this.curQuarter = this.scheduleSer.setCurQuarter('Q' + this.queryParams.quarter.split('Q')[1]);
            this.fyear = this.scheduleSer.setfYear(this.queryParams.quarter);
        }
        this.loading = true;
        //this.get('scheduleslist', {'assignedTo': {$elemMatch :{ quarter : this.fyear}}, 'is_active': true}, {'_id': 0, 'assignedTo': 1, 'name': 1, 'columnsDef':1, });
        this.get('schedulesfilled', { 'quarter': this.fyear, 'type': 'questionnaire', 'role': 'director' }, {}, { 'name': 1 }, 1, 3000);
        //this.get('registeredusers', {'userRole': 'director', 'is_active': true});
    }

    changeQuarter(e?) {
        this.curQuarter = this.scheduleSer.curQuarter;
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        this.fyear = this.scheduleSer.fyear;

        this.router.navigate(['home', 'reports'], { queryParams: { 'quarter': this.fyear } }); //?quarter'+ 

        if (this.userInfo.userRole == 'admin') {
            setTimeout(function () {
                window.location.reload();
            });
        }
    }

    validateInput(tableRow, colName, rowNumber, colNumber, e) {
        let diffCol = this.diffCol;
        //console.log(tableRow, rowNumber, colNumber, e, this.displayColsTypes[this.curSchedule][colNumber-1].type);
        if (this.displayColsTypes[this.curSchedule][colNumber - diffCol].type == 'freeForm' && this.displayColsTypes[this.curSchedule][colNumber - diffCol].validData == 'number') {

        } else if (this.displayColsTypes[this.curSchedule][colNumber - diffCol].type == 'freeForm') {
            if (!isNaN(e.key)) {
                tableRow[colName] = tableRow[colName].replace(/[0-9]/g, "");
            }
        }
    }

    download() {
        if (this.dataSource.data && this.dataSource.data.length > 0) {
            let fileName = `${this.curSchedule.substring(0,23)}_${this.fyear}`;
            
            this.exportAsService.save(this.exportAsConfig, `${this.curSchedule.substring(0,19)}_${this.fyear}`).subscribe((res) => {
                // save started
                //console.log(res);
            });
        }
    }

    scheduleByDirectorFn() {
        console.log(this.dataSource, this.scheduleByDirector);
        /*this.dataSource.filterPredicate = (data, filter) =>
            (data.name.indexOf(filter) !== -1 || data.id.indexOf(filter) !== -1 );
        };*/
        this.dataSource.filter = this.scheduleByDirector;
    }

    scheduleChange() {
        this.dataSource.data = this.schedulesFormattedOutput[this.curSchedule];
    }

    getRowSpan(table, rowIndex) {
        //console.log(table, rowIndex, this.directorsArr[this.curSchedule][table.email].rowSpan, this.directorsArr[this.curSchedule][table.email].startAt);
        return true;
    }

    getShowCell(table, rowIndex, colIndex, columnName) {
        //console.log(this.directorsArr[this.curSchedule][table.email].startAt, rowIndex, this.curSchedule, table.email);
        return this.directorsArr[this.curSchedule][table.email].startAt == rowIndex ? true : false;
    }

    saveSchedule(table) {
        this.updateAction = 'Data saved';

        var dialogRef = this.common.openModal('confirm', { mode: 'saveSchedule', title: 'Save data' });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let data = this.dataSource.data;
                let rowSpan = this.directorsArr[this.curSchedule][table.email].rowSpan;
                let startAt = this.directorsArr[this.curSchedule][table.email].startAt;
                let saveData = this.dataSource.data.slice(startAt, (rowSpan + startAt));

                let updateObj = {
                    'output': saveData
                }

                let filter = {
                    filledBy: table.email,
                    name: this.curSchedule,
                    quarter: this.fyear,
                }

                this.update('schedulesfilled', { '$set': updateObj }, filter, {});
            }
        });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {

        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.getPayload[dataModelName] = result;

                if (dataModelName == 'schedulesfilled' && result.length > 0) {
                    this.getPayload[dataModelName].forEach((value) => {
                        if (!this.directorsArr[value.name]) {
                            this.directorsArr[value.name] = {};
                        }
                        this.directorsArr[value.name][value.filledBy] = {
                            email: value.filledBy,
                            displayName: value.filledByName
                        };
                        if (this.getPayload.scheduleNames.indexOf(value.name) < 0) {
                            this.getPayload.scheduleNames.push(value.name);
                        }
                    });
                    this.scheduleFilledData();
                    //this.loading = true;
                    this.get('scheduleslist', { 'name': { '$in': this.getPayload.scheduleNames } }, { 'columnsDef': 1, 'name': 1 }, '', 1, 3000);
                }

                if (dataModelName == 'scheduleslist' && result.length > 0) {
                    this.getPayload[dataModelName].forEach((value) => { //console.log(value);
                        this.schedulesFormatted[value.name] = {
                            columnsDef: ['action', 'director', ...value.columnsDef.map(column => column.name)]
                        };
                        this.displayColsTypes[value.name] = value.columnsDef;
                    });
                    this.loading = false;
                    //console.log(this.schedulesFormattedOutput, this.schedulesFormatted, this.getPayload.scheduleNames);
                }
                this.loading = false;
            },
            error => {
                // Handle errors here
            });
    }

    scheduleFilledData() {
        let prevDirector = '';
        this.getPayload['schedulesfilled'].forEach((scheduleObj) => {
            let scheduleOutput = scheduleObj.output;

            if (scheduleOutput) {
                scheduleOutput.forEach((outputObj, index) => {
                    if (this.directorsArr[scheduleObj.name] && this.directorsArr[scheduleObj.name][scheduleObj.filledBy]) {
                        if (index == 0) {
                            outputObj['director'] = this.directorsArr[scheduleObj.name][scheduleObj.filledBy].displayName;
                            outputObj['action'] = '';
                        } //console.log(index, outputObj);
                        outputObj['email'] = this.directorsArr[scheduleObj.name][scheduleObj.filledBy].email;
                        this.directorsArr[scheduleObj.name][scheduleObj.filledBy]['rowSpan'] = scheduleOutput.length;
                        this.directorsArr[scheduleObj.name][scheduleObj.filledBy]['startAt'] = this.schedulesFormattedOutput[scheduleObj.name] ? this.schedulesFormattedOutput[scheduleObj.name].length : 0;
                    }
                });
                prevDirector = scheduleObj.filledBy;
            }

            if (this.schedulesFormattedOutput[scheduleObj.name]) {
                this.schedulesFormattedOutput[scheduleObj.name] = [...this.schedulesFormattedOutput[scheduleObj.name], ...scheduleOutput];
            } else {
                this.schedulesFormattedOutput[scheduleObj.name] = scheduleOutput;
            }
            this.curSchedule = scheduleObj.name;
        }); //console.log(this.schedulesFormattedOutput[this.curSchedule], this.directorsArr[this.curSchedule]);
        this.dataSource.data = this.schedulesFormattedOutput[this.curSchedule];
    }

    update(dataModelName, update, filter, options) {
        const updateObject = {
            update: update,
            filter: filter,
            options: options
        };
        
        //this.mm.update(dataModelName, updateObject,
        this.user.genericPut(dataModelName, updateObject, filter).subscribe(
            result => {
                //  On Success code here
                this.snackbar.openSnackBar(this.updateAction + 'successfully', 3000);
            }, error => {
                // Handle errors here
                this.snackbar.openSnackBar('Unable to process your request at this moment.. Please try later', 3000);
            }
        );
    }
}
