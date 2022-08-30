/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE CLASS NAME*/
import { Injectable } from '@angular/core';
import { NSnackbarService } from 'neutrinos-seed-services';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { dialogconfirmationComponent } from '../../components/dialogconfirmationComponent/dialogconfirmation.component';
import { Subject } from 'rxjs';

import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class commonService {

    curDate = new Date();
    menuToggleChange: Subject<boolean> = new Subject<boolean>();
    showSublink = false;

    constructor(private dialog: MatDialog,
        private route: Router,
        private snackbar: NSnackbarService) {

    }

    toggleSideMenu(val) {
        this.menuToggleChange.next(val);
    }

    openModal(dType?, data?) {
        const dialogData = {
            type: dType ? dType : '',
            data: data
        };
        const dialogClass = 'dialogComponent-' + dType + '-' + data.mode;
        const width = (dType == 'confirm') ? '400px' : dType == 'defaultsSchedules' ? '500px' : '65%';
        dialogconfirmationComponent.data = dialogData;

        //const dialogRef = 
        return this.dialog.open(dialogconfirmationComponent, {
            width: width,
            data: dialogData,
            panelClass: dialogClass,
            disableClose: true
        });
    }

    navigate(data?) {
        let routeData = data ? data : { path: '/login' };
        let queryParams = data && data.queryParams ? { queryParams: data.queryParams } : {}

        if (routeData.path == '/login') {
            this.snackbar.openSnackBar('Authenticate yourself..', '2000');
        }
        this.route.navigate([routeData.path], queryParams);
    }

    getMetaData(key?) {
        const metaData = {
            menuLinks: {
                admin: [
                    { linkTitle: 'Home', icon: 'home', url: '/home/dashboard' },
                    { linkTitle: 'Schedules', icon: 'schedule', url: '/home/schedules' },
                    { linkTitle: 'Upload schedules', icon: 'file_upload', url: '/home/uploadschedule' },
                    {
                        linkTitle: 'Reports', icon: 'insert_chart_outline', url: '/home/reports',
                        subLinks: [
                            { linkTitle: 'Compliance report', icon: 'bubble_chart', url: '/home/reports/complianceReport' },
                            { linkTitle: 'Consolidated report', icon: 'bar_chart', url: '/home/reports/consolidateReport' },
                            { linkTitle: 'Reports by schedule', icon: 'pie_chart', url: '/home/reports/schedulesReport' },
                            { linkTitle: 'AID report', icon: 'stacked_bar_chart', url: '/home/reports/aidReport' },
                            { linkTitle: 'AID Files report', icon: 'description', url: '/home/reports/aidFilesReport' },
                            { linkTitle: 'CPD report', icon: 'table_chart', url: '/home/reports/cpdReport' }
                        ],
                        showSubmenu: false
                    },
                    //{linkTitle: 'Final review', icon: 'storage', url: '/home/reviews'},
                    { linkTitle: 'Users', icon: 'people', url: '/home/users/director' },
                    {
                        linkTitle: 'CPD', icon: 'timer', url: '/home/cpd/developmentPlan',
                        subLinks: [
                            { linkTitle: 'Development plan', icon: 'event_note', url: '/home/cpd/developmentPlan' },
                            { linkTitle: 'Activity', icon: 'event_available', url: '/home/cpd/activity' },
                        ],
                        showSubmenu: false
                    },
                    //{linkTitle: 'Extra', icon: 'people', url: '/jsonExtract'}
                ],
                director: [
                    { linkTitle: 'Home', icon: 'home', url: '/home' },
                    { linkTitle: 'Schedules', icon: 'schedule', url: '/home/schedules' },
                    { linkTitle: 'Upload schedules', icon: 'file_upload', url: '/home/uploadschedule' },
                    {
                        linkTitle: 'CPD', icon: 'timer', url: '/home/cpd/developmentPlan',
                        subLinks: [
                            { linkTitle: 'Development plan', icon: 'event_note', url: '/home/cpd/developmentPlan' },
                            { linkTitle: 'Activity', icon: 'event_available', url: '/home/cpd/activity' },
                        ],
                        showSubmenu: false
                    },
                ],
                user: [
                    { linkTitle: 'Home', icon: 'home', url: '/home' },
                    { linkTitle: 'Schedules', icon: 'schedule', url: '/home/schedules' },
                    { linkTitle: 'Upload schedules', icon: 'file_upload', url: '/home/uploadschedule' },
                    {
                        linkTitle: 'CPD', icon: 'timer', url: '/home/cpd/developmentPlan',
                        subLinks: [
                            { linkTitle: 'Development plan', icon: 'event_note', url: '/home/cpd/developmentPlan' },
                            { linkTitle: 'Activity', icon: 'event_available', url: '/home/cpd/activity' },
                        ],
                        showSubmenu: false
                    },
                ],
                manager: [
                    { linkTitle: 'Home', icon: 'home', url: '/home' },
                    { linkTitle: 'Schedules', icon: 'schedule', url: '/home/schedules' },
                    { linkTitle: 'Upload schedules', icon: 'file_upload', url: '/home/uploadschedule' },
                    {
                        linkTitle: 'CPD', icon: 'timer', url: '/home/cpd/developmentPlan',
                        subLinks: [
                            { linkTitle: 'Development plan', icon: 'event_note', url: '/home/cpd/developmentPlan' },
                            { linkTitle: 'Activity', icon: 'event_available', url: '/home/cpd/activity' },
                        ],
                        showSubmenu: false
                    },
                ],
            },
            hasAccess: {
                admin: ['home', 'dashboard', 'schedules', 'schedulesAID', 'reports', 'users', 'reviews', 'uploadschedule', 'cpd'],
                director: ['home', 'dash', 'schedules', 'schedulesAID', 'uploadschedule', 'cpd'],
                user: ['home', 'dash', 'schedules', 'schedulesAID', 'uploadschedule', 'cpd'],
                manager: ['home', 'dash', 'schedules', 'schedulesAID', 'uploadschedule', 'cpd']
            }
        };

        return key ? metaData[key] : metaData;
    }
}
