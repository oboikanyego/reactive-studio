/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ActivatedRoute, Router } from '@angular/router';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';

@Component({
    selector: 'bh-schedulesview',
    templateUrl: './schedulesview.template.html'
})

export class schedulesviewComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    Object = Object;
    getPayload = {};
    userInfo;
    minDate = new Date();
    assignedModule = {
        'assignedTo': [],
        'nominatedTo': []
    };
    scheduleName;
    scheduleInputs;
    scheduleInputRows = [];
    scheduleOutput = [];
    showNoToDeclare = false;
    action;
    curQuarter;
    updateAction;
    directorEmail;
    scheduleProgress;
    scheduleStatus;
    scheduleQuarter;
    scheduleClosingDate
    loading = false;
    assignedSearch;
    assignedByDetails;
    nothingDeclared;
    directorName;
    userEmail;
    reqCount = 0;
    queryParams = {};
    isDefaults = false;
    isAssigned = false;
    isNominated = false;

    constructor(private bdms: NDataModelService,
        private router: Router,
        private aRoute: ActivatedRoute,
        private common: commonService,
        private user: userService,
        private session: NSessionStorageService,
        private snackbar: NSnackbarService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');
        //console.log(this.queryParams);
        this.aRoute.params.subscribe((params: { cat: string, fyear: string, user: string }) => {
            this.queryParams = this.aRoute.snapshot.queryParams;
            this.scheduleName = params.cat;
            this.curQuarter = params.fyear;
            this.userEmail = params.user;
            this.assignedModule['schedule'] = this.scheduleName;

            if (!this.curQuarter) {
                this.router.navigate(['/noaccess']);
            }

            this.getStatement();
        });

        this.common.toggleSideMenu(true);
    }

    getStatement() {
        var filter, keys, scheduleFilter, scheduleKeys, assignedToFilter, assignedToKeys;

        if (this.userInfo.userRole == 'director') {
            filter = { 'userRole': 'user', 'is_active': true };
            //scheduleFilter = { name:this.scheduleName, assignedTo: {$elemMatch: {email: this.userInfo.email, quarter: this.curQuarter}}};
            assignedToFilter = { name: this.scheduleName, quarter: this.curQuarter, assignedTo: { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } };
            assignedToKeys = { '_id': 0, 'name': 1, 'type': 1, 'quarter': 1, 'closingDate': 1, 'assignedTo.$': 1, 'nominatedTo': 1 };
        } else if (this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            filter = { 'userRole': 'user', 'is_active': true };
            //scheduleFilter = { name:this.scheduleName, nominatedTo: {$elemMatch: {email: this.userInfo.email, quarter: this.curQuarter}}};
            //assignedToFilter = { name:this.scheduleName, quarter: this.curQuarter, nominatedTo: {$elemMatch: {email: this.userInfo.email, role: this.userInfo.userRole}}};
            assignedToFilter = {
                '$or': [
                    { name: this.scheduleName, quarter: this.curQuarter, 'nominatedTo': { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } },
                    { name: this.scheduleName, quarter: this.curQuarter, 'assignedTo': { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } }
                ]
            };

            assignedToKeys = { '_id': 0, 'name': 1, 'type': 1, 'quarter': 1, 'closingDate': 1, 'assignedTo': 1, 'nominatedTo': 1 };
        } else if (this.userInfo.userRole == 'admin') {
            filter = { 'userRole': 'director', 'is_active': true };
            assignedToFilter = { name: this.scheduleName, quarter: this.curQuarter };
            assignedToKeys = {};
        }

        this.loading = true;
        this.get('scheduleslist', { name: this.scheduleName }, {});
        this.get('schedulesassigned', assignedToFilter, assignedToKeys);
    }

    clickedDefaults() {
        this.updateAction = 'Defaults Saved';
        var dialogRef = this.common.openModal('defaultsSchedules', { mode: 'delete', title: 'Defaults', defaultValues: this.assignedModule['defaults'] });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {

                if (!this.isDefaults) {
                    var updateObj = {
                        'defaults': {
                            quarter: this.curQuarter,
                            value: result
                        }
                    };
                    this.update('scheduleslist', { "$push": updateObj }, { name: this.assignedModule['schedule'] }, {});
                } else {
                    this.update('scheduleslist', { "$set": { 'defaults.$.value': result } }, { name: this.assignedModule['schedule'], 'defaults.quarter': this.curQuarter }, {});
                }

                this.assignedModule['defaults'] = result;
            }
        });
    }

    validateInput(scheduleField, rowNumber, e) {
        
        if(scheduleField.validData && scheduleField.validData == 'number'){
            //this.scheduleOutput[rowNumber][scheduleField.name] = this.scheduleOutput[rowNumber][scheduleField.name].replace(/[a-zA-Z]/g, "");
        }else if (scheduleField.type == 'freeForm') {
            if (!isNaN(e.key)) {
                this.scheduleOutput[rowNumber][scheduleField.name] = this.scheduleOutput[rowNumber][scheduleField.name].replace(/[0-9]/g, "");
            }
        }
    }

    addScheduleRow() {
        var rowsLength = this.scheduleInputRows.length;

        if (Object.keys(this.scheduleOutput[(rowsLength - 1)]).length <= 1) {
            this.snackbar.openSnackBar('Please fill atleast 1 field in row ' + (rowsLength), 3000);
        } else {
            this.scheduleInputRows.push(this.scheduleInputs);
            
            let pushObj = this.assignedModule['defaults'] || {};
            this.scheduleOutput.push(pushObj);
        }
    }

    deleteScheduleRow(rowIndex, scheduleRow) {
        if (this.scheduleInputRows.length <= 1) {
            this.snackbar.openSnackBar('You must have atleast 1 row', 3000);
        } else {
            var dialogRef = this.common.openModal('confirm', { mode: 'deleteRow', title: 'Delete Row' });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.scheduleInputRows.splice(rowIndex, 1);
                    this.scheduleOutput.splice(rowIndex, 1);
                }
            });
        }
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
                if (result['closingDate'] && Object.keys(result.selected).length > 0) {
                    var updateObj = {
                        'assignedTo': [],
                        'quarter': this.curQuarter,
                        'closingDate': new Date(result['closingDate']).getTime(),
                        'assignedDate': new Date().getTime(),
                        'name': this.scheduleName,
                        'type': this.getPayload['scheduleslist'].type
                    };
                    this.assignedModule['assignedTo'] = [];

                    if (this.getPayload['schedulesassigned'].assignedTo) {
                        this.getPayload['schedulesassigned'].assignedTo.forEach(obj => {
                            if (obj.quarter !== this.curQuarter) {
                                updateObj.assignedTo.push(obj);
                            }
                        });
                    }

                    Object.keys(result.selected).forEach((value) => {
                        var pushObj = {
                            email: value,
                            role: result.selected[value].role,
                            status: result.selected[value].disable ? 'completed' : 'outstanding',
                            assignedBy: this.userInfo.email,
                            assignedByName: this.userInfo.displayName,
                            displayName: result['selected'][value].displayName
                        }
                        this.assignedModule['assignedTo'].push(result.selected[value]);
                        this.assignedModule['closingDate'] = result['closingDate'];
                        updateObj.assignedTo.push(pushObj);
                    }); //console.log(updateObj);

                    if (!this.isAssigned) {
                        this.put('schedulesassigned', updateObj);
                    } else {
                        this.update('schedulesassigned', { $set: { 'assignedTo': updateObj.assignedTo, 'closingDate': updateObj.closingDate } },
                            { name: updateObj.name, quarter: updateObj.quarter }, {});
                    }
                } else {
                    this.snackbar.openSnackBar('Please fill all necessary data', 3000);
                }
            }
        });
    }

    nominateUsers() {
        this.updateAction = 'Nominated';

        var dialog = this.common.openModal('component', {
            component: 'assignUsers',
            mode: 'nominateUsers',
            title: 'Nominate Users',
            getPayload: this.getPayload,
            assignedTo: this.assignedModule.nominatedTo,
            tableSearch: this.assignedSearch,
            'type': this.getPayload['scheduleslist'].type
            //closingDate: this.assignedModule['closingDate']
        });

        dialog.afterClosed().subscribe(result => {
            if (result && Object.keys(result.selected).length > 0) {
                this.loading = true;
                var updateObj = {
                    nominatedTo: []
                };

                var updateFilter = {
                    'quarter': this.curQuarter,
                    'name': this.scheduleName,
                    'type': this.getPayload['scheduleslist'].type
                }

                let nominatedToObj = this.getPayload['schedulesassigned'][0].nominatedTo;

                if (nominatedToObj) {
                    nominatedToObj.forEach(obj => {
                        if (obj.nominatedBy !== this.userInfo.email) {
                            updateObj.nominatedTo.push(obj);
                        }
                    });
                } //console.log(this.assignedModule['closingDate'], this.getPayload['schedulesassigned']);

                this.assignedModule['nominatedTo'] = [];
                Object.keys(result.selected).forEach((value) => {
                    var pushObj = {
                        email: value,
                        role: result.selected[value].role,
                        status: result.selected[value].disable ? 'completed' : 'outstanding',
                        assignedDate: result.selected[value].disable ? result.selected[value].assignedDate : new Date().getTime(),
                        assignedTo: this.directorEmail,
                        nominatedBy: this.userInfo.email,
                        nominatedByName: this.userInfo.displayName,
                        displayName: result['selected'][value].displayName
                    }
                    this.assignedModule['nominatedTo'].push(result.selected[value]);

                    updateObj.nominatedTo.push(pushObj);
                }); //console.log(updateObj, updateFilter);

                this.update('schedulesassigned', { $set: updateObj }, updateFilter, {});
            } else {
                //this.snackbar.openSnackBar('Please select user(s) to nominate', 3000);
            }
        });
    }

    nothingToDeclare() {
        this.updateAction = 'Declared';
        this.action = 'nothingToDeclare';
        var dialogData = {
            update: { $set: { 'assignedTo.$.status': 'completed', 'assignedTo.$.declaredDate': new Date().getTime() } },
            filter: { name: this.assignedModule['schedule'], 'quarter': this.curQuarter, 'assignedTo.email': this.userInfo.email }
        };
        var dialogRef = this.common.openModal('confirm', { mode: 'declareNo', title: 'Nothing to declare', updateData: dialogData, collection: 'scheduleslist' });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                //console.log(dialogData);
                this.loading = true;
                this.update('schedulesassigned', dialogData.update, dialogData.filter, {});
            }
        });
    }

    saveScheduleOutput() {
        this.updateAction = 'Save schedule';
        var rowsLength = this.scheduleInputRows.length;

        if (Object.keys(this.scheduleOutput[(rowsLength - 1)]).length <= 1) {
            this.snackbar.openSnackBar('Please fill all necessary fields', 3000);
        } else {
            this.loading = true;
            var updateObj = {
                modifiedDate: new Date().getTime(),
                output: this.scheduleOutput,
                status: this.scheduleStatus,
                role: this.userInfo.userRole
            }
            let userArr = this.userInfo.userRole == 'director' ? 'assignedTo' : 'nominatedTo';

            if (!this.scheduleProgress) {
                updateObj['createdDate'] = new Date().getTime();
                updateObj['name'] = this.assignedModule['schedule'];
                updateObj['quarter'] = this.scheduleQuarter;
                updateObj['assignedTo'] = this.directorEmail;
                updateObj['filledBy'] = this.userInfo.email;
                updateObj['filledByName'] = this.userInfo.displayName;
                updateObj['is_active'] = this.userInfo.is_active;
                updateObj['type'] = this.getPayload['scheduleslist'].type;
            } else {
                updateObj['filter'] = {
                    name: this.assignedModule['schedule'],
                    assignedTo: this.directorEmail,
                    quarter: this.scheduleQuarter,
                    filledBy: this.userInfo.email
                }
            }
            //console.log(updateObj);
            this.user.scheduleFill(updateObj).subscribe(res => {
                this.snackbar.openSnackBar('Saved successfully', 2000);
                this.scheduleProgress = true;
                this.loading = false;
                //this.common.navigate({path: '/home/schedules/'+this.scheduleQuarter});
            }, error => {
                this.loading = false;
                this.snackbar.openSnackBar('Unable to save.. Please try later', 2000);
            });
        }
    }

    signOffSchedule() {
        let columnLength = this.getPayload['scheduleslist'].columnsDef.length;
        let dataFilled = Object.keys(this.scheduleOutput[0]).length;

        this.scheduleOutput.forEach(object => {
            object?.Status == "Opened" || object["Current Status"] == "In Progress" || object["Result"] == "Pending" ? object["Rolling Schedule"] = true : object
        })

        if (columnLength == dataFilled) {
            var dialogRef = this.common.openModal('confirm', { mode: 'signOffSchedule', title: 'Sign Off Schedule' });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.loading = true;
                    var rowsLength = this.scheduleInputRows.length;
                    this.updateAction = 'Schedule Sign Off';
                    let updateObj = {
                        scheduleAssigned: this.getPayload['schedulesassigned'][0],
                        scheduleProgress: this.scheduleProgress,
                        scheduleDetails: this.getPayload['scheduleslist'],
                        userDetails: this.userInfo
                    };

                    if (Object.keys(this.scheduleOutput[(rowsLength - 1)]).length > 1) {
                        updateObj['scheduleOutput'] = this.scheduleOutput
                    }
                    //console.log(updateObj);

                    this.user.scheduleSignOff(updateObj).subscribe(res => {
                        this.loading = false;
                        this.snackbar.openSnackBar('Schedule Signed Off successfully', 2000);
                        this.common.navigate({ path: '/home/schedules/' + this.scheduleQuarter });
                    }, error => {
                        this.loading = false;
                        this.snackbar.openSnackBar('Unable to sign off at this moment.. Please try later', 2000);
                    });
                }
            });
        } else {
            this.snackbar.openSnackBar('Please fill all the columns for atleast 1 row', 4000);
        }
    }

    commitSchedule() {
        let columnLength = this.getPayload['scheduleslist'].columnsDef.length;
        let dataFilled = Object.keys(this.scheduleOutput[0]).length;

        if (columnLength == dataFilled) {
            var dialogRef = this.common.openModal('confirm', { mode: 'commitSchedule', title: 'Commit Schedule' });

            dialogRef.afterClosed().subscribe(result => { //console.log(result, this.scheduleStatus);
                if (result && this.scheduleStatus !== 'completed') {
                    this.updateAction = 'Committed';
                    this.loading = true;
                    let updateObj = {
                        scheduleAssigned: this.getPayload['schedulesassigned'][0],
                        scheduleProgress: this.scheduleProgress,
                        scheduleDetails: this.getPayload['scheduleslist'],
                        userDetails: this.userInfo
                    };

                    var rowsLength = this.scheduleInputRows.length;
                    if (Object.keys(this.scheduleOutput[(rowsLength - 1)]).length > 1) {
                        updateObj['scheduleOutput'] = this.scheduleOutput;
                    }

                    this.user.scheduleCommit(updateObj).subscribe(res => {
                        this.snackbar.openSnackBar('Schedule committed successfully', 2000);
                        this.common.navigate({ path: '/home/schedules/' + this.scheduleQuarter });
                        this.loading = false;
                    }, error => {
                        this.snackbar.openSnackBar('Unable to commit at this moment.. Please try later', 2000);
                        this.loading = false;
                    });
                } else if (result) {
                    this.snackbar.openSnackBar('You already committed this schedule', 2000);
                }
            });
        } else {
            this.snackbar.openSnackBar('Please fill all the columns for atleast 1 row', 4000);
        }
    }

    openHomeSchedule() {
        //console.log(table, this.scheduleDetails, this.quarter);
        this.common.navigate({
            path: 'home/schedules/' + this.curQuarter + '/' + this.scheduleName
        });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.loading = true;
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                if (dataModelName == 'scheduleslist' && result.length > 0) {
                    this.getPayload[dataModelName] = result[0];
                    this.processUsersData(curQuarterData);

                    if (this.getPayload['scheduleslist'].defaults) {
                        let defaults = this.getPayload['scheduleslist'].defaults.find(obj => {
                            return obj.quarter == this.curQuarter;
                        });

                        this.assignedModule['defaults'] = defaults && defaults.value ? defaults.value : { "120 Days": '', "150 Days": '', "180+ Days": '' };
                        this.isDefaults = defaults && defaults.value ? true : false;
                    }
                    this.loading = false;
                } else if (dataModelName == 'scheduleslist' && result.length <= 0) {
                    this.router.navigate(['/noaccess']);
                } else {
                    this.getPayload[dataModelName] = result;
                }

                if (dataModelName == 'schedulesfilled' && this.userInfo.userRole !== 'admin' && this.getPayload['scheduleslist']) {
                    this.reqCount = this.reqCount + 1;

                    if (this.getPayload[dataModelName].length <= 0 && this.userInfo.userRole == 'director' && this.reqCount <= 2 && !this.userEmail) {
                        this.processGetScheduleFilled(this.getPayload['scheduleslist'], true);
                    } else {
                        this.processScheduleOutput();
                    }

                    this.processUsersData(this.getPayload['scheduleslist']);
                    this.loading = false;
                }

                if (dataModelName == 'schedulesassigned' && this.getPayload['schedulesassigned'][0]) {
                    var curQuarterData = this.getPayload['schedulesassigned'][0];

                    let userArr = this.userInfo.userRole == 'director' ? 'assignedTo' : 'nominatedTo';
                    if (curQuarterData && (['director', 'user', 'manager'].indexOf(this.userInfo.userRole) >= 0)) {
                        this.processGetScheduleData(curQuarterData, userArr);
                    }
                    this.processAssignedUsers(curQuarterData);
                    this.loading = false;
                }
            },
            error => {
                // Handle errors here
            });
    }

    processUsersData(curQuarterData) { //console.log(curQuarterData);
        if (curQuarterData && curQuarterData.assignedTo && this.userInfo.userRole == 'admin') {
            //this.processAssignedUsers(curQuarterData)
        }

        if (curQuarterData && curQuarterData.nominatedTo && this.userInfo.userRole == 'director') {
            //this.processNominateUsers(curQuarterData);
        }
    }

    processGetScheduleData(curQuarterData, userArr) { //console.log(curQuarterData, userArr);
        let userObj = curQuarterData.assignedTo.find((obj) => { return obj.email == this.userInfo.email });
        let assignDetails = userObj;
        if (!userObj && curQuarterData.nominatedTo && curQuarterData.assignedTo) {
            userObj = curQuarterData.nominatedTo.find((obj) => { return obj.email == this.userInfo.email });
            assignDetails = curQuarterData.assignedTo.find((obj) => { return obj.email == userObj.assignedTo });
        }

        if (this.userInfo.userRole == 'director') {
            this.directorEmail = userObj.email;
            this.directorName = userObj.displayName;
            this.nothingDeclared = userObj.declaredDate ? true : false;
        } else if (this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            this.directorEmail = userObj.assignedTo;
            this.directorName = userObj.nominatedByName ? userObj.nominatedByName : userObj.assignedByName;
        }
        this.scheduleStatus = userObj.status;
        this.assignedByDetails = assignDetails;
        this.scheduleQuarter = curQuarterData.quarter;
        this.scheduleClosingDate = curQuarterData.closingDate;

        this.processGetScheduleFilled(curQuarterData);
    }

    processGetScheduleFilled(curQuarterData, noUserFilter?) {
        let filledFilters = {
            name: curQuarterData.name,
            assignedTo: this.directorEmail,
            quarter: this.scheduleQuarter,
            is_active: true
        };

        if (this.userEmail && !noUserFilter) {
            filledFilters['filledBy'] = this.userEmail
        } else if (!noUserFilter && (['director', 'user', 'manager'].indexOf(this.userInfo.userRole) >= 0)) {
            filledFilters['filledBy'] = this.userInfo.email;
        }
        this.loading = true;
        this.get('schedulesfilled', filledFilters);
    }

    processAssignedUsers(curQuarterData) {
        this.assignedModule['assignedTo'] = [];
        curQuarterData.assignedTo.forEach((value) => {
            //if(value.quarter == this.curQuarter){
            this.assignedModule['assignedTo'].push({
                email: value.email, displayName: value.displayName, role: value.role,
                disable: value.status == 'completed' ? true : false, assignedDate: value.assignedDate,
                status: value.status
            });
            //}
            this.isAssigned = true;
        });
        this.assignedModule['closingDate'] = new Date(curQuarterData.closingDate);

        if (curQuarterData.nominatedTo) {
            this.processNominateUsers(curQuarterData);
        }
    }

    processNominateUsers(curQuarterData) {
        this.assignedModule['nominatedTo'] = [];
        curQuarterData.nominatedTo.forEach((value) => { //console.log(value.filledBy, this.userInfo.email);
            if (value.nominatedBy == this.userInfo.email) {
                this.assignedModule['nominatedTo'].push({
                    email: value.email, displayName: value.displayName, role: value.role,
                    disable: value.status == 'completed' ? true : false, assignedDate: value.assignedDate,
                    status: value.status
                });
            }
            this.isNominated = true;
        });
        this.assignedModule['closingDate'] = curQuarterData.closingDate;
        //console.log(this.assignedModule['nominatedTo']);
    }

    processScheduleOutput() {
        var curQuarterData = this.getPayload['scheduleslist'];
        var schedulesFilled = this.getPayload['schedulesfilled'];
        this.scheduleInputs = curQuarterData.columnsDef;
        this.scheduleOutput = [];
        this.scheduleInputRows = [];

        if (schedulesFilled.length >= 1) {
            var filledByArr = [];
            schedulesFilled.forEach((outputObj) => {
                filledByArr.push(outputObj.filledBy);
                outputObj.output.forEach((output) => {
                    this.scheduleInputRows.push(curQuarterData.columnsDef);
                    this.scheduleOutput.push(output);
                });
            });

            this.scheduleProgress = filledByArr.indexOf(this.userInfo.email) >= 0 ? true : false;
        } else if (schedulesFilled.length == 1) {
            this.scheduleProgress = true;
            schedulesFilled[0].output.forEach((output) => {
                this.scheduleInputRows.push(curQuarterData.columnsDef);
                this.scheduleOutput.push(output);
            });
        } else {
            this.scheduleInputRows.push(curQuarterData.columnsDef);
            
            let pushObj = this.assignedModule['defaults'] || {};
            this.scheduleOutput.push(pushObj);
        }
        this.loading = false;
    }

    put(dataModelName, dataModelObject) {
        //this.mm.put(dataModelName, dataModelObject,
        this.user.genericPost(dataModelName, dataModelObject).subscribe(
            result => {
                // On Success code here
                //console.log(result);
                this.snackbar.openSnackBar(this.updateAction + ' Successfully', 3000);
                this.loading = false;
                this.redirect();
                this.sendEmails();
            }, error => {
                // Handle errors here
                this.loading = false;
                this.snackbar.openSnackBar('Error while assigning schedule.. Please try again', 3000);
            })
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
                this.snackbar.openSnackBar(this.updateAction + ' Successfully', 3000);
                this.loading = false;
                this.redirect();
                this.sendEmails();
            }, error => {
                // Handle errors here
                this.loading = false;
                this.snackbar.openSnackBar('Error while assigning schedule.. Please try again', 3000);
            })
    }

    redirect() {
        if (this.updateAction == 'Committed') {
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
            quarter: this.curQuarter,
            action: this.updateAction
        };
        data['userArr'] = this.updateAction == 'Assigned' ? this.getPayload['scheduleslist'].assignedTo : this.getPayload['scheduleslist'].nominatedTo;

        if (this.updateAction == 'Assigned' || this.updateAction == 'Nominated') {
            this.user.sendEmail(data).subscribe(res => {
                //console.log(res);
            }, err => {
                //console.log(err);
            });
        }
    }


}
