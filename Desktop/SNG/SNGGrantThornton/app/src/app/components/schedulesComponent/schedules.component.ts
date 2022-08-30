/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource} from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

import { aidsdownloadComponent } from '../aidsdownloadComponent/aidsdownload.component';
import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'bh-schedules',
    templateUrl: './schedules.template.html'
})

export class schedulesComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, {static: true}) tblPaginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) tblSort: MatSort;

    mm: ModelMethods;
    object = Object;
    getPayload = {};
    curDate = new Date();
    dataSource;
    userInfo;
    displayedColumns = [];
    tableSearch;    
    fyOptions;
    quarters;
    curQuarter;
    fyear;
    updateAction;
    action;
    nominatedToObj = {};
    submittedDataObj = {};
    pageName;
    ngModelObj = {
        'selectedUser': {}
    };
    exportAsConfig: ExportAsConfig = {
        type: 'xlsx', // the type you want to download
        elementIdOrContent: 'downloadTableData', // the id of html/table element
    }

    constructor(private bdms: NDataModelService,
                private common: commonService,
                private user: userService,
                private router: Router,
                private aRoute: ActivatedRoute,
                private dialog: MatDialog,
                private session: NSessionStorageService,
                private exportAsService: ExportAsService,
                private scheduleSer: scheduleService,
                private snackbar: NSnackbarService) {
        super();
        this.mm = new ModelMethods(bdms);

        this.fyear = this.scheduleSer.fyear || this.scheduleSer.getFYear();
        this.curQuarter = this.scheduleSer.curQuarter || this.scheduleSer.getCurQuarter();

        this.scheduleSer.changeQuarter.subscribe(() => {
            this.changeQuarter();
        });
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        this.aRoute.data.subscribe(v => {
            this.pageName = v.pageName;
        });
        
        this.aRoute.params.subscribe((params: {fyear: string }) => {
            if(params.fyear){
                this.fyear = this.scheduleSer.setfYear(params.fyear ? params.fyear : this.fyear);
                this.curQuarter = this.scheduleSer.setCurQuarter('Q'+params.fyear.split('Q')[1]);

                //this.scheduleSer.fyear = this.fyear;
                //this.scheduleSer.curQuarter = this.curQuarter;
            }

            this.getStatement();
        });
        if(this.userInfo.userRole == 'admin'){
            this.displayedColumns.push('name');
            if(this.pageName == 'reviews'){
                this.displayedColumns.push('directorName', 'approved', 'closingDate', 'submittedOn', 'selectcheckbox');
            }
        } else if(this.userInfo.userRole == 'director') {
            this.displayedColumns.push('name', 'nominatedTo', 'closingDate', 'status', 'nothingDeclare');
            if(this.pageName == 'reviews'){
                this.displayedColumns = ['name', 'directorName', 'approved'];
            }
        } else if(this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            this.displayedColumns.push('name', 'closingDate', 'status');
        }

        //this.common.toggleSideMenu(true);
    }

    getStatement(){  
        var filter, keys;      

        if(this.userInfo.userRole == 'admin'){
            filter = {'is_active': true};
            keys = { '_id':0, 'name' : 1, 'type' : 1, 'is_active' : 1, 'assignedTo' : 1 , 'closingDate': 1 };
            
            /*if(this.curQuarter !== 'Q4'){
                filter['type'] = 'questionnaire';
            }*/
            if(this.pageName == 'reviews'){
                this.get('schedulesassigned', {'type':'AIDView', 'assignedTo.status':'completed', quarter: this.fyear}, keys, '', 1, 3000);
            } else {
                this.get('scheduleslist', filter, keys);
            }
        } else if(this.userInfo.userRole == 'director') {
            filter = {assignedTo: {$elemMatch: {email: this.userInfo.email, role: this.userInfo.userRole}}, quarter: this.fyear};
            keys = { '_id': 0, 'name': 1, 'type' : 1, 'assignedTo.$': 1, 'nominatedTo': 1, 'closingDate': 1 };
            
            if(this.pageName == 'reviews'){
                this.get('schedulesassigned', {'type':'AIDView', 'assignedTo.status':'completed', quarter: this.fyear}, keys, '', 1, 3000);
            } else {
                this.get('schedulesassigned', filter, keys);
            }
        } else if(this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            filter = {
                '$or': [
                    { 'nominatedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole } }, quarter: this.fyear },
                    { 'assignedTo': { '$elemMatch': { 'email': this.userInfo.email, role: this.userInfo.userRole } }, quarter: this.fyear }
                ]
            };
            keys = { '_id': 0, 'name': 1, 'type' : 1, 'nominatedTo': 1, 'assignedTo': 1, 'quarter': 1, 'closingDate': 1 };
            
            this.get('schedulesassigned', filter, keys);
        }
        this.getPayload = {};
    }

    changeQuarter(e?){
        this.curQuarter = this.scheduleSer.curQuarter; //'Q' + e.value.split('Q')[1];
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        this.fyear = this.scheduleSer.fyear; //e.value;
        
        if(this.pageName == 'reviews'){
            this.common.navigate({path: 'home/reviews/'+ this.fyear});
        } else {
            this.common.navigate({path: 'home/schedules/'+ this.fyear});
        }
        
        if(this.userInfo.userRole !== 'admin'){
            /*setTimeout(function(){
                window.location.reload();
            }); */

            this.getStatement();
            this.ngModelObj.selectedUser = {};
        }       
    }

    nothingToDeclare(table, e){

        e.stopPropagation();
        this.updateAction = 'Declared';
        this.action = 'nothingToDeclare';

        var dialogData = {
            update : {$set:{'assignedTo.$.status':'completed', 'assignedTo.$.declaredDate': new Date().getTime()}},
            filter : {name: table.name, 'quarter': this.fyear, 'assignedTo.email': this.userInfo.email}
        }; 
        var dialogRef = this.common.openModal('confirm', {mode:'declareNo', title: 'Nothing to declare', updateData: dialogData, collection: 'scheduleslist'});
        
        dialogRef.afterClosed().subscribe(result => {
            if(result){
                //console.log(dialogData, table);
                this.update('schedulesassigned', dialogData.update, dialogData.filter, {});
            }
        });
    }

    scheduleClicked(table){
        
        if(table.type == 'questionnaire'){
            this.common.navigate({path: 'home/schedules/'+ this.fyear +'/'+table.name});
        } else if (table.type == 'AIDView' && this.pageName == 'reviews'){
            this.common.navigate({path: 'home/schedulesAID/'+ this.fyear +'/'+table.name, queryParams:{mode: 'edit', user: table.directorEmail}}); 
        } else if (table.type == 'AIDView'){
            this.common.navigate({path: 'home/schedulesAID/'+ this.fyear +'/'+table.name}); 
        }
    }

    clickedOnSelection(e, table) {
        if (e.checked) {
            this.ngModelObj.selectedUser[table.directorEmail] = table;
        } else {
            delete this.ngModelObj.selectedUser[table.directorEmail];
        }
    }

    searchUsers(e){
        if(this.tableSearch && this.tableSearch.length > 1){
            this.dataSource.filter = this.tableSearch;
        } else {
            this.dataSource.filter = '';
        }
    }

    selectAllAIDs(e) {
        if (e.checked) {
            this.dataSource.data.forEach((tableRecord) => {
                this.ngModelObj.selectedUser[tableRecord.directorEmail] = tableRecord;
            });
        } else {
            this.ngModelObj.selectedUser = {}
        }
    }

    downloadTableData() {
        if (this.dataSource.data && this.dataSource.data.length > 0) {
            this.exportAsService.save(this.exportAsConfig, 'AIDReviews_' + this.fyear).subscribe((res) => {
                // save started
                //console.log(res);
            });
        }
    }

    downloadAIDs() {
        if (Object.keys(this.ngModelObj.selectedUser).length <= 0) {
            this.snackbar.openSnackBar('No reviews selected to download');

            return false;
        }

        this.dialog.open(aidsdownloadComponent, {
            width: '75%',
            data: {
                quarter: this.fyear,
                selectedUsers: this.ngModelObj.selectedUser
            },
            panelClass: 'downloadAIDs',
            disableClose: true
        });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.getPayload[dataModelName] = result;

                if (['director', 'manager', 'user'].indexOf(this.userInfo.userRole) >= 0 && this.pageName !== 'reviews') {
                    this.dataSource.data = result;
                    this.processSchedulesData(this.getPayload[dataModelName]);
                } else if (this.pageName == 'reviews') {
                    if (dataModelName == 'schedulesassigned') {
                        this.processAdminReviewData(this.getPayload['schedulesassigned']);
                    } else if (dataModelName == 'schedulesfilled') {
                        this.processSchedulesFilledData();
                    }
                } else {
                    this.dataSource.data = result;
                }
            },
            error => {
                // Handle errors here
            }
        );
    }

    processSchedulesData(data){
        data.forEach((obj) => {
            let filteredNominations = [];

            const assignedObj = obj.assignedTo ? obj.assignedTo.find((obj) => { return obj.email == this.userInfo.email}) : undefined;
            const nominatedObj = obj.nominatedTo ? obj.nominatedTo.find((obj) => { return obj.email == this.userInfo.email}) : undefined;
            if(assignedObj){
                obj.status = assignedObj.status;
            } else if(nominatedObj) {
                obj.status = nominatedObj.status;
            }
            
            if(obj.nominatedTo){
                filteredNominations = obj.nominatedTo.filter(nomination => {
                    if(nomination.nominatedBy == this.userInfo.email){
                        return nomination;
                    }
                });                
            }
            this.nominatedToObj[obj.name] = filteredNominations;
        }); 
        this.dataSource.data = data;
    }

    processAdminReviewData(data){
        let rowsArr = [];
        let directorEmailArr = [];
        data.forEach((obj) => {
            obj.assignedTo.forEach((director) => {
                //console.log(director, obj);
                let rowObj = {
                    'name': obj.name,
                    'quarter': this.fyear,
                    'type': obj.type,
                    'directorEmail': director.email,
                    'directorName': director.displayName,
                    'closingDate': obj.closingDate,
                    'submittedOn': new Date(),
                    'status': director.approvedDetails ? 'Approved' : 'Not Approved'
                };

                if(director.status == 'completed'){
                    rowsArr.push(rowObj);
                    directorEmailArr.push(director.email);
                }                
            });
        }); //console.log(rowsArr);
        this.dataSource.data = rowsArr;

        this.user.getSchedulesfilledData([{ quarter: this.fyear, filledBy: { $in: directorEmailArr } }, {filledBy: 1, modifiedDate: 1}]).subscribe((res) => {
            //console.log(res);
            this.getPayload['schedulesfilled'] = res;
            this.processSchedulesFilledData();
        }, error => {
            this.snackbar.openSnackBar('Unable to fetch submitted dates');
        });

        //this.get('schedulesfilled', { quarter: this.fyear, filledBy: { $in: directorEmailArr } }, {filledBy: 1, modifiedDate: 1});
    }

    processSchedulesFilledData() {
        const filledByArr = this.getPayload['schedulesfilled'];

        filledByArr.forEach(filledObj => {
            this.submittedDataObj[filledObj.filledBy] = filledObj.modifiedDate;
        });
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
                this.snackbar.openSnackBar(this.updateAction+' Successfully', 3000);
            }, error => {
                // Handle errors here
                this.snackbar.openSnackBar('Error while assigning schedule.. Please try again', 3000);
            }
        );
    }

}
