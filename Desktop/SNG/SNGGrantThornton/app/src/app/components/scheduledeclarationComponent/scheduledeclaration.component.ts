/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { MatTableDataSource } from '@angular/material/table';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'bh-scheduledeclaration',
    templateUrl: './scheduledeclaration.template.html'
})

export class scheduledeclarationComponent extends NBaseComponent implements OnInit {
    @ViewChild('stepper', {static: true}) private stepper: MatStepper;
    @ViewChild(MatPaginator, {static: true}) tblPaginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) tblSort: MatSort;

    mm: ModelMethods;
    scheduleName;
    Object = Object;
    dataSource;
    displayedColumns = ['action', 'course', 'date', 'subjectsCovered', 'hoursOfCPE', 'specialism'];
    tableSampleData;

    queryParams;
    scheduleQuarter;
    userEmail;
    assignedModule: any = {};
    getPayload: any = {};
    scheduleOutput: any = {};
    userInfo;
    mainInfo: any = {};
    loading = true;
    policyQuestionCount: any = {};
    mainInfoCount;
    declarationCount: any = {};
    exceptionCount: any = {};
    curDate = new Date();
    isAssigned;
    updateAction;
    scheduleProgress;
    scheduleStatus;
    reqCount;
    directorName;
    directorEmail;
    assignedByDetails;
    scheduleClosingDate;
    nothingDeclared;


    // Policy HTTP Response
    policyResponse: any = [];
    policyInfo: any = [];
    // List of Policies
    policyInfoKeys: string[] = [];
    // List of Questions
    currentQuestions: any = [];
    selectedPolicy: string = "";
    exportAsConfig: ExportAsConfig;
    uploadFilesSel;

    declaration: any = [];


    constructor(private bdms: NDataModelService,
        private router: Router,
        private aRoute: ActivatedRoute,
        private common: commonService,
        private user: userService,
        private session: NSessionStorageService,
        private scheduleSer: scheduleService,
        private snackbar: NSnackbarService, private exportAsService: ExportAsService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        this.queryParams = this.aRoute.snapshot.queryParams;
        //console.log(this.queryParams);
        this.aRoute.params.subscribe((params: { cat: string, fyear: string, user: string }) => {
            this.queryParams = this.aRoute.snapshot.queryParams;
            this.scheduleName = params.cat;
            this.scheduleQuarter = params.fyear;
            this.userEmail = params.user ? params.user : this.queryParams.user;
            this.assignedModule['schedule'] = this.scheduleName;

            if (!this.scheduleQuarter) {
                this.router.navigate(['/noaccess']);
            }
            this.getStatement();
        });

        this.common.toggleSideMenu(true);
    }

    // Set The Current Question
    setCurrentQuestion(policy) {
        if(this.scheduleOutput['policyInfo'][policy]) {
            this.selectedPolicy = policy;
            this.currentQuestions = this.policyInfo[policy];
        }
    }

    validateInput(key?, question?, policy?, index?) {
        if (key && key == 'mainInfo') {
            this.scheduleOutput[key][question] = this.scheduleOutput[key][question].replace(/[0-9]/g, "");
        } else if (key && key == 'policyInfo') {
            if (!this.scheduleOutput[key][question][policy][index]) {
                delete this.scheduleOutput[key][question][policy][index];
            } else {
                //console.log(this.scheduleOutput[key][question][policy], key, question, policy, this.policyInfo[question][index]);
                if (this.policyInfo[question][index]['allowNumbers']) {
                    return false;
                }
                this.scheduleOutput[key][question][policy][index] = this.scheduleOutput[key][question][policy][index].replace(/[0-9]/g, "");
            }
        }
        /*else if(key && key == 'policyInfo'){
            //console.log(this.scheduleOutput[key][question][policy][index]);
            this.scheduleOutput[key][question][policy][index] = this.scheduleOutput[key][question][policy][index].replace(/[0-9]/g, "");
        } */
    }

    download(e) {
        const item = this.scheduleOutput;
        const htmlData = this.scheduleSer.pdfHtmlAID(item, this.policyInfo, {
            name: this.scheduleName,
            quarter: this.scheduleQuarter,
            email: this.userEmail
        });
        document.getElementById('downloadDivPDF').innerHTML = htmlData;
        //console.log(e);

        this.exportAsConfig = {
            'type': e.value, // the type you want to download
            elementIdOrContent: 'downloadDivPDF', // the id of html/table element
            options: {
                margin: 5,
                pagebreak: { mode: 'avoid-all' }
            }
        }

        //console.log(this.exportAsConfig);

        this.exportAsService.save(this.exportAsConfig, this.userEmail + this.scheduleQuarter).subscribe((res) => {
            //     // save started
            //     //console.log(res);
        });

        setTimeout((res) => {
            document.getElementById('downloadDivPDF').innerHTML = '';
        }, 3000);
    }

    addCPDrow() {
        let dataArr = this.dataSource.data; //
        let filterData = true;
        Object.keys(dataArr[dataArr.length - 1]).forEach((objKey) => {
            if (!dataArr[dataArr.length - 1][objKey]) {
                filterData = false;
            }
        });

        let newObj = {};
        Object.keys(this.tableSampleData).forEach((key) => {
            newObj[key] = '';
        })

        if (filterData) {
            dataArr.push(newObj);
            this.dataSource.data = dataArr;
        } else {
            this.snackbar.openSnackBar('Please fill all columns of row ' + dataArr.length, '3000');
        }
    }

    deleteCPDrow(rowIndex) {
        var dialogRef = this.common.openModal('confirm', { mode: 'deleteRow', title: 'Delete Row' });

        dialogRef.afterClosed().subscribe(result => {
            if (result && this.dataSource.data.length > 1) {
                let dataArr = this.dataSource.data;
                dataArr.splice(rowIndex, 1);

                this.dataSource.data = dataArr;
            } else if (result) {
                this.snackbar.openSnackBar('Should have atleast 1 row', 2000);
            }
        });
    }

    saveData() {
        this.updateAction = 'Save schedule';

        if (this.scheduleOutput['policyInfo']['Other']['tableData']) {
            this.scheduleOutput['policyInfo']['Other']['tableData'] = this.dataSource.data || [];
        }

        this.loading = true;
        const updateObj = {
            modifiedDate: new Date().getTime(),
            output: this.scheduleOutput,
            status: this.scheduleStatus,
            role: this.userInfo.userRole
        }

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

        if (this.userInfo.userRole !== 'admin') {
            this.user.scheduleFill(updateObj).subscribe(res => {
                this.snackbar.openSnackBar('Saved successfully', 2000);
                this.scheduleProgress = true;
                this.loading = false;
                //this.common.navigate({path: '/home/schedules/'+this.scheduleQuarter});
            }, error => {
                this.loading = false;
                this.snackbar.openSnackBar('Unable to save.. Please try later', 2000);
            });
        } else {
            this.snackbar.openSnackBar('You are not authorise to do this operation', 2000);
        }
    }

    getStatement() {
        let filter, keys, scheduleFilter, scheduleKeys, assignedToFilter, assignedToKeys;

        if (this.userInfo.userRole == 'director') {
            filter = { 'userRole': 'user', 'is_active': true };
            assignedToFilter = { name: this.scheduleName, quarter: this.scheduleQuarter, assignedTo: { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } };
            assignedToKeys = { '_id': 0, 'name': 1, 'type': 1, 'quarter': 1, 'closingDate': 1, 'assignedTo.$': 1, 'nominatedTo': 1 };
        } else if (this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            filter = { 'userRole': this.userInfo.userRole, 'is_active': true };
            //assignedToFilter = { name: this.scheduleName, quarter: this.scheduleQuarter, nominatedTo: { $elemMatch: { email: this.userInfo.email } } };
            assignedToFilter = {
                '$or': [
                    { name: this.scheduleName, quarter: this.scheduleQuarter, 'nominatedTo': { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } },
                    { name: this.scheduleName, quarter: this.scheduleQuarter, 'assignedTo': { $elemMatch: { email: this.userInfo.email, role: this.userInfo.userRole } } }
                ]
            };
            assignedToKeys = { '_id': 0, 'name': 1, 'type': 1, 'quarter': 1, 'closingDate': 1, 'assignedTo': 1, 'nominatedTo.$': 1 };
        } else if (this.userInfo.userRole == 'admin') {
            filter = { 'userRole': 'director', 'is_active': true };
        }

        if (this.userInfo.userRole == 'admin' || (this.userInfo.userRole == 'director' && this.queryParams.mode == 'edit')) {
            assignedToFilter = { name: this.scheduleName, quarter: this.scheduleQuarter };
            assignedToKeys = {};
        }

        this.get('scheduleslist', { name: this.scheduleName }, {});
        this.get('schedulesassigned', assignedToFilter, assignedToKeys);
    }

    onKey(value, key, arr) {
        let filter = value.toLowerCase();

        this.mainInfo[key] = arr.filter(option => option.toLowerCase().startsWith(filter));
    }

    getFileDetails(e) {
        let files = e.target.files;

        /* Concatnating filenames */
        let fileName = '';
        Object.keys(files).forEach((file) => {
            fileName += `${files[file].name}, `;
        });
        this.uploadFilesSel = fileName;
    }

    uploadAFile() {
        const target = document.querySelector('#generalInfoFileInput');
        const files = target['files'];
        let filesCount = 0; //files.length;

        const formData = new FormData();
        Object.keys(files).forEach((file, index) => {
            formData.append('filesAID' + index, files[file]);
        });

        this.user.uploadAFile(formData).subscribe((res) => {
            if (res && res['files'] && res['success']) {
                res['files'].forEach((file) => {
                    const filePayload = this.scheduleSer.formatFileObj(file);
                    this.scheduleOutput['generalInfo'].push(filePayload);
                });

                this.saveData();
                //filesCount = filesCount + 1;

                // const fileRes = res[fil]
                // this.scheduleOutput['generalInfo'].push({
                //     'name': files[file].name,
                //     'size': files[file].size,
                //     'type': files[file]['type'],
                //     'filepath': res['filepath'],
                //     'comments': ''
                // });
                
                // if (filesCount == files.length) {
                //     console.log(filesCount, files.length, this.scheduleOutput);
                //     this.saveData();
                // }
            }
        }, error => {
            this.snackbar.openSnackBar('Error while uploading file');
        });
        
        //this.scheduleOutput['']
    }

    viewDocument(genInfo, i) {
        //this.user.viewAFile(genInfo).subscribe((res) => {
            window.open(this.user.viewAFile(genInfo), '', 'left=0,top=0,width=700,height=500,toolbar=0,scrollbars=0,status =0');
        //}, error => {
            //this.snackbar.openSnackBar('Unable to view the file.. Please try again');
        //});
    }

    deleteDocument(genInfo, i) {
        this.user.deleteAFile(genInfo).subscribe((res) => {
            if (res && res['success']) {
                this.scheduleOutput['generalInfo'].splice(i, 1);
                this.saveData();
            }
        }, error => {
            this.snackbar.openSnackBar('Unable to delete the file.. Please try again..');
        });
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.loading = true;
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                this.getPayload[dataModelName] = result; //console.log(this.getPayload);
                if (dataModelName == 'scheduleslist') {
                    this.policyResponse = result[0];
                    this.getPayload[dataModelName] = result[0];

                    this.processScheduleList();
                    this.loading = false;
                    this.scheduleOutput['generalInfo'] = this.scheduleOutput['generalInfo'] ? this.scheduleOutput['generalInfo'] : [];
                }

                if (dataModelName == 'schedulesfilled' && this.userInfo.userRole !== 'admin' && this.getPayload['scheduleslist']) {
                    this.reqCount = this.reqCount + 1;

                    if (this.getPayload[dataModelName].length <= 0 && this.userInfo.userRole == 'director' && this.reqCount <= 2 && !this.userEmail) {
                        this.processGetScheduleFilled(this.getPayload['scheduleslist'], true);
                    } else if (this.getPayload[dataModelName].length > 0) {
                        this.processScheduleOutput();
                    }
                    this.loading = false;
                } else if (dataModelName == 'schedulesfilled' && this.userInfo.userRole == 'admin' && this.queryParams.mode == 'edit') {
                    this.processScheduleOutput();
                    this.loading = false;
                }

                if (dataModelName == 'schedulesassigned' && result[0]) { //console.log(result, this.queryParams);
                    const curQuarterData = this.getPayload['schedulesassigned'][0];

                    if (this.userInfo.userRole !== 'admin') {
                        this.processGetScheduleData(curQuarterData, 'assignedTo');
                    } else if (this.queryParams.mode == 'edit') {
                        this.processGetScheduleData(curQuarterData, 'assignedTo');
                    }

                    this.processAssignedUsers(curQuarterData);
                }
                this.loading = false;
            }, error => {
                console.log(error);
            });
    }

    processScheduleList() {
        const processedAID = this.scheduleSer.processScheduleAID(this.policyResponse);
        this.scheduleOutput = processedAID.scheduleOutput;
        this.exceptionCount = processedAID.exceptionCount;
        this.mainInfo = processedAID.mainInfo;
        this.policyQuestionCount = processedAID.policyQuestionCount;
        this.declarationCount = processedAID.declarationCount;
        this.mainInfoCount = processedAID.mainInfoCount;
        this.tableSampleData = processedAID.tableSampleData;
        this.dataSource.data = processedAID.datasourceData;

        this.policyInfo = this.policyResponse['stepper']['policyInfo'];
        this.policyInfoKeys = Object.keys(this.policyInfo);

        this.currentQuestions = this.policyInfo['Member Firm Policies'];
        //this.declaration = this.policyResponse['stepper']['declaration'];
        this.setCurrentQuestion('Member Firm Policies');
    }

    processAssignedUsers(curQuarterData) {
        this.assignedModule['assignedTo'] = [];
        curQuarterData.assignedTo.forEach((value) => {
            //if(value.quarter == this.curQuarter){
            this.assignedModule['assignedTo'].push({
                email: value.email, displayName: value.displayName,
                role: value.role,
                disable: value.status == 'completed' ? true : false, assignedDate: value.assignedDate,
                status: value.status
            });
            //}
            this.isAssigned = true;
        });
        this.assignedModule['closingDate'] = new Date(curQuarterData.closingDate); //console.log(this.assignedModule);
    }

    processGetScheduleData(curQuarterData, userArr) {
        let ethicsReview = this.queryParams.mode && this.queryParams.mode == 'edit' ? true : false;
        let searchEmail = this.userInfo.userRole !== 'admin' && !ethicsReview ? this.userInfo.email : this.userEmail;
        let userObj = curQuarterData.assignedTo.find((obj) => { return obj.email == searchEmail });
        let assignDetails = userObj;
        if (!userObj && curQuarterData.nominatedTo && curQuarterData.assignedTo) {
            userObj = curQuarterData.nominatedTo.find((obj) => { return obj.email == this.userInfo.email });
            assignDetails = curQuarterData.assignedTo.find((obj) => { return obj.email == userObj.assignedTo });
        }

        if (this.userInfo.userRole == 'director' || (this.userInfo.userRole == 'admin' && this.queryParams.mode == 'edit')) {
            this.directorEmail = userObj.email;
            this.directorName = userObj.displayName;
            this.nothingDeclared = userObj.declaredDate ? true : false;
        } else if (this.userInfo.userRole == 'user' || this.userInfo.userRole == 'manager') {
            this.directorEmail = userObj.assignedTo ? userObj.assignedTo : userObj.email;
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


        if ((this.userEmail && !noUserFilter) || (this.userInfo.userRole == 'admin' && this.queryParams.mode == 'edit')) {
            filledFilters['filledBy'] = this.userEmail
        } else if (!noUserFilter && (this.userInfo.userRole !== 'admin')) {
            filledFilters['filledBy'] = this.userInfo.email;
        }
        this.loading = true;
        this.get('schedulesfilled', filledFilters);
    }

    processScheduleOutput() {
        const curQuarterData = this.getPayload['scheduleslist'][0];
        const schedulesFilled = this.getPayload['schedulesfilled'][0]; //console.log(curQuarterData, schedulesFilled);
        this.loading = false;

        if (schedulesFilled && schedulesFilled.output) {
            this.scheduleOutput = schedulesFilled.output;
            this.dataSource.data = this.scheduleOutput['policyInfo']['Other']['tableData'] || [];
            this.scheduleProgress = true;
        }
        this.scheduleOutput['generalInfo'] = this.scheduleOutput['generalInfo'] ? this.scheduleOutput['generalInfo'] : [];
        //this.checkPolicyInfo();
    }

    checkPolicyInfo() {
        let policyCheckArr = [];
        Object.keys(this.scheduleOutput.policyInfo).forEach((policy) => {
            let radioKeys = Object.keys(this.scheduleOutput.policyInfo[policy].radioKeys).length;
            let commentKeys = Object.keys(this.scheduleOutput.policyInfo[policy].comments).length;
            let questionsLength = this.policyInfo[policy].length;
            let radioNoCount = 0;
            let radioYesCount = 0;
            let totalNos = 0;

            if (this.exceptionCount[policy]) {
                Object.keys(this.exceptionCount[policy]).forEach((key) => {
                    let checkAnswer = this.exceptionCount[policy][key].exceptionRule.indexOf(this.scheduleOutput.policyInfo[policy].radioKeys[key])
                    if (checkAnswer >= 0 && !this.scheduleOutput.policyInfo[policy].comments[key]) {
                        radioNoCount++;
                    }
                    
                    if(checkAnswer >= 0){
                        totalNos++;
                    }
                    if (checkAnswer < 0 && this.scheduleOutput.policyInfo[policy].comments[key]) {
                        radioYesCount++;
                    }
                });
            }

            if (radioNoCount > 0 || (commentKeys < radioNoCount) || (questionsLength !== (radioKeys + (commentKeys - (radioYesCount+totalNos)))) ) {
                //console.log(policy,'Total',questionsLength,'<br />TotalRadio',radioKeys,'<br />TotalComments',commentKeys,'<br />TotalNo',totalNos,'<br />TotalYes',radioYesCount, '<br />TotalNoComments',radioNoCount, '<br />Diff',radioKeys + (commentKeys - (radioYesCount+totalNos)));
            //}
            //if (questionsLength !== commentKeys) {
                this.selectedPolicy = policy;
                this.setCurrentQuestion(policy);
            } else {
                let bolVal = radioKeys + (commentKeys - (radioYesCount+totalNos)) == questionsLength ? true : false;
                //let bolVal = commentKeys == questionsLength ? true : false;

                if (policy == 'Other' && this.scheduleOutput.policyInfo[policy].tableData) {
                    let CPDtableLength = this.scheduleOutput.policyInfo[policy].tableData.length;

                    // if (CPDtableLength <= 1) {
                    //     Object.keys(this.scheduleOutput.policyInfo[policy].tableData[0]).forEach((objKey) => {
                    //         if (!this.scheduleOutput.policyInfo[policy].tableData[0][objKey]) {
                    //             bolVal = false;
                    //             this.selectedPolicy = policy;
                    //             this.setCurrentQuestion(policy);
                    //         }
                    //     });
                    // }
                }
                policyCheckArr.push(bolVal);
            }
        });


        return policyCheckArr;
    }

    checkDeclarationInfo() {
        let declarationCheckArr = [];
        Object.keys(this.scheduleOutput.declaration.signoff).forEach((declareKey) => {
            let objKeys = Object.keys(this.scheduleOutput.declaration.signoff[declareKey]).length;
            let bolVal = objKeys !== this.declarationCount.signoff[declareKey] ? false : true;

            let fillByCheck = this.policyResponse['stepper'].declaration.signoff[declareKey].fillBy;
            if (fillByCheck && fillByCheck.indexOf(this.userInfo.userRole) >= 0) {
                declarationCheckArr.push(bolVal);
            }
        });

        return declarationCheckArr;
    }

    ethicsLeaderAction(mode, title, action) {
        var dialogRef = this.common.openModal('confirm', { 'mode': mode, 'title': title });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loading = true;
                this.updateAction = title;
                let updateObj = {
                    scheduleAssigned: this.getPayload['schedulesassigned'][0],
                    scheduleProgress: this.scheduleProgress,
                    scheduleDetails: this.getPayload['scheduleslist'],
                    scheduleOutput: this.scheduleOutput,
                    userDetails: {
                        email: this.directorEmail,
                        displayName: this.directorName
                    },
                    updateAction: action,
                    approvedDetails: {
                        approvedBy: this.userInfo.email,
                        approvedByName: this.userInfo.displayName,
                        approvedDate: new Date().getTime()
                    }
                };

                this.user.scheduleApproval(updateObj).subscribe(res => {
                    this.loading = false;
                    this.snackbar.openSnackBar(this.updateAction + ' successfully', 2000);
                    this.common.navigate({ path: '/home/reviews/' + this.scheduleQuarter });
                }, error => {
                    this.loading = false;
                    this.snackbar.openSnackBar('Unable to ' + action + ' at this moment.. Please try later', 2000);
                });
            }
        });
    }

    approveAID() {
        if (this.scheduleOutput['declaration'].signoff
            && this.scheduleOutput['declaration'].signoff[2]
            && Object.keys(this.scheduleOutput['declaration'].signoff[2]).length > 0) {
            this.ethicsLeaderAction('approveAID', 'Approve Schedule', 'approve');
        } else {
            this.stepper.selectedIndex = 3;
            this.snackbar.openSnackBar('Please fill safeguard details');
        }
    }

    rejectAID() {
        this.ethicsLeaderAction('rejectAID', 'Reject Schedule', 'reject');
    }

    signOffSchedule() {
        //console.log(this.scheduleOutput);
        let policyCheckArr = this.checkPolicyInfo();
        let declarationCheckArr = this.checkDeclarationInfo();

        if (Object.keys(this.scheduleOutput.mainInfo).length !== this.mainInfoCount) {
            this.stepper.selectedIndex = 0;
            this.snackbar.openSnackBar('Please fill all necessary details');
        } else if (Object.keys(this.policyQuestionCount).length != policyCheckArr.length) {
            this.stepper.selectedIndex = 1;
            this.snackbar.openSnackBar('Please answer all questions of "' + this.selectedPolicy + '" under policy information');
        } else if (policyCheckArr.indexOf(false) >= 0) {
            this.stepper.selectedIndex = 1;
            this.snackbar.openSnackBar('Please answer all questions under policy information');
        } else if (!this.scheduleOutput.declaration.confidentiality || declarationCheckArr.indexOf(false) >= 0) {
            this.stepper.selectedIndex = 3;
            this.snackbar.openSnackBar('Please fill your declaration details');
        } else {
            var dialogRef = this.common.openModal('confirm', { mode: 'signOffSchedule', title: 'Sign Off Schedule' });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.loading = true;
                    this.updateAction = 'Schedule Sign Off';
                    let updateObj = {
                        scheduleAssigned: this.getPayload['schedulesassigned'][0],
                        scheduleProgress: this.scheduleProgress,
                        scheduleDetails: this.getPayload['scheduleslist'],
                        scheduleOutput: this.scheduleOutput,
                        userDetails: this.userInfo
                    };

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
        }

    }

}
