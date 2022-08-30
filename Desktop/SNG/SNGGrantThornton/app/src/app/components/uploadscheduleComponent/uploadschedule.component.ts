/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import * as XLSX from 'xlsx';
type AOA = any[][];

@Component({
    selector: 'bh-uploadschedule',
    templateUrl: './uploadschedule.template.html'
})

export class uploadscheduleComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    fyear;
    curQuarter;
    curFullYear;
    curDate = new Date();
    uploadFilesSel;
    userInfo;
    disableSelection = false;
    //schedulelistRes;
    policyInfo;
    scheduleOutput;
    getPayload = {};
    enableKeys = false;


    constructor(private bdms: NDataModelService,
        private common: commonService,
        private scheduleSer: scheduleService,
        private user: userService,
        private snackbar: NSnackbarService,
        private router: Router,
        private session: NSessionStorageService) {
        super();
        this.mm = new ModelMethods(bdms);

        this.fyear = this.scheduleSer.fyear || this.scheduleSer.getFYear();
        this.curQuarter = this.scheduleSer.curQuarter || this.scheduleSer.getCurQuarter();

        this.scheduleSer.changeQuarter.subscribe(() => {
            this.changeQuarter();
        });

        this.curFullYear = this.curDate.getFullYear().toString().substring(2);
    }

    ngOnInit() {
        this.userInfo = this.session.getValue('userInfo');
    }

    changeQuarter(e?) {
        this.curQuarter = this.scheduleSer.curQuarter; //'Q' + e.value.split('Q')[1];
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        this.fyear = this.scheduleSer.fyear; //e.value;
    }

    declarationSelected(e) {
        this.disableSelection = true;

        this.get('scheduleslist', {name: e.value});
        this.get('schedulesassigned', {name: e.value, quarter: this.fyear});
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
        const target = document.querySelector('#generalInfoFileInput')
        const files = target['files'];
        
        if (files && files.length > 0) {
            let file: File = files.item(0);
            const reader: FileReader = new FileReader();
            reader.onloadend = (e: any) => {
                const bstr: string = e.target.result;
                const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true });

                /* grab first sheet */
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];

                /* save data */
                const fileData = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, dateNF: 'dd-MM-YYYY' }));

                this.processExcelData(fileData);
            };
            reader.readAsBinaryString(file);
        }
    }

    processExcelData(data) {
        const scheduleData = this.getPayload['scheduleslist'];
        const stepperData = scheduleData['stepper'];
        const mainInfo = stepperData['mainInfo']['columnsDef'];
        this.policyInfo = stepperData['policyInfo'];

        if (scheduleData['name'] !== data[0][1]) {
            this.snackbar.openSnackBar('Selected declaration is not matching with uploaded data.. Reselect and try again');
            this.disableSelection = false;

            return false;
        }

        // const mainInfoData = {
        //     "Employee Name": data[3][2],
        //     "Regional office": [data[6][2]],
        //     "Position": data[4][2],
        //     "Service Line": [data[5][2]]
        // };
        const mainInfoData = {
            "Position": data[4][2],
            "Service Line": [data[5][2]],
            "Regional office": [data[6][2]]
        };
        mainInfoData[mainInfo[0]['name']] = data[3][2]

        const policyInfoIndexObj = {
            'Member Firm Policies': -1,
            'Financial interests, including lending and depository relationships': -1,
            'Business relationships': -1,
            'Family and personal relationships': -1,
            'Employment relationships': -1,
            'Gifts and hospitality': -1,
            'Reportable Irregularities': -1,
            'Money Laundering': -1,
            'Directorships': -1,
            'Trusteeships': -1,
            'Private Professional Work': -1,
            'Other': -1,
        };

        if (scheduleData['name'] == 'Annual Independence Declaration - Manager') {
            delete policyInfoIndexObj['Directorships'];
            
            policyInfoIndexObj['Directorship'] = -1;
        } else if (scheduleData['name'] == 'Annual Independence Declaration - Director') {
            delete policyInfoIndexObj['Directorships'];
            
            policyInfoIndexObj['Fee Dependency'] = -1;
            policyInfoIndexObj['Overdue Fees'] = -1;
            policyInfoIndexObj['Litigation'] = -1;
            policyInfoIndexObj['Directorship'] = -1;
        }
        const policyInfoData = {};

        let declarationIndex = -1;
        data.forEach((mainLoop, mainIndex) => {
            mainLoop.forEach((keys, keyIndex) => {
                if (policyInfoIndexObj[keys]) {
                    policyInfoIndexObj[keys] = mainIndex;

                    policyInfoData[keys] = {
                        comments: {},
                        radioKeys: {}
                    };
                }

                if (keys == 'DECLARATION') {
                    declarationIndex = mainIndex;
                }
            });
        });

        const declarationData = {};
        if (declarationIndex >= 0) {
            declarationData["confidentiality"] = data[declarationIndex + 1][2];
            declarationData["signoff"] = {
                "0": {
                    "name": data[declarationIndex + 2][2],
                    "date": new Date(data[declarationIndex + 3][2])
                },
                "1": {},
                "2": {}
            }
        }
        this.getPayload['fillingEmail'] = data[declarationIndex + 4][2];
        this.scheduleOutput = {
            mainInfo: mainInfoData,
            policyInfo: policyInfoData,
            generalInfo: [],
            declaration: declarationData
        }

        //this.getDeclarationStructure();
        //console.log(data, policyInfoIndexObj);

        if (!this.getPayload['fillingEmail']) {
            this.snackbar.openSnackBar('No user Email ID found.. Please contact adminstrator.');

            return false;
        } else if (this.getPayload['fillingEmail'] !== this.userInfo.email) {
            this.get('registeredusers', {email: this.getPayload['fillingEmail'].toLowerCase()});
        }
        
        this.processPolicyInfoData(policyInfoIndexObj, stepperData, data);
    }

    processPolicyInfoData(policyInfoIndexObj, stepperData, data) {

        Object.keys(policyInfoIndexObj).forEach((policySection) => {
            const policySectionIndex = policyInfoIndexObj[policySection];
            const policySectionQuestionLength = stepperData['policyInfo'][policySection].length;

            let counter = 0;
            for (let i = policySectionIndex + 1; i <= (policySectionIndex + policySectionQuestionLength); i++) {
                //console.log(i, data[i + counter + 1], counter, policySection, policySectionIndex + policySectionQuestionLength);
                const pushData = data[i + counter + 1];
                if (pushData[0]) {
                    this.scheduleOutput['policyInfo'][policySection].radioKeys[counter] = pushData[0];
                }

                if (pushData[2]) {
                    this.scheduleOutput['policyInfo'][policySection].comments[counter] = pushData[2];
                }
                counter++;
            }
            //console.log(policyInfoIndexObj[policySection], stepperData['policyInfo'][policySection]);
        });

        this.getDeclarationStructure();
    }

    getDeclarationStructure() {   
        const item = this.scheduleOutput;
        const htmlData = this.scheduleSer.pdfHtmlAID(item, this.policyInfo, {
            name: this.getPayload['scheduleslist']['name'],
            quarter: this.fyear,
            email: this.getPayload['fillingEmail']
        });
        document.getElementById('downloadDivPDF').innerHTML = htmlData;

        this.enableKeys = true;
    }

    resetDeclaration() {
        this.disableSelection = false;
        this.scheduleOutput = {};
        this.enableKeys = false;
        document.getElementById('downloadDivPDF').innerHTML = '';
        document.getElementById('generalInfoFileInput').innerHTML = '';
    }

    saveDeclaration() {
        const scheduleObj = this.getPayload['schedulesassigned'];
        const assignmentObj = scheduleObj['assignedTo'] || [];
        const userObj = this.getPayload['registeredusers'] || this.userInfo;

        if (!scheduleObj || !scheduleObj['assignedTo']) {
            this.snackbar.openSnackBar('No declarations assigned for selected quarter.. Please check with administrator');

            return false;
        }
        const alreadyAssigned = assignmentObj.find((obj) => obj.email == userObj.email);

        if (alreadyAssigned) {
            //alreadyAssigned['status'] = 'completed';
            const updateObj = {
                '$set' : {
                    'assignedTo.$.status': 'completed',
                    'assignedTo.$.submittedDate' : new Date().getTime()
                }
            }

            this.update('schedulesassigned', updateObj, {
                'name': scheduleObj['name'],
                'quarter': scheduleObj['quarter'] || this.fyear,
                'assignedTo': {
                '$elemMatch': {
                        'email': userObj.email
                    }
                }
            });
        } else {
            const newAssignment = {
                //assignedBy: "shardha.jugnaik@sng.gt.com",
                //assignedByName: "Shardha Jugnaik",
                displayName: userObj.displayName,
                email: userObj.email,
                role: userObj.userRole,
                status: "completed",
                assignedDate: new Date().getTime(),
                submittedDate: new Date().getTime()
            };
            assignmentObj.push(newAssignment);

            this.update('schedulesassigned', {$set: {'assignedTo' : assignmentObj}}, {
                'name': scheduleObj['name'],
                'quarter': scheduleObj['quarter'] || this.fyear
            });
        }

        this.update('schedulesfilled', {$set: {'is_active': false}}, {
            'name': scheduleObj['name'],
            'quarter': scheduleObj['quarter'] || this.fyear,
            'filledBy': userObj.email,
            'assignedTo': userObj.email
        });

        const filledObj = {
            modifiedDate: new Date().getTime(),
            output: this.scheduleOutput,
            status: "completed",
            role: userObj.userRole
        }

        filledObj['createdDate'] = new Date().getTime();
        filledObj['name'] = scheduleObj['name'] || this.getPayload['scheduleslist']['name'];
        filledObj['quarter'] = scheduleObj['quarter'] || this.fyear;
        filledObj['assignedTo'] = userObj.email;
        filledObj['filledBy'] = userObj.email;
        filledObj['filledByName'] = userObj.displayName;
        filledObj['is_active'] = userObj.is_active;
        filledObj['role'] = userObj.userRole;
        filledObj['type'] = this.getPayload['scheduleslist'].type;
        
        setTimeout(() => {
            this.put('schedulesfilled', filledObj);
        }, 1000);
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.getPayload[dataModelName] = result[0] || {};
            },
            error => {
                // Handle errors here
            }
        );
    }

    put(dataModelName, dataModelObject) {
        //this.mm.put(dataModelName, dataModelObject,
        this.user.genericPost(dataModelName, [dataModelObject]).subscribe(
            result => {
                // On Success code here
                this.snackbar.openSnackBar('Declaration submitted and marked as completed.');
                this.resetDeclaration();
                this.router.navigate(['/home/schedules']);
            }, error => {
                // Handle errors here
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
                this.snackbar.openSnackBar('Declaration assignment updated successfully.');
            }, error => {
                // Handle errors here
            }
        );
    }


}
