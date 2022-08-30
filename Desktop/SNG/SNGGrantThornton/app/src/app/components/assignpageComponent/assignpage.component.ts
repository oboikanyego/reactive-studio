/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Input } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ActivatedRoute, Router } from '@angular/router';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';

@Component({
    selector: 'bh-assignpage',
    templateUrl: './assignpage.template.html'
})

export class assignpageComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    assignedSearch;
    userInfo;
    isAssigned;
    updateAction;
    loading;
    newAssignments = [];

    @Input() data;
    @Input() scheduleName;
    @Input() fyear;
    @Input() getPayload;
    @Input() assignedModule;


    constructor(private bdms: NDataModelService,
        private user: userService,
        private common: commonService,
        private session: NSessionStorageService,
        private snackbar: NSnackbarService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');

        //console.log(this.data, this.scheduleName, this.fyear, this.assignedModule, this.userInfo);
    }

    assignSchedule() {
        this.updateAction = 'Assigned';

        var dialog = this.common.openModal('component', {
            component: 'assignUsers',
            mode: 'assignUsers',
            title: 'Assign Users',
            getPayload: this.getPayload,
            assignedTo: this.assignedModule.assignedTo,
            closingDate: this.assignedModule['closingDate'],
            tableSearch: this.assignedSearch
        });

        dialog.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.isAssigned = this.getPayload['schedulesassigned'] && this.getPayload['schedulesassigned'].length > 0 ? true : false;

                if ((result['closingDate'] && Object.keys(result.selected).length > 0) || this.isAssigned) {
                    const updateObj = {
                        'assignedTo': [],
                        'quarter': this.fyear,
                        'closingDate': new Date(result['closingDate']).getTime(),
                        'name': this.scheduleName,
                        'type': this.getPayload['scheduleslist'].type
                    };
                    this.assignedModule['assignedTo'] = [];
                    this.assignedModule['closingDate'] = result['closingDate'];
                    //console.log(this.getPayload['scheduleslist'].assignedTo);
                    /*if (this.getPayload['schedulesassigned'].assignedTo) {
                        this.getPayload['schedulesassigned'].assignedTo.forEach(obj => {
                            if (obj.quarter !== this.fyear) {
                                updateObj.assignedTo.push(obj);
                            }
                        });
                    }*/

                    let alreadyAssigned = this.isAssigned ? this.getPayload['schedulesassigned'][0].assignedTo : [];
                    /*Object.keys(result.selected).forEach((value) => {
                        var pushObj = {
                            email: value,
                            role: result.selected[value].role,
                            status: result.selected[value].disable ? 'completed' : 'outstanding',
                            assignedBy: this.userInfo.email,
                            assignedByName: this.userInfo.displayName,
                            assignedDate: new Date().getTime(),
                            displayName: result['selected'][value].displayName
                        }

                        if (alreadyAssigned.length > 1) {
                            updateObj.assignedTo = alreadyAssigned;
                        }

                        // Find new assignment objects
                        //if (alreadyAssigned.length > 1 && alreadyAssigned.findIndex((y) => y.email == value) < 0) {
                        if (alreadyAssigned.findIndex((y) => y.email == value) < 0) {
                            this.newAssignments.push(pushObj);
                            updateObj.assignedTo.push(pushObj);
                        }

                        this.assignedModule['assignedTo'].push(result.selected[value]);
                    });*/
                    this.assignedModule['assignedTo'] = Object.values(result.selected);
                    let tempAssignedArr = alreadyAssigned.map(user => user.email);
                    let tempSelectedArr = Object.keys(result.selected);
                    let newAssignment = tempSelectedArr.filter(x => !tempAssignedArr.includes(x));
                    let unAssignment = tempAssignedArr.filter(x => !tempSelectedArr.includes(x));

                    unAssignment.forEach((user) => {
                        let userIndex = alreadyAssigned.findIndex((y) => y.email == user);
                        alreadyAssigned.splice(userIndex, 1);
                    });
                    updateObj.assignedTo = alreadyAssigned;

                    newAssignment.forEach((value) => {
                        var pushObj = {
                            email: value,
                            role: result.selected[value].role,
                            status: 'outstanding',
                            assignedBy: this.userInfo.email,
                            assignedByName: this.userInfo.displayName,
                            assignedDate: new Date().getTime(),
                            displayName: result['selected'][value].displayName
                        }

                        this.newAssignments.push(pushObj);
                        updateObj.assignedTo.push(pushObj);
                    });
                    //console.log(updateObj.assignedTo.length, Object.keys(result.selected).length, newAssignment, unAssignment);
                    //console.log(updateObj, this.newAssignments, this.isAssigned);
                    if (!this.isAssigned) {
                        this.put('schedulesassigned', updateObj);
                    } else {
                        this.update('schedulesassigned', {
                            $set : { 'assignedTo': updateObj.assignedTo, 'closingDate': updateObj.closingDate} }, 
                                                    {name: updateObj.name, quarter: updateObj.quarter}, {} );
                    }
                } else {
                    this.snackbar.openSnackBar('Please fill all necessary data', 3000);
                }
            }
        });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
            result => {
                // On Success code here
            },
            error => {
                // Handle errors here
            });
    }

    put(dataModelName, dataModelObject) {
        //this.mm.put(dataModelName, dataModelObject,
        this.user.genericPost(dataModelName, [dataModelObject]).subscribe(
            result => {
                // On Success code here
                this.snackbar.openSnackBar(this.updateAction + ' Successfully', 3000);
                this.loading = false;
                this.redirect();
                this.sendEmails();
            }, error => {
                // Handle errors here
            }
        );
    }

    update(dataModelName, update, filter, options) {
        const updateObject = {
            update: update,
            filter: filter,
            options: options
        };
        this.user.genericPut(dataModelName, updateObject, filter).subscribe(
            result => {
                //  On Success code here
                //this.loading = false;
                this.redirect();
                this.sendEmails();
                this.snackbar.openSnackBar(this.updateAction + ' Successfully', 3000);
            }, error => {
                // Handle errors here
            }
        );
    }

    redirect() {
        if (this.updateAction == 'Committed' || this.updateAction == 'Assigned') {
            this.common.navigate({ path: '/home/schedules' });
        } else if (this.updateAction == 'Schedule Sign Off') {
            this.common.navigate({ path: '/home/schedules' });
        }
        if (this.updateAction == 'Defaults Saved') {
            //this.getPayload['scheduleslist']['defaults'] = this.assignedModule['defaults'];
        }
    }

    sendEmails() {
        var data = {
            scheduleName: this.getPayload['scheduleslist'].name,
            closingDate: this.assignedModule['closingDate'],
            quarter: this.fyear,
            action: this.updateAction
        };
        data['userArr'] = this.newAssignments;

        //console.log(this.newAssignments);
        if (this.updateAction == 'Assigned' && this.newAssignments.length > 0) {
            this.user.sendEmail(data).subscribe(res => {
                //console.log(res);
            }, err => {
                //console.log(err);
            });
        }
    }
}
