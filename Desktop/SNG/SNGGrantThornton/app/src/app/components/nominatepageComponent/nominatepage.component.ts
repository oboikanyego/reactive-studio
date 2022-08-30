/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Input } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService, NSnackbarService  } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ActivatedRoute, Router } from '@angular/router';

import { commonService } from '../../services/common/common.service';
import { userService } from '../../services/user/user.service';

@Component({
    selector: 'bh-nominatepage',
    templateUrl: './nominatepage.template.html'
})

export class nominatepageComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    assignedSearch;
    assignedModule = {};
    userInfo;
    showNoToDeclare;
    @Input() data;
    @Input() scheduleName; 
    @Input() fyear;

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

        console.log(this.data, this.scheduleName, this.fyear);
    }

    /*nominateUsers(){
        this.updateAction = 'Nominated';

        var dialog = this.common.openModal('component', {
            component:'assignUsers',
            mode:'nominateUsers',
            title: 'Nominate Users',
            getPayload: this.getPayload,
            assignedTo: this.assignedModule.nominatedTo,
            tableSearch: this.assignedSearch,
            'type' : this.getPayload['scheduleslist'].type
            //closingDate: this.assignedModule['closingDate']
        });

        dialog.afterClosed().subscribe(result => {
            if(result && Object.keys(result.selected).length > 0){
                this.loading = true;
                var updateObj = {
                    nominatedTo : []
                };

                var updateFilter = {
                    'quarter' : this.curQuarter,
                    'name' : this.scheduleName,
                    'type' : this.getPayload['scheduleslist'].type
                }

                let nominatedToObj = this.getPayload['schedulesassigned'][0].nominatedTo;

                if(nominatedToObj){
                    nominatedToObj.forEach(obj => {
                        if(obj.nominatedBy !== this.userInfo.email){
                            updateObj.nominatedTo.push(obj);
                        }
                    });
                } //console.log(this.assignedModule['closingDate'], this.getPayload['schedulesassigned']);
                
                this.assignedModule['nominatedTo'] = [];
                Object.keys(result.selected).forEach((value) => {
                    var pushObj = {
                        email : value,
                        status : result.selected[value].disable ? 'completed' : 'outstanding',
                        assignedDate : result.selected[value].disable ? result.selected[value].assignedDate : new Date().getTime(),
                        assignedTo : this.directorEmail,
                        nominatedBy : this.userInfo.email,
                        nominatedByName : this.userInfo.displayName,
                        displayName : result['selected'][value].displayName
                    }
                    this.assignedModule['nominatedTo'].push(result.selected[value]);
                    
                    updateObj.nominatedTo.push(pushObj);
                }); //console.log(updateObj, updateFilter);
                
                this.update('schedulesassigned', { $set: updateObj}, updateFilter, {});
            } else {
                //this.snackbar.openSnackBar('Please select user(s) to nominate', 3000);
            }
        });
    }*/

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.mm.get(dataModelName, filter, keys, sort, pagenumber, pagesize,
            result => {
                // On Success code here
            },
            error => {
                // Handle errors here
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
            }, error => {
                // Handle errors here
            })
    }
}
