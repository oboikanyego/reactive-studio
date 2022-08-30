/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges, SimpleChange } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSessionStorageService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { MatTableDataSource } from '@angular/material/table';

import { commonService } from '../../services/common/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'bh-listtable',
    templateUrl: './listtable.template.html'
})

export class listtableComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, {static: true}) tblPaginator: MatPaginator;
    @ViewChild(MatSort, {static: true}) tblSort: MatSort;

    mm: ModelMethods;
    @Input() nominatedToList;
    @Input() scheduleDetails;
    @Input() quarter;
    private _nominatedToList;
    dataSource;
    userInfo;

    constructor(private bdms: NDataModelService,
                private session: NSessionStorageService,
                private common: commonService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        //console.log(this.scheduleDetails, this.quarter);
        this.userInfo = this.session.getValue('userInfo');

        this.dataSource = new MatTableDataSource();
        this.dataSource.paginator = this.tblPaginator;
        this.dataSource.sort = this.tblSort;

        if(this.nominatedToList){
            this.dataSource.data = this.nominatedToList;
        }
    }
    
    ngOnChanges(changes: SimpleChanges) {        
        this.nominatedToList = changes.nominatedToList ? changes.nominatedToList.currentValue : [];
        if(this.dataSource){
            this.dataSource.data = this.nominatedToList;
        }
    }

    searchTable(e){
        if(e.target.value.length > 1){
            this.dataSource.filter = e.target.value;
        } else {
            this.dataSource.filter = '';
        }
    }

    openNomineeSchedule(table){
        //console.log(table, this.scheduleDetails, this.quarter);
        this.common.navigate({
            path: 'home/schedules/'+ this.quarter +'/'+ this.scheduleDetails.name+'/'+table.email,
            queryParams: { name: table.displayName }
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

    getById(dataModelName, dataModelId) {
        this.mm.getById(dataModelName, dataModelId,
            result => {
                // On Success code here
            },
            error => {
                // Handle errors here
            })
    }

    put(dataModelName, dataModelObject) {
        this.mm.put(dataModelName, dataModelObject,
            result => {
                // On Success code here
            }, error => {
                // Handle errors here
            })
    }

    validatePut(formObj, dataModelName, dataModelObject) {
        this.mm.validatePut(formObj, dataModelName, dataModelObject,
            result => {
                // On Success code here
            }, error => {
                // Handle errors here
            })
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

    delete (dataModelName, filter) {
        this.mm.delete(dataModelName, filter,
            result => {
                // On Success code here
            }, error => {
                // Handle errors here
            })
    }

    deleteById(dataModelName, dataModelId) {
        this.mm.deleteById(dataModelName, dataModelId,
            result => {
                // On Success code here
            }, error => {
                // Handle errors here
            })
    }

    updateById(dataModelName, dataModelId, dataModelObj) {
        this.mm.updateById(dataModelName, dataModelId, dataModelObj,
            result => {
                // On Success code here
            }, error => {
                // Handle errors here
            })
    }


}
