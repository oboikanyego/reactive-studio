/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Inject, Optional } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { userService } from '../../services/user/user.service';
import { scheduleService } from '../../services/schedule/schedule.service';

@Component({
    selector: 'bh-cpddeclaration',
    templateUrl: './cpddeclaration.template.html'
})

export class cpddeclarationComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;

    cpdForm: FormGroup;
    buttonLabel = 'Add';
    uploadFilesSel;
    fileNotUploaded = false;
    static data;
    validateDates = {
        minTargetDate: new Date(),
        minCompDate: new Date()
    };
    curDate = new Date();
    showCPDForm = false;

    constructor(private bdms: NDataModelService,
        private snackbar: NSnackbarService,
        private router: Router,
        private session: NSessionStorageService,
        private fb: FormBuilder,
        private user: userService,
        private scheduleSer: scheduleService,
        public dialogRef: MatDialogRef<cpddeclarationComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {

        this.buildCPDForm();
    }

    buildCPDForm() {
        const data = this.data;
        const editData = data.editData || {};

        let disableFields = data.mode == 'edit' && data.type == 'activity';
        let formFields = {
            skill:  new FormControl({value: editData.skill || '', disabled: disableFields}, [Validators.required]),
            targetDate: new FormControl({value: editData.targetDate || '', disabled: disableFields},[Validators.required])
        };

        if (data.type == 'activity') {
            this.buttonLabel = 'Save';

            const additionalFields = {
                professionalBody: new FormControl({value: editData.professionalBody || '', disabled: false}, Validators.required),
                allocatedHours: new FormControl({value: editData.allocatedHours || '', disabled: false}, Validators.required),
                completedDate: new FormControl({value: editData.completedDate || '', disabled: false}, Validators.required),
                proofs: new FormControl({value: editData.proofs || '', disabled: false}),
                comments: new FormControl({value: editData.comments || '', disabled: false})
            };

            formFields = Object.assign(formFields, additionalFields);
        }
        this.validateDates['maxCompDate'] = new Date(this.curDate.getFullYear(), 11, 31);
        //this.validateDates.minCompDate = new Date(new Date(editData.targetDate));
        this.validateDates['maxTargetDate'] = new Date(this.curDate.getFullYear(), 11, 31);
        this.cpdForm = this.fb.group(formFields);
        this.showCPDForm = true;
    }

    getFileDetails(e) {
        let files = e.target.files;

        /* Concatnating filenames */
        let fileName = '';
        Object.keys(files).forEach((file) => {
            fileName += `${files[file].name}, `;
        });
        this.uploadFilesSel = fileName;
        this.fileNotUploaded = true;
    }

    uploadAFile() {
        const target = document.querySelector('#CPDFileInput');
        const files = target['files'];
        let filesCount = 0; //files.length;

        if (!files || files.length <= 0) {
            this.snackbar.openSnackBar('Unable to fetch cpd details. Please try later', 2000);
            return false;
        }

        const formData = new FormData();
        Object.keys(files).forEach((file, index) => {
            formData.append('filesCPD' + index, files[file]);
        });

        this.user.uploadAFile(formData).subscribe((res) => {
            if (res && res['files'] && res['success']) {
                const filePayload = this.data.editData ? this.data.editData.proofs || [] : [];
                res['files'].forEach((file) => {
                    filePayload.push(this.scheduleSer.formatFileObj(file));
                });
                this.cpdForm.patchValue({proofs: filePayload});
                this.fileNotUploaded = false;
                this.dialogRef.close({ result: this.cpdForm.value });
            }
        }, error => {
            this.snackbar.openSnackBar('Error while uploading file');
        });

        //this.scheduleOutput['']
    }

    removeFile(proof) {
        
    }

    onNoClick() {
        this.dialogRef.close();
    }
}
