/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cpddeclarationComponent } from '../../components/cpddeclarationComponent/cpddeclaration.component';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'bh-cpdlist',
    templateUrl: './cpdlist.template.html'
})

export class cpdlistComponent extends NBaseComponent implements OnInit {
    @ViewChild('stepper', { static: true }) private stepper: MatStepper;
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;
    mm: ModelMethods;
    
    userInfo;
    dataSource;
    queryParams;
    //displayedColumns = ['course', 'date', 'subjectsCovered', 'hoursOfCPE', 'specialism'];
    displayedColumns = [];
    curListDetails = {
        name: 'CPD Development plan',
        link: '/home/cpd/developmentPlan'
    }
    showHeader = true;
    curSelected = 'developmentPlan';
    fyear;
    curQuarter;
    cpdYear;
    btnStatusLabel = 'active';
    downloadStarted = false;
    exportAsConfig: ExportAsConfig = {
        type: 'xlsx', // the type you want to download
        elementIdOrContent: 'downloadTable', // the id of html/table element
    }
    curSelectedyear;
    showActionBTNs = false;


    constructor(
        private bdms: NDataModelService,
        private router: Router,
        private aRoute: ActivatedRoute,
        private common: commonService,
        private user: userService,
        private session: NSessionStorageService,
        private scheduleSer: scheduleService,
        private snackbar: NSnackbarService,
        private exportAsService: ExportAsService,
        private dialog: MatDialog
    ) {
        super();
        this.mm = new ModelMethods(bdms);

        this.fyear = this.scheduleSer.fyear || this.scheduleSer.getFYear();
        this.curQuarter = this.scheduleSer.curQuarter || this.scheduleSer.getCurQuarter();
        this.cpdYear = this.scheduleSer.selectedFullYear || this.scheduleSer.getSelectedFullYear();
        this.curSelectedyear = this.cpdYear;

        this.scheduleSer.changeQuarter.subscribe(() => {
            this.changeQuarter();
        });

        this.showActionBTNs = this.cpdYear == new Date().getFullYear();
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        this.queryParams = this.aRoute.snapshot.queryParams;
        this.aRoute.params.subscribe((params: { cat: string }) => {
            this.queryParams = this.aRoute.snapshot.queryParams;

            this.curSelected = params.cat;
            this.processheaders();
            
            this.getStatement();
        });

    }

    processheaders() {
        this.showHeader = false;
        if (this.curSelected == 'activity') {
            this.curListDetails['name'] = 'CPD Activity';
            this.curListDetails['link'] = '/home/cpd/activity';

            this.displayedColumns = ['cpdActivity', 'professionalBody', 'allocatedHours', 'completedDate', 'declared', 'certificate', 'action'];
        } else {
            this.curListDetails = {
                name: 'CPD Development plan',
                link: '/home/cpd/developmentPlan'
            };
            
            this.displayedColumns = ['skill', 'target', 'quarter', 'lastUpdated', 'action'];
        }

        setTimeout(() => {
            this.showHeader = true;
        }, 100);
    }

    changeQuarter(e?) {
        this.curQuarter = this.scheduleSer.curQuarter; //'Q' + e.value.split('Q')[1];
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        this.fyear = this.scheduleSer.fyear; //e.value;
        this.cpdYear = this.scheduleSer.selectedFullYear;

        // if (this.curSelectedyear == this.cpdYear) {

        //     return false;
        // }

        this.curSelectedyear = this.cpdYear;
        this.getStatement();

        this.showActionBTNs = this.cpdYear == new Date().getFullYear();
    }

    getStatement(listType?) {
        this.btnStatusLabel = listType == false ? 'archived' : 'active';

        const filter = {email: this.userInfo.email, is_active: listType == false ? false : true };
        filter['quarter'] = this.fyear;
        
        this.get('cpdlist', filter);
    }

    addCPD() {
        const dialogRef = this.dialog.open(cpddeclarationComponent, {
            width: '45%',
            data: { type: this.curSelected, mode: 'add' },
            panelClass: 'cpdDeclarationModal'
        });

        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                let payload = {
                    email: this.userInfo.email,
                    createdDate: new Date(),
                    createdBy: this.userInfo.displayName,
                    year: this.cpdYear,
                    is_active: true,
                    declared: this.curSelected !== 'activity' ? true : false,
                    key: btoa(this.userInfo.email + new Date().getTime()),
                    quarter: this.fyear
                };

                payload = Object.assign(payload, res.result); 

                this.put('cpdlist', payload);           
            }
        });

    }

    editRecord(table) {
        const dialogRef = this.dialog.open(cpddeclarationComponent, {
            width: '45%',
            data: { type: this.curSelected, mode: 'edit', editData: table },
            panelClass: 'cpdDeclarationModal'
        });

        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                let payload = {
                    modifiedDate: new Date(),
                    modifiedBy: this.userInfo.displayName,
                };

                let filter = {
                    email: this.userInfo.email,
                    year: this.cpdYear,
                    key: table.key
                }

                payload = Object.assign(payload, res.result); 

                this.update('cpdlist', { $set : payload }, filter);           
            }
        });

    }

    deleteRecord(table) {
       const dialogRef = this.common.openModal('confirm', { mode: 'delete', title: 'Delete CPD' });

       dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                let filter = {
                    email: this.userInfo.email,
                    year: this.cpdYear,
                    key: table.key
                }

                this.update('cpdlist', { $set : {is_active: false} }, filter);  
            }
       });

    }

    enableRecord(table) {
       const dialogRef = this.common.openModal('confirm', { mode: 'Activate', title: 'Activate CPD' });

       dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                let filter = {
                    email: this.userInfo.email,
                    year: this.cpdYear,
                    key: table.key
                }

                this.update('cpdlist', { $set : {is_active: true} }, filter);  
            }
       });

    }

    viewFiles(table) {
       const dialogRef = this.common.openModal('viewFiles', { mode: 'view', title: 'View CPD Files', filesData: table.proofs });

        dialogRef.afterClosed().subscribe((res) => { 
            if (res && res['files']) {
                let payload = {
                    modifiedDate: new Date(),
                    modifiedBy: this.userInfo.displayName,
                };

                let filter = {
                    email: this.userInfo.email,
                    year: this.cpdYear,
                    key: table.key
                }

                payload['proofs'] = res['files']; 

                this.update('cpdlist', { $set : payload }, filter);
            }
        });

    }

    download(){
        //console.log(this.exportAsConfig);
        this.displayedColumns = ['name', 'email', 'cpdActivity', 'quarter', 'professionalBody', 'allocatedHours', 'completedDate', 'target', 'declared', 'certificate', 'comments'];
        this.downloadStarted = true;
        
        setTimeout(() => {
            if(this.dataSource.data && this.dataSource.data.length > 0){
                this.exportAsService.save(this.exportAsConfig, `cpd_${this.curSelected}_${this.btnStatusLabel}`).subscribe((res) => {
                    // save started
                    //console.log(res);
                    this.displayedColumns = ['cpdActivity', 'professionalBody', 'allocatedHours', 'completedDate', 'declared', 'certificate', 'action'];
                    this.downloadStarted = false;
                });            
            }
        }, 2000);
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.dataSource.data = result;
            },
            error => {
                // Handle errors here
                this.snackbar.openSnackBar('Unable to fetch cpd details. Please try later', 2000);
            }
        );
    }

    put(dataModelName, dataModelObject) {
        this.user.genericPost(dataModelName, [dataModelObject]).subscribe(
            result => {
                // On Success code here
                this.getStatement();
            }, error => {
                // Handle errors here
                this.snackbar.openSnackBar('Unable to save cpd details. Please try later', 2000);
            }
        );
    }

    update(dataModelName, update, filter, options?) {
        const updateObject = {
            update: update,
            filter: filter,
            options: options
        };
        this.user.genericPut(dataModelName, updateObject, filter).subscribe(
            result => {
                //  On Success code here
                this.getStatement();
            }, error => {
                // Handle errors here
                this.snackbar.openSnackBar('Unable to update cpd details. Please try later', 2000);
            }
        );
    }

    delete(dataModelName, filter) {
        this.mm.delete(dataModelName, filter,
            result => {
                // On Success code here
            }, error => {
                // Handle errors here
            })
    }
}
