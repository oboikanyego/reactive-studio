/*DEFAULT GENERATED TEMPLATE. DO NOT CHANGE CLASS NAME*/
import { Injectable, EventEmitter } from '@angular/core';
import { NDataModelService, NSnackbarService, NSessionStorageService } from 'neutrinos-seed-services';
import { userService } from '../../services/user/user.service';

@Injectable({
    providedIn: 'root'
})
export class scheduleService {
    curDate = new Date();
    curQuarter;
    fyear;
    changeQuarter: EventEmitter<any> = new EventEmitter<any>();
    userInfo;
    selectedFullYear;

    constructor(
        private user: userService,
        private session: NSessionStorageService
    ) { 
        this.userInfo = this.session.getValue('userInfo');
    }

    getFyOptions() {
        let year = this.curDate.getFullYear().toString().substring(2);

        let fyOptions = [];

        for (let i = 19; i <= parseInt(year); i++) {
            for (let j = 1; j <= 4; j++) {
                let pushString = { optionData: 'F' + i + 'Q' + j, value: 'F' + i + 'Q' + j }
                fyOptions.push(pushString);
            }
        }

        return fyOptions;
    }

    getQuarter() {
        let quarters = {
            0: 'Q1',
            1: 'Q1',
            2: 'Q1',
            3: 'Q2',
            4: 'Q2',
            5: 'Q2',
            6: 'Q3',
            7: 'Q3',
            8: 'Q3',
            9: 'Q4',
            10: 'Q4',
            11: 'Q4'
        };

        return quarters;
    }

    getCurQuarter() {
        let curQuarter = this.getQuarter()[this.curDate.getMonth()];
        curQuarter = this.session.getValue('curQuarter') || curQuarter;

        this.curQuarter = curQuarter;
        return curQuarter;
    }

    getFYear() {
        let fyear = 'F' + this.curDate.getFullYear().toString().substring(2) + this.getCurQuarter();
        fyear = this.session.getValue('fyear') || fyear;

        this.fyear = fyear;
        return fyear;
    }

    getSelectedFullYear() {
        let selectedFullYear = this.curDate.getFullYear();
        selectedFullYear = this.session.getValue('selectedFullYear') || selectedFullYear;

        this.selectedFullYear = selectedFullYear;
        return selectedFullYear;
    }

    setfYear(val) {
        this.fyear = val;
        this.session.setValue('fyear', this.fyear);

        return this.fyear;
    }

    setCurQuarter(val) {
        this.curQuarter = val;
        this.session.setValue('curQuarter', this.curQuarter);

        return this.curQuarter;
    }

    setSelectedFullYear(val) {
        this.selectedFullYear = val;
        this.session.setValue('selectedFullYear', this.selectedFullYear);

        return this.selectedFullYear;
    }

    formatFileObj(file) {
        const fileObj = {
            'name': file.filename,
            'size': file.size,
            'type': file['mimetype'],
            'filepath': file['path'],
            'comments': ''
        };
        
        return fileObj;
    }

    pdfHtmlAID(item, policyInfo, details?) {
        let htmlData = '<table cellpadding="5px" cellspacing="0" width="750" style="font-size: 13px;border-color: #ddd">';
        htmlData += '<tr><td colspan="1">' + details['quarter'] + '</td>' + '<td colspan="4" align="right">' + details['name'] + '</td></tr>';
        htmlData += '<tr><td colspan="5"><br/></td></tr>';

        for (let key in item) {
            htmlData += '<tr class="'+ key +'Section"><td colspan="5"><h3 style="margin: 0px">' + key.toUpperCase() + '</h3></td></tr>';
            htmlData += '<tbody>';

            if (key == 'mainInfo') {
                for (let mainInfoKey in item[key]) {
                    htmlData += '<tr class="borderTR"><td colspan="2">' + mainInfoKey + '</td>' + '<td colspan="3">' + item[key][mainInfoKey] + '</td></tr>';
                }
            } else if (key == 'policyInfo') {
                for (let policyInfoKey in item[key]) {
                    htmlData += '<tr class="borderTR"><td colspan="5"><b>' + policyInfoKey + '</b></td></tr>';
                    let iInner = 0;
                    for (let policyInfoInner in item[key][policyInfoKey]['comments']) {
                        if (policyInfo[policyInfoKey][policyInfoInner].question) {
                            htmlData += '<tr class="borderTR"><td colspan="5">' + (iInner + 1) + ') ' + policyInfo[policyInfoKey][policyInfoInner].question + '</td></tr>';
                            htmlData += '<tr class="borderTR"><td colspan="2">' + item[key][policyInfoKey]['radioKeys'][policyInfoInner] + '</td>' + '<td colspan="3">' + item[key][policyInfoKey]['comments'][policyInfoInner] + '</td></tr>';
                        } else if (policyInfo[policyInfoKey][policyInfoInner].isCPD) {
                            policyInfo[policyInfoKey][policyInfoInner].questions.forEach((arrVal) => {
                                htmlData += '<tr class="borderTR"><td colspan="5">' + (iInner + 1) + ') ' + arrVal + '</td></tr>';
                                htmlData += '<tr class="borderTR"><td colspan="2">' + item[key][policyInfoKey]['radioKeys'][policyInfoInner] + '</td>' + '<td colspan="3">' + item[key][policyInfoKey]['comments'][policyInfoInner] + '</td></tr>';
                            });

                            if (policyInfo[policyInfoKey][policyInfoInner].table.caption) {
                                htmlData += '<tr><td colspan="5"><br/><br/></td></tr>';
                                htmlData += '<tr><td colspan="5">' + policyInfo[policyInfoKey][policyInfoInner].table.caption + '</td></tr>';
                            }

                            if (item[key][policyInfoKey]['tableData']) {
                                item[key][policyInfoKey]['tableData'].forEach((arrVal) => {
                                    htmlData += '<tr class="borderTR">';
                                    let iTableCol = 0;
                                    for (let arrValKey in arrVal) {
                                        if (policyInfo[policyInfoKey][policyInfoInner].table.columnsDef[iTableCol].type !== 'datePicker') {
                                            htmlData += '<td>' + arrValKey + ':<br />' + arrVal[arrValKey] + '</td>';

                                        } else if (policyInfo[policyInfoKey][policyInfoInner].table.columnsDef[iTableCol].type == 'datePicker') {
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

                        }
                        iInner++
                        //console.log(this.policyInfo[policyInfoKey][policyInfoInner]);
                    }
                    htmlData += '<tr><td colspan="5"><br /></td></tr>';
                }
            } else if (key == 'generalInfo') {
                for (let genInfo of item[key]) {
                    htmlData += '<tr class="borderTR"><td colspan="5">'+ genInfo['name'] +'</td></tr>';
                    htmlData += '<tr class="borderTR"><td colspan="5">'+ genInfo['comments'] ? genInfo['comments'] : 'No comments provided' +'</td></tr>';
                }
            } else if (key == 'declaration') {
                for (let declareKey in item[key]) {
                    if (declareKey == 'confidentiality') {
                        htmlData += '<tr class="borderTR"><td colspan="2">' + declareKey + '</td>' + '<td colspan="3">' + item[key][declareKey] + '</td></tr>';
                    } else if (declareKey == 'signoff') {
                        for (let signOffKey in item[key][declareKey]) {
                            for (let singOffKeyInner in item[key][declareKey][signOffKey]) {
                                htmlData += '<tr class="borderTR"><td colspan="2">' + singOffKeyInner + '</td>' + '<td colspan="3">' + item[key][declareKey][signOffKey][singOffKeyInner] + '</td></tr>';
                            }
                        }
                    }
                }
            }

            htmlData += '</tbody>';
            htmlData += '<tr><td colspan="5"><br /><br /></td></tr>';
        }

        htmlData += '</table>';

        return htmlData;
    }

    processScheduleAID(policyResponse) {
        const scheduleOutput = {};
        const exceptionCount = {};
        const mainInfo = {};
        const policyQuestionCount = {};
        const declarationCount = {};
        let mainInfoCount = 0;
        let tableSampleData = {};
        let datasourceData = [];

        Object.keys(policyResponse.stepper).forEach((stepName) => {
            scheduleOutput[stepName] = {};

            if (stepName == "mainInfo") {
                policyResponse['stepper'][stepName]['columnsDef'].forEach((column) => {
                    if (column.type == 'dropDown') {
                        mainInfo[column.name] = column.value;
                    } else if (column.type == 'prePopulate' && this.userInfo.userRole !== 'admin') {
                        scheduleOutput[stepName][column.name] = this.userInfo.displayName;
                    }
                });
                mainInfoCount = policyResponse['stepper'][stepName]['columnsDef'].length;

            }

            if (stepName == "policyInfo") {
                Object.keys(policyResponse['stepper'][stepName]).forEach((policyType) => {
                    scheduleOutput[stepName][policyType] = { comments: {}, radioKeys: {} };

                    policyResponse['stepper'][stepName][policyType].forEach((question, index) => {
                        if (question.exception) {
                            if (!exceptionCount[policyType]) {
                                exceptionCount[policyType] = {}
                            }

                            exceptionCount[policyType][index] = {
                                exception: true,
                                exceptionRule: question.exception,
                                questionNo: index,
                            }
                        }

                        if (policyType == 'Other' && question.isCPD) {
                            scheduleOutput[stepName][policyType]['tableData'] = [];
                            let row1 = {};
                            policyResponse['stepper'][stepName][policyType][index]['table'].columnsDef.forEach((tableCol) => {
                                row1[tableCol.name] = '';
                            });
                            //scheduleOutput[stepName][policyType]['tableData'].push(row1);
                            tableSampleData = row1;
                            datasourceData = [tableSampleData];
                        }
                    });

                    policyQuestionCount[policyType] = policyResponse['stepper'][stepName][policyType].length;
                });
                //console.log(exceptionCount, this.policyQuestionCount, scheduleOutput);
            }

            if (stepName == 'declaration') {
                Object.keys(policyResponse['stepper'][stepName]).forEach((declareKey) => {
                    scheduleOutput[stepName][declareKey] = {};
                    declarationCount[declareKey] = 1;

                    if (declareKey == 'signoff') {
                        declarationCount[declareKey] = {};
                        policyResponse['stepper'][stepName][declareKey].forEach((signOff, index) => {
                            scheduleOutput[stepName][declareKey][index] = {};

                            declarationCount[declareKey][index] = signOff.columnsDef.length;
                        });
                    }
                });
            }
        });


        return {
            scheduleOutput,
            exceptionCount,
            mainInfo,
            mainInfoCount,
            policyQuestionCount,
            declarationCount,
            datasourceData,
            tableSampleData
        }
    }


}

