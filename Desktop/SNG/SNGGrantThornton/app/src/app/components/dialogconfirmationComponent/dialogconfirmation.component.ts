/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Inject, Optional } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Router } from '@angular/router';
import { scheduleService } from '../../services/schedule/schedule.service';
import { userService } from '../../services/user/user.service';

@Component({
    selector: 'bh-dialogconfirmation',
    templateUrl: './dialogconfirmation.template.html'
})

export class dialogconfirmationComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    Object = Object;
    dialogData;
    typeIndex;
    metaData = ['form', 'confirm', 'text', 'content'];
    action;
    rejectComments;
    defaultsOutput = {
        '120 Days' : '',
        '150 Days' : '',
        '180+ Days' : ''
    };
    selectedRole;
    userInfo;

    static data;

    constructor(private bdms: NDataModelService,
                private snackbar : NSnackbarService,
                private router : Router,
                private scheduleSer: scheduleService,
                private user: userService,
                private session: NSessionStorageService,
                public dialogRef: MatDialogRef<dialogconfirmationComponent>,
                @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        super();
        this.mm = new ModelMethods(bdms);

        this.userInfo = session.getValue('userInfo');
    }

    ngOnInit() {

        if(this.data.type == 'defaultsSchedules' && this.data.data.defaultValues){
            this.defaultsOutput = this.data.data.defaultValues;
        }
    }

    confirmYes(){
        var data = this.data.data;
        var doMode = (data.mode == 'delete' || data.mode == 'activate') ? true : false;
        this.action = data.mode == 'delete' ? 'De-activate' : 'Activate';
        
        if(data && doMode && data.collection == 'registeredusers'){
            var is_active = data.mode == 'delete' ? false : true;
            this.update(data.collection, {$set:{'is_active': is_active}}, {email: data.tableData.email}, {});
            this.dialogRef.close();
        } else if(data && data.collection == 'scheduleslist'){
            this.update(data.collection, data.updateData.update, data.updateData.filter, {});
            this.dialogRef.close();
        } else {
            this.dialogRef.close();
        }
    }

    selectedRoleFN(e) {
        this.selectedRole = e.value;
    }

    onNoClick() {

        if (this.data.type == 'viewFiles') {
            this.dialogRef.close({files: this.data.data.filesData});

            return false;
        }
        this.dialogRef.close();
    }

    saveDefaults(){
        
    }

    viewFile(file) {
        window.open(this.user.viewAFile(file), '', 'left=0,top=0,width=700,height=500,toolbar=0,scrollbars=0,status =0');
    }

    deleteFile(file, i) {
        this.user.deleteAFile(file).subscribe((res) => {
            if (res && res['success']) {
                this.data.data.filesData.splice(i, 1);
                //this.saveData();
            }
        }, error => {
            this.snackbar.openSnackBar('Unable to delete the file.. Please try again..');
        });
    }


    update(dataModelName, update, filter, options) {
        const updateObject = {
            update: update,
            filter: filter,
            options: options
        };
        this.mm.update(dataModelName, updateObject,
            result => {
                //  On Success code here
                if(this.data.data.collection == 'registeredusers'){
                    this.snackbar.openSnackBar('User ' + this.action + 'd successfully', 2000);
                    this.router.navigate(['/home/users/director']);
                } else if(this.data.data.collection == 'scheduleslist'){
                    this.router.navigate(['/home/schedules']);
                }
            }, error => {
                // Handle errors here
                if(this.data.data.collection == 'registeredusers'){
                    this.snackbar.openSnackBar('Unable to ' + this.action + ' user. Please try later', 2000);
                    this.router.navigate(['/home/users/director']);
                } else if(this.data.data.collection == 'scheduleslist'){
                    this.router.navigate(['/home/schedules']);
                }
            })
    }
}
