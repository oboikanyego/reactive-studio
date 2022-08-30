/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Optional, Inject } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';

import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';

@Component({
    selector: 'bh-aidsdownload',
    templateUrl: './aidsdownload.template.html'
})

export class aidsdownloadComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    
    exportAsConfig: ExportAsConfig;
    requiredAIDs = [
        "Annual Independence Declaration - Professional Employees",
        "Annual Independence Declaration - Manager",
        "Annual Independence Declaration - Director"
    ];
    requiredDeclarationData = [];
    selectedQuarter;
    getPayload = {};
    datasource = [];
    downloadStatus = {};
    displayedColumns = ['directorName', 'name', 'approved', 'status'];
    aidStepperMapping = {};
    downloadFileType: string = 'pdf';

    constructor(private bdms: NDataModelService,
                private user: userService,
                private scheduleSer: scheduleService,
                private exportAsService: ExportAsService,
                public dialogRef: MatDialogRef<aidsdownloadComponent>,
                @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        this.processInputData();
    }

    processInputData() {
        this.selectedQuarter = this.data['quarter'];
        //this.requiredDeclarationData = Object.keys(this.data['selectedUsers']);
        Object.keys(this.data['selectedUsers']).forEach((user) => {
            this.requiredDeclarationData.push(user);
            //this.requiredAIDs.push(this.data['selectedUsers'][user]['name']);
            this.downloadStatus[user] = 'Pending';
            this.datasource.push(this.data['selectedUsers'][user]);
        });
        this.getPayload['totalRecords'] = this.datasource.length;
        this.getPayload['downloadedRecords'] = 0;

        this.get('scheduleslist', {name: { $in: this.requiredAIDs }});
    }

    processAIDStepper() {
        this.getPayload['scheduleslist'].forEach((aid) => {
            this.aidStepperMapping[aid.name] = aid.stepper;
        });
        this.get('schedulesfilled', {quarter: this.selectedQuarter, filledBy: { $in: this.requiredDeclarationData }});
    }

    processAIDFilled(index?, fileType?) {
        index = index || 0;

        this.downloadFileType = fileType || this.downloadFileType;
        const schedulesFilledRes = this.getPayload['schedulesfilled'];

        if (index >= schedulesFilledRes.length) {
            return false;
        } else {
            this.downloadFn(schedulesFilledRes[index], index, this.downloadFileType);
        }

    }

    downloadFn(result, index, fileType) {
        const item = result.output;
        const htmlData = this.scheduleSer.pdfHtmlAID(item, this.aidStepperMapping[result.name]['policyInfo'],{
            name: result.name,
            quarter: this.selectedQuarter,
            email: result.filledBy
        });

        document.getElementById('downloadDivPDF').innerHTML = htmlData;  

        this.exportAsConfig = {
            'type': fileType || 'pdf', // the type you want to download
            elementIdOrContent: 'downloadDivPDF', // the id of html/table element
            options: {
                margin: 5,
                pagebreak: { mode: 'avoid-all' }
            }
        }

        this.exportAsService.save(this.exportAsConfig, result.filledBy + '_' + this.selectedQuarter).subscribe((res) => {
            //     // save started
            //     //console.log(res);
        }); 

        setTimeout((res) => {
            this.downloadStatus[result.filledBy] = 'Completed';
            document.getElementById('downloadDivPDF').innerHTML = '';

            this.processAIDFilled(index + 1);
            this.getPayload['downloadedRecords'] = index + 1;
        }, 3000); 
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        //this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                this.getPayload[dataModelName] = result;

                if (dataModelName == 'schedulesfilled') {
                    //this.processAIDFilled();
                } else if (dataModelName == 'scheduleslist') {
                    this.processAIDStepper();
                }
            },
            error => {

            }
        );
    }
}
