/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Input } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { userService } from '../../services/user/user.service';
import { commonService } from '../../services/common/common.service';

@Component({
    selector: 'bh-userform',
    templateUrl: './userform.template.html'
})

export class userformComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    userRoles;
    departmentOption;
    userForm : FormGroup;
    userData;
    mode;
    @Input() dialog;
    @Input() data;
    loading = false;
    selectedRole;
    adminInfo;
    showDepartment;

    constructor(private bdms: NDataModelService,
                private formBuilder: FormBuilder,
                private snackBar: NSnackbarService,
                private session: NSessionStorageService,
                private user: userService,
                private common: commonService) {
        super();
        this.mm = new ModelMethods(bdms);

        this.userForm = formBuilder.group({
            email: ['',[Validators.required, Validators.email]],
            firstName: ['',[Validators.required, Validators.pattern(/^[a-zA-Z]{1,15}$/)]],
            lastName: ['',[Validators.required, Validators.pattern(/^[a-zA-Z]{1,15}$/)]],
            mobile: ['',[Validators.pattern(/^[0-9 ]{10}$/)]],
            userRole: ['',[Validators.required]],
            department: ['']
        });
        this.adminInfo = this.session.getValue('userInfo');
    }

    ngOnInit() {
        this.userRoles = [
            {optionData: 'Admin', value: 'admin'},
            {optionData: 'Director', value: 'director'},
            {optionData: 'Manager', value: 'manager'},
            {optionData: 'Other users', value: 'user'},
        ];

        this.departmentOption = [
            {optionData: 'Advisory', value: 'advisory'},
            {optionData: 'Assurance', value: 'assurance'},
        ]

        this.userData = this.data.data.tableData;
        this.mode = this.data.data.mode;
        this.selectedRole = this.data.data.selectedRole;

        if(this.mode == 'edit'){
           this.showDepartment =this.userData.userRole //Shows and hide the department drop down when editing 
            this.userForm.controls['email'].setValue(this.userData.email);console.log("bk",this.showDepartment == this.userData.userRole)
            this.userForm.controls['email'].disable();
            
            this.userForm.controls['firstName'].setValue(this.userData.firstName);
            //this.userForm.controls['firstName'].disable();

            this.userForm.controls['lastName'].setValue(this.userData.lastName);
            //this.userForm.controls['lastName'].disable();

            this.userForm.controls['mobile'].setValue(this.userData.mobile);
            //this.userForm.controls['mobile'].disable();
            
            this.userForm.controls['userRole'].setValue(this.userData.userRole);
            this.userForm.controls['department'].setValue(this.userData.department);

        }
    }

    checkRole( func:any ){
        this.showDepartment = func.value
        console.log("Event",func)
    }

    saveUser(){
        console.log("Department Value", this.userForm)
        if(this.userForm.valid){
            var urlRole = 'director';
            this.loading = true;
            console.log("Department Value testing after the first Value", this.userForm)
            if(this.selectedRole !== this.userForm.value.userRole){
                urlRole = this.userForm.value.userRole;
            }

            const payload = this.user.createUserObjForPost(this.userForm.value);
            console.log("Payload", payload)
            this.user.registerUser(payload).subscribe( res => {
                this.dialog.close();
                this.loading = false;
                //console.log(urlRole, this.userForm);
                this.snackBar.openSnackBar('User registered successfully','2000');
                this.common.navigate({path:'/home/users/'+urlRole});
                console.log("user value as res", res)
            }, error => {          
                this.loading = false;      
                this.snackBar.openSnackBar(error.error,'2000');
            });
        } else {
            this.snackBar.openSnackBar('Please fill valid entries','2000');
        }
    }

    editUser(){
        if(this.userForm.valid){
            this.update('registeredusers', 
            { "$set": {
                    "userRole": this.userForm.value.userRole,
                    "firstName": this.userForm.value.firstName,
                    "lastName": this.userForm.value.lastName,
                    "mobile": this.userForm.value.mobile,
                    "displayName": this.userForm.value.firstName + " " + this.userForm.value.lastName,
                    "modifiedOn": new Date(),
                    "modifiedBy": this.adminInfo.email,
                    "department": this.userForm.value.department
                }
            } ,
            {email: this.userData.email}, {});
        } else {
            this.snackBar.openSnackBar('Please fill valid entries','2000');
        }
    }

    update(dataModelName, update, filter, options) {
        const updateObject = {
            update: update,
            filter: filter,
            options: options
        };
        this.loading = true;
        //this.mm.update(dataModelName, updateObject,
        
        this.user.genericPut(dataModelName, updateObject, filter).subscribe(
            result => {
                //  On Success code here
                this.loading = false;
                this.dialog.close();
                this.snackBar.openSnackBar('User updated successfully','2000');
                this.common.navigate({path:'/home/users/'+ this.userForm.value.userRole});
            }, error => {
                // Handle errors here
                this.loading = false;
                this.snackBar.openSnackBar(error,'2000');
            }
        );
    }


}
