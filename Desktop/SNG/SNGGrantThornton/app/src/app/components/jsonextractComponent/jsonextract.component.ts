/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE SELECTOR TEMPLATE_URL AND CLASS NAME*/
import { Component, OnInit, ViewChild } from '@angular/core'
import { ModelMethods } from '../../lib/model.methods';
// import { BDataModelService } from '../service/bDataModel.service';
import { NDataModelService } from 'neutrinos-seed-services';
import { NBaseComponent } from '../../../../../app/baseClasses/nBase.component';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpHeaders, HttpRequest, HttpParams } from '@angular/common/http';

import { userService } from '../../services/user/user.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

/**
 * Service import Example :
 * import { HeroService } from '../../services/hero/hero.service';
 */

/**
* 
* Serivice Designer import Example - Service Name - HeroService
* import { HeroService } from 'app/sd-services/HeroService';
*/

@Component({
    selector: 'bh-jsonextract',
    templateUrl: './jsonextract.template.html'
})

export class jsonextractComponent extends NBaseComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) tblPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) tblSort: MatSort;

    mm: ModelMethods;
    object = Object;
    dataSource;
    exportAsConfig: ExportAsConfig = {
        type: 'xlsx', // the type you want to download
        elementIdOrContent: 'downloadTable', // the id of html/table element
    }
    compliance;
    getPayload = {};
    usersArr = [];
    scheduleName = 'Annual Independence Declaration - Manager';
    targetList = [
        "Alwaba.Mbadlanyana@sng.gt.com",
        "Carmynn.Gower@sng.gt.com",
        "Gugu.Gumbo@sng.gt.com",
        "Jp.Williams@sng.gt.com",
        "Jenna.Hempel@sng.gt.com",
        "Jesse.Cloete@sng.gt.com",
        "joalane.rasunyane@sng.gt.com",
        "Juane.Nel@sng.gt.com",
        "Kathy.Dixon@sng.gt.com",
        "Kiara.Bell@sng.gt.com",
        "Knowledge.Jogo@sng.gt.com",
        "Kuhle.Buyeye@sng.gt.com",
        "Kyle.DuPreez@sng.gt.com",
        "Luyolo.Swana@sng.gt.com",
        "Melissa.Opperman@sng.gt.com",
        "Merin.Mani@sng.gt.com",
        "Nathaniel.Deagrela@sng.gt.com",
        "Nomzamo.Phakade@sng.gt.com",
        "Richard.Schoof@sng.gt.com",
        "Siyasanga.Ntwasa@sng.gt.com",
        "Tj.Samudzi@sng.gt.com",
        "Tarisai.Takawira@sng.gt.com",
        "Uviwe.Ntakana@sng.gt.com",
        "Zimasa.Maninjwa@sng.gt.com",
    ];
    scheduleOutput;
    policyInfo;
    scheduleQuarter;
    userEmail;
    userModelObj = {};
    declarationsPDF = [
        "merin.mani@sng.gt.com",
        "jp.williams@sng.gt.com",
        "kuhle.buyeye@sng.gt.com",
        "zimasa.maninjwa@sng.gt.com"
    ]
    tblDisplayColumns = [];
    loading = false;

    constructor(private bdms: NDataModelService, private http: HttpClient,
        private exportAsService: ExportAsService, private user: userService) {
        super();
        this.mm = new ModelMethods(bdms);
        //this.compliance = this.newSer.getCompliaceData();
    }

    ngOnInit() {
        this.dataSource = new MatTableDataSource();
        this.dataSource.sort = this.tblSort;
        this.dataSource.paginator = this.tblPaginator;

        // this.userModelObj = {
        //     'email': "nick.kyriacou@sng.gt.com",
        //     "quarter": "F21Q3"
        // }
        //this.searchClient();

        // this.get('schedulesfilled', { status: "completed" }, { _id: 0, output: 0, assignedTo: 0, is_active: 0, 'type': 0 }, { role: 1, name: 1, filledByName: 1 }, 1, 3000);
        // this.get('registeredusers', { is_active: false }, { _id: 0 }, {}, 1, 3000);
        this.get('schedulesassigned', { quarter: 'F22Q1' }, { _id: 0 }, {}, 1, 3000);
        //this.refreshData();
        //this.get('schedulesfilled', {'filledBy': { $in : this.declarationsPDF}});
        //this.get('scheduleslist', { name: 'Annual Independence Declaration - Professional Employees' });
    }

    searchClient() {
        if (this.userModelObj) {
            this.get('schedulesassigned', { 'assignedTo.email': this.userModelObj['email'], quarter: this.userModelObj['quarter'] });
            //this.get('schedulesfilled', {'filledBy': this.userModelObj['email'], quarter: this.userModelObj['quarter']})
        }

        this.getPayload['schedulesOutput'] = {};
    }

    getScheduledFilled(schedule, nominate) {
        this.get('schedulesfilled', {
            'filledBy': nominate.email,
            quarter: this.userModelObj['quarter'],
            name: schedule.name
        });
    }

    processScheduledFilled(filter) {
        if (filter.filledBy == this.userModelObj['email']) {
            this.userModelObj['directorDataEmpty'] = true;
        }
        this.getPayload['schedulesfilled'].forEach((filled) => {
            filled.output.forEach(outputRow => {
                this.getPayload['schedulesOutput'][filled.name].push(outputRow);
            });
            this.tblDisplayColumns = Object.keys(filled.output[0]);
        });
    }

    selectedSchedule(schedule) {
        this.userModelObj['scheduleName'] = schedule.name;
        this.userModelObj['directorDataEmpty'] = undefined;
        this.tblDisplayColumns = [];
        //if (!this.getPayload['schedulesOutput'][schedule.name]) {
            this.getPayload['schedulesOutput'][schedule.name] = [];

            this.get('schedulesfilled', {
                'filledBy': this.userModelObj['email'],
                quarter: this.userModelObj['quarter'],
                name: schedule.name
            });
        //}
    }

    saveFilledSchedule() {

        const updateObj = {
            output: this.getPayload['schedulesOutput'][this.userModelObj['scheduleName']],
            'filter': {
                name: this.userModelObj['scheduleName'],
                assignedTo: this.userModelObj['email'],
                quarter: this.userModelObj['quarter'],
                filledBy: this.userModelObj['email']
            }
        };

        if (this.userModelObj['directorDataEmpty']) {
            updateObj['createdDate'] = new Date().getTime();
            updateObj['name'] = this.userModelObj['scheduleName'];
            updateObj['quarter'] = this.userModelObj['quarter'];
            updateObj['assignedTo'] = this.userModelObj['email'];
            updateObj['filledBy'] = this.userModelObj['email'];
            updateObj['filledByName'] = 'Nick Kyriacou'; //this.userInfo.displayName;
            updateObj['is_active'] = true; //this.userInfo.is_active;
            updateObj['type'] = 'questionnaire'; //this.getPayload['scheduleslist'].type;
        }

        this.loading = true;
        //console.log(JSON.stringify(updateObj));
        this.user.scheduleFill(updateObj).subscribe(res => {
            //this.snackbar.openSnackBar('Saved successfully', 2000);
            //this.scheduleProgress = true;
            this.loading = false;
            //this.common.navigate({path: '/home/schedules/'+this.scheduleQuarter});
        }, error => {
            this.loading = false;
            //this.snackbar.openSnackBar('Unable to save.. Please try later', 2000);
        });

    }

    refreshData() {
        //console.log(this.targetList);
        let targetFiltered = [];
        let targetNotFiltered = [];
        // this.http.get('/assets/filled/codebeautify.json').subscribe(res => {
        //     //this.dataSource.data = res;

        //     let newArr = this.targetList.map((emailID) => emailID.toLowerCase());
        //     console.log(newArr, res);
        //     let filterList = [];
        //     res.forEach((obj) => {
        //         if (newArr.indexOf(obj.filledBy) >= 0) { targetFiltered.push(obj.filledBy); filterList.push(obj); }
        //     });

        //     let differenceList = newArr.filter(x => !targetFiltered.includes(x));
        //     this.dataSource.data = filterList;
        //     //console.log(targetFiltered, JSON.stringify(differenceList), newArr);
        // }, error => {
        //     console.log(error.error);
        // });

        // this.http.get('/assets/SNGprofessionalStaff.xlsx').subscribe(res => {
        //     console.log(res);
        // }, error => {
        //     console.log(error.error);
        // });
    }

    formateDate(date) {
        console.log(new Date(date));
        return true;
    }

    uploadFile(e) {
        var files = e.target.files;
        let file: File = files.item(0);
        let reader: FileReader = new FileReader();
        reader.readAsText(file);
        //reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
            /* Excel Read */
            // let csvData: ArrayBuffer = reader.result as ArrayBuffer;
            // let csvRecordsArray = csvData.split(/\r\n|\n/);
            // var data = new Uint8Array(reader.result);
            // var workbook = XLSX.read(data, { type: 'array' });
            // var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

            // // header: 1 instructs xlsx to create an 'array of arrays'
            // var result = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // console.log(result);

            /* CSV Read */
            let csvData: string = reader.result as string;
            let csvRecordsArray = csvData.split(/\r\n|\n/);
            let parsedData = [];

            csvRecordsArray.forEach((str, index) => {
                let splitArr = str.split(',');
                if (index !== 0) {
                    let dataObj = {
                        firstName: splitArr[0] ? splitArr[0].trim() : null,
                        lastName: splitArr[1] ? splitArr[1].trim() : null,
                        role: splitArr[2] ? splitArr[2].trim() : null,
                        email: splitArr[3] ? splitArr[3].trim() : null,
                        mobile: splitArr[4] ? splitArr[4].trim() : null,
                    }

                    if (dataObj.email && dataObj.role && dataObj.firstName && dataObj.lastName) {
                        dataObj.firstName = dataObj.firstName.replace(/[0-9]/g, '');
                        dataObj.lastName = dataObj.lastName.replace(/[0-9]/g, '');
                        dataObj.role = dataObj.role.replace(/[0-9]/g, '');
                        dataObj.role = dataObj.role == 'Other' ? 'user' : dataObj.role;
                        parsedData.push(dataObj);
                    }
                }
            });

            console.log(parsedData);
            this.dataSource.data = parsedData;
        }
    }

    tblSearch(e) {
        this.dataSource.filter = e.target.value;
    }

    deleteUser() {
        // this.user.deleteUsers().subscribe(res => {
        //     console.log(res);
        // }, error => {
        //     console.log(error);
        // });
    }

    download() {
        //console.log(this.exportAsConfig);
        if (this.dataSource.data && this.dataSource.data.length > 0) {
            this.exportAsService.save(this.exportAsConfig, 'eastLondonEmployee').subscribe((res) => {
                // save started
                //console.log(res);
            });
        }
    }

    downloadDeclaration() {
        this.dataSource.data.forEach((output) => {
            console.log(output);
        });
    }

    downloadPDF(data) {
        var item = data.output;
        this.scheduleQuarter = data.quarter;
        this.userEmail = data.filledBy;
        //this.policyInfo = item.policyInfo; 

        var htmlData = '<table border="1" cellpadding="5px" cellspacing="0" width="800" style="font-size: 13px;border-color: #ddd">';

        for (var key in item) {
            htmlData += '<tr><td colspan="5"><h3 style="margin: 0px">' + key.toUpperCase() + '</h3></td></tr>';
            htmlData += '<tbody>';

            if (key == 'mainInfo') {
                for (var mainInfoKey in item[key]) {
                    htmlData += '<tr><td colspan="2">' + mainInfoKey + '</td>' + '<td colspan="3">' + item[key][mainInfoKey] + '</td></tr>';
                }
            } else if (key == 'policyInfo') {
                for (var policyInfoKey in item[key]) {
                    htmlData += '<tr><td colspan="5"><b>' + policyInfoKey + '</b></td></tr>';
                    let iInner = 0;
                    for (var policyInfoInner in item[key][policyInfoKey]['comments']) { //console.log(this.policyInfo, item, key, policyInfoKey);
                        if (this.policyInfo[policyInfoKey][policyInfoInner].question) {
                            htmlData += '<tr><td colspan="5">' + (iInner + 1) + ') ' + this.policyInfo[policyInfoKey][policyInfoInner].question + '</td></tr>';
                            htmlData += '<tr><td colspan="2">' + item[key][policyInfoKey]['radioKeys'][policyInfoInner] + '</td>' + '<td colspan="3">' + item[key][policyInfoKey]['comments'][policyInfoInner] + '</td></tr>';
                        } else if (this.policyInfo[policyInfoKey][policyInfoInner].isCPD) {
                            this.policyInfo[policyInfoKey][policyInfoInner].questions.forEach((arrVal) => {
                                htmlData += '<tr><td colspan="5">' + (iInner + 1) + ') ' + arrVal + '</td></tr>';
                                htmlData += '<tr><td colspan="2">' + item[key][policyInfoKey]['radioKeys'][policyInfoInner] + '</td>' + '<td colspan="3">' + item[key][policyInfoKey]['comments'][policyInfoInner] + '</td></tr>';
                            });

                            if (this.policyInfo[policyInfoKey][policyInfoInner].table.caption) {
                                htmlData += '<tr><td colspan="5">' + this.policyInfo[policyInfoKey][policyInfoInner].table.caption + '</td></tr>';
                            }

                            item[key][policyInfoKey]['tableData'].forEach((arrVal) => {
                                htmlData += '<tr>';
                                let iTableCol = 0;
                                for (var arrValKey in arrVal) {
                                    if (this.policyInfo[policyInfoKey][policyInfoInner].table.columnsDef[iTableCol].type !== 'datePicker') {
                                        htmlData += '<td>' + arrValKey + ':<br />' + arrVal[arrValKey] + '</td>';

                                    } else if (this.policyInfo[policyInfoKey][policyInfoInner].table.columnsDef[iTableCol].type == 'datePicker') {
                                        let tempDate = new Date(arrVal[arrValKey]);
                                        htmlData += '<td>' + arrValKey + ':<br />' +
                                            tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
                                        '</td>';
                                    }
                                    iTableCol++;
                                }
                                htmlData += '</tr>';
                            });

                        }
                        iInner++
                        //console.log(this.policyInfo[policyInfoKey][policyInfoInner]);
                    }
                }
            } else if (key == 'declaration') {
                for (var declareKey in item[key]) {
                    if (declareKey == 'confidentiality') {
                        htmlData += '<tr><td colspan="2">' + declareKey + '</td>' + '<td colspan="3">' + item[key][declareKey] + '</td></tr>';
                    } else if (declareKey == 'signoff') {
                        for (var signOffKey in item[key][declareKey]) {
                            for (var singOffKeyInner in item[key][declareKey][signOffKey]) {
                                htmlData += '<tr><td colspan="2">' + singOffKeyInner + '</td>' + '<td colspan="3">' + item[key][declareKey][signOffKey][singOffKeyInner] + '</td></tr>';
                            }
                        }
                    }
                }
            }

            htmlData += '</tbody>';
        }

        htmlData += '</table>';
        document.getElementById('downloadDivPDF').innerHTML = htmlData;
        //console.log(this.scheduleOutput, htmlData);

        this.exportAsConfig = {
            type: 'pdf', // the type you want to download
            elementIdOrContent: 'downloadDivPDF', // the id of html/table element
        }

        this.exportAsService.save(this.exportAsConfig, 'AID_' + this.scheduleQuarter + '_' + this.userEmail).subscribe((res) => {
            //     // save started
            //     //console.log(res);
        });

        setTimeout((res) => {
            document.getElementById('downloadDivPDF').innerHTML = '';
        }, 3000);
    }

    processUsersData(result) {
        //console.log(this.compliance, this.getPayload['registeredusers']);

        this.compliance.forEach((userName) => {
            let findUser = this.getPayload['registeredusers'].find((obj) => obj.displayName == userName.Username);
            let managerUser = this.getPayload['schedulesassigned'][0].assignedTo.find((obj) => obj.displayName == userName.Username);
            let userExists = this.usersArr.find((obj) => obj.displayName == userName.Username);

            if (findUser && !managerUser && !userExists) {
                let complianceObj = this.getPayload['schedulesfilled'].find((obj) => obj.filledBy == findUser.email);
                let pushObj = {
                    "email": findUser.email, "role": "user", "status": complianceObj ? complianceObj.status : userName.Q1.toLowerCase(),
                    "assignedBy": "tatenda.zimondi@sng.gt.com", "assignedByName": "Tatenda Zimondi", "displayName": findUser.displayName
                };

                this.usersArr.push(pushObj);
            }
        });

        this.dataSource.data = this.usersArr;
        console.log(this.usersArr);
    }

    unassignDeletedUsers(result) {
        this.usersArr = [];

        if (this.getPayload['registeredusers'] && this.getPayload['schedulesassigned']) {
            let assignedTo = this.getPayload['schedulesassigned'][0].assignedTo;
            console.log(assignedTo.length);

            this.getPayload['registeredusers'].forEach((user) => {
                let assignmentIndex = assignedTo.findIndex((obj) => obj.email == user.email);
                if (assignmentIndex >= 0 && user.email !== 'anda.mduli@sng.gt.com'
                    && assignedTo[assignmentIndex].status == 'outstanding') {
                    //console.log(assignmentIndex);
                    this.usersArr.push(assignedTo[assignmentIndex]);
                    assignedTo.splice(assignmentIndex, 1)
                }
            });

            //console.log(assignedTo, this.usersArr, this.scheduleName);
        }
    }

    processAssignedData() {
        //this.getPayload['schedulesassigned'].assignedTo
    }

    get(dataModelName, filter?, keys?, sort?, pagenumber?, pagesize?) {
        this.loading = true;
        this.user.genericGet(dataModelName, filter, keys).subscribe(
            result => {
                // On Success code here
                this.loading = false;
                this.getPayload[dataModelName] = result;
                //if(dataModelName == 'schedulesfilled') this.dataSource.data = result;
                //if (dataModelName == 'schedulesfilled') this.processScheduledFilled(filter);
                //if(dataModelName == 'scheduleslist') this.policyInfo = result[0]['stepper']['policyInfo'];
            },
            error => {
                // Handle errors here
                this.loading = false;
            }
        );
    }


}
