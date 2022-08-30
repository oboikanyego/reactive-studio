/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, Input } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';

@Component({
    selector: 'bh-pageheader',
    templateUrl: './pageheader.template.html'
})

export class pageheaderComponent extends NBaseComponent implements OnInit {
    mm: ModelMethods;
    @Input() data: string;
    @Input() scheduleName: string;
    @Input() fyear: string;
    @Input() reportName: string;
    @Input() reportLink: string;
    @Input() cpdName: string;
    @Input() cpdLink: string;

    constructor(private bdms: NDataModelService) {
        super();
        this.mm = new ModelMethods(bdms);
    }

    ngOnInit() {
        if(this.scheduleName){
            //console.log(this.fyear, this.metaData[this.data].breadcrum[1].link);
            const newCrum = { title: this.scheduleName, link:'/home/schedules/'+this.scheduleName, active:true};
            this.metaData[this.data].breadcrum.push(newCrum);

            this.metaData[this.data].breadcrum[1].link = this.metaData[this.data].breadcrum[1].link + '/' + this.fyear;
        } else if(this.reportName){
            const newCrum = { title: this.reportName, link: this.reportLink, active: true };
            this.metaData[this.data].breadcrum.push(newCrum);
        } else if(this.cpdName) {
            const newCrum = { title: this.cpdName, link: this.cpdLink, active: true };
            this.metaData[this.data].breadcrum.push(newCrum);
        }
    }

    metaData = {
        users : {
            title : 'Users',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'User list', link:'/home/users', active:true}
            ]
        },
        schedules : {
            title : 'Schedules List',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'Schedules', link:'/home/schedules', active:true}
            ]
        },
        'Upload schedules' : {
            title : 'Upload schedule',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'Upload schedule', link:'/home/uploadschedule', active:true}
            ]
        },
        reviews : {
            title : 'Reviews',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'Reviews', link:'/home/reviews', active:true}
            ]
        },
        schedulesView : {
            title : 'Schedule',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'Schedules', link:'/home/schedules'}
            ]
        },
        reports : {
            title : 'Report',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'Reports', link:'/home/reports'}
            ]
        },
        cpd : {
            title : 'Continuous professional development',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'CPD', link:'/home/cpd/developmentPlan'}
            ]
        },
        dashboard : {
            title : 'Dashboard',
            breadcrum : [
                { title: 'Home', link: '/home/dashboard'}, 
                { title: 'Dashboard', link:'/home/dashboard', active:true}
            ]
        }
    }

}
