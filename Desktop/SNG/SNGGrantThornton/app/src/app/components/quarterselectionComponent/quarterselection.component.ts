/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService, NSnackbarService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';

import { scheduleService } from '../../services/schedule/schedule.service';

@Component({
    selector: 'bh-quarterselection',
    templateUrl: './quarterselection.template.html'
})

export class quarterselectionComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    
    object = Object;
    fyOptions;
    quarters;
    curQuarter;
    fyear;
    years = [];
    sQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    showChangeQuarter = false;
    ngModelObj = {
        selQuarter: '',
        selYear: ''
    };

    constructor(
        private bdms: NDataModelService,
        private scheduleSer: scheduleService,
        private snackbar: NSnackbarService
    ) {
        super();
        this.mm = new ModelMethods(bdms);

        this.fyOptions =  scheduleSer.getFyOptions();
        this.quarters = scheduleSer.getQuarter();
    }

    ngOnInit() {
        this.fyear = this.scheduleSer.fyear || this.scheduleSer.getFYear();
        this.curQuarter = this.scheduleSer.curQuarter || this.scheduleSer.getCurQuarter();
        this.processQuartersData();

        const curYear = new Date().getFullYear();

        for(let i = 2019; i <= curYear; i++) {
            this.years.push(i);
        }
    }

    processQuartersData() {
        this.scheduleSer.curQuarter = this.curQuarter;
        this.scheduleSer.fyear = this.fyear;
    }

    changeQuarter(e){
        //this.scheduleSer.setCurQuarter('Q' + e.value.split('Q')[1]);
        //this.fyear = 'F'+this.curDate.getFullYear().toString().substring(2)+this.curQuarter;
        //this.scheduleSer.setfYear(e.value);

        if (e) {
            this.curQuarter = this.scheduleSer.setCurQuarter(this.ngModelObj.selQuarter);

            const fyear = 'F'+ this.ngModelObj.selYear.toString().substring(2) + this.curQuarter;
            this.fyear = this.scheduleSer.setfYear(fyear);
            this.scheduleSer.setSelectedFullYear(this.ngModelObj.selYear);
            this.scheduleSer.changeQuarter.emit(true);
        }
    }

    changeQuarterB() {
        if(!this.ngModelObj.selYear || !this.ngModelObj.selQuarter) {
            this.snackbar.openSnackBar('Please select Quarter and year');
        } else {
            const changedReally = ('F'+ this.ngModelObj.selYear.toString().substring(2) + this.ngModelObj.selQuarter) == this.fyear;
            
            this.changeQuarter(!changedReally);
            this.showChangeQuarter = false;
        }
    }

    openChangeQuarter() {
        this.showChangeQuarter = true;
    }


}
