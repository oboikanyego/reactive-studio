import { NgForm } from '@angular/forms';
import * as models from '../models';
import { JsonConvert } from './tj.deserializer';

import { NDataModelService } from 'neutrinos-seed-services';

class Deserializer {
    instance: any;
    errors: Error[];
}

export class ModelMethods {

    private jsonConvert: JsonConvert = new JsonConvert();

    private INVALID_MODEL_NAME = 'INVALID_MODEL_NAME';
    private INVALID_DATA_MODEL_INSTANCE = 'INVALID_DATA_MODEL_INSTANCE';


    constructor(private dmService: NDataModelService) { };

    public get(dataModelName: string, filter?, keys?, sort?, pagenumber?, pagesize?, resultCallback?: (result) => void,
        errorCallback?: (errors: Error[]) => void) {
        if (this.checkModelExits(dataModelName)) {
            this.dmService.get(dataModelName, filter, keys, sort, pagenumber, pagesize).subscribe(result => {
                resultCallback(result);
            }, error => {
                this.errorCallbackAssign(errorCallback, error);
            });
        } else {
            const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
            this.errorCallbackAssign(errorCallback, new Error(invalidDmString))
        }
    }

    public put(dataModelName: string, dataModelObject, resultCallback?: (result) => void, errorCallback?: (errorObject: Error[]) => void) {
        if (this.checkModelExits(dataModelName)) {
            if (dataModelObject) {
                const des = this.deserializingTest(dataModelName, JSON.parse(JSON.stringify(dataModelObject)));
                if (des.errors && des.errors.length === 0) {
                    this.dmService.put(dataModelName, des.instance).subscribe(result => {
                        this.resultCallbackAssign(resultCallback, result);
                    }, error => {
                        this.errorCallbackAssign(errorCallback, error);
                    })
                } else {
                    errorCallback(des.errors);
                }

            } else {
                this.errorCallbackAssign(errorCallback,
                    new Error(`${this.INVALID_DATA_MODEL_INSTANCE}: ${JSON.stringify(dataModelObject)} for Data Model ${dataModelName}`))
            }
        } else {
            const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
            this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
        }
    }

    public validatePut(formObj: NgForm, dataModelName: string, dataModelObject, resultCallback?: (result) => void,
        errorCallback?: (errors: Error[]) => void) {
        const errorArr = [];
        if (formObj && formObj.valid) {
            this.put(dataModelName, dataModelObject, resultCallback, errorCallback);
        } else if (typeof errorCallback === 'function') {
            errorCallback(this.createErrorArr(formObj));
        }
    }

    public update(dataModelName: string, updateObject,
        resultCallback?: (result) => void, errorCallback?: (errors: Error[]) => void) {
        if (this.checkModelExits(dataModelName)) {
            if (updateObject && updateObject['update'] && updateObject['filter']) {
                this.dmService.update(dataModelName, updateObject).subscribe(result => {
                    this.resultCallbackAssign(resultCallback, result);
                }, error => {
                    this.errorCallbackAssign(errorCallback, error);
                });
            } else {
                this.errorCallbackAssign(errorCallback, new Error(`'INVALID_UPDATE_OBJECT : \n
                                        updateObject Eg: { "filter": {}, "update": {}, "options": {}}'`))
            }
        } else {
            const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
            this.errorCallbackAssign(errorCallback, new Error(`${invalidDmString}`))
        }
    }

    public validateUpdate(formObj: NgForm, dataModelName: string, updateObject, resultCallback?: (result) => void,
        errorCallback?: (errors: Error[]) => void) {
        if (formObj && formObj.valid) {
            this.update(dataModelName, updateObject, resultCallback, errorCallback);
        } else if (typeof errorCallback === 'function') {
            errorCallback(this.createErrorArr(formObj));
        }
    }

    public delete(dataModelName: string, filter, resultCallback?: (result) => void,
        errorCallback?: (errorObject: Error) => void) {
        if (this.checkModelExits(dataModelName)) {
            if (filter) {
                this.dmService.delete(dataModelName, filter).subscribe(result => {
                    this.resultCallbackAssign(resultCallback, result);
                }, error => {
                    this.errorCallbackAssign(errorCallback, error);
                });
            } else {
                this.errorCallbackAssign(errorCallback, new Error('Invalid filter for ' + dataModelName + '.'));
            }

        } else {
            const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
            this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
        }

    }


    public getById(dataModelName: string, dataModelId, resultCallback?: (result) => void, errorCallback?: (errors: Error[]) => void) {
        if (this.checkModelExits(dataModelName)) {
            if (dataModelId) {
                this.dmService.getById(dataModelName, dataModelId).subscribe(result => {
                    this.resultCallbackAssign(resultCallback, result);
                }, error => {
                    this.errorCallbackAssign(errorCallback, error);
                });
            } else {
                const invalidDmString = `INVALID MODEL ID: ${dataModelId}`;
                this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
            }

        } else {
            const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
            this.errorCallbackAssign(errorCallback, new Error(invalidDmString))
        }
    }


    public deleteById(dataModelName, dataModelId, resultCallback?: (result) => void,
        errorCallback?: (errorObject: Error) => void) {
        if (this.checkModelExits(dataModelName)) {
            if (dataModelId) {
                this.dmService.deleteById(dataModelName, dataModelId).subscribe(result => {
                    this.resultCallbackAssign(resultCallback, result);
                }, error => {
                    this.errorCallbackAssign(errorCallback, error);
                });
            } else {
                const invalidDmString = `INVALID MODEL ID: ${dataModelId}`;
                this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
            }
        } else {
            const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
            this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
        }
    }

    public updateById(dataModelName: string, dataModelId, dataModelObject,
        resultCallback?: (result) => void, errorCallback?: (errors: Error[]) => void) {
        if (dataModelId) {
            if (this.checkModelExits(dataModelName)) {
                dataModelObject = JSON.parse(JSON.stringify(dataModelObject));
                if (dataModelObject) {
                    const des = this.deserializingTest(dataModelName, dataModelObject);
                    if (des.errors && des.errors.length === 0) {
                        this.dmService.updateById(dataModelName, dataModelId, des.instance).subscribe(result => {
                            this.resultCallbackAssign(resultCallback, result);
                        }, error => {
                            this.errorCallbackAssign(errorCallback,
                                new Error(`${this.INVALID_DATA_MODEL_INSTANCE}: 
                                 ${JSON.stringify(dataModelObject)} for Data Model ${dataModelName}`))
                        })
                    } else {
                        errorCallback(des.errors);
                    }
                } else {
                    this.errorCallbackAssign(errorCallback, new Error(`${this.INVALID_DATA_MODEL_INSTANCE}: 
                    ${JSON.stringify(dataModelObject)} for Data Model ${dataModelName}`))
                }
            } else {
                const invalidDmString = `${this.INVALID_MODEL_NAME}: ${dataModelName}`;
                this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
            }
        } else {
            const invalidDmString = `INVALID MODEL ID: ${dataModelId}`;
            this.errorCallbackAssign(errorCallback, new Error(invalidDmString));
        }
    }

    private resultCallbackAssign(resultCallback, result) {
        if (resultCallback) {
            this.callbackAssign(resultCallback, result, 'INVALID_RESULT_CALLBACK');
        } else {
            console.log(result);
        }
    }

    private errorCallbackAssign(errorCallback, errorObj: Error) {
        const errorArr = [];
        if (errorCallback) {
            errorArr.push(errorObj);
            this.callbackAssign(errorCallback, errorArr, 'INVALID_ERROR_CALLBACK');
        } else {
            console.error(errorObj);
        }
    }

    private callbackAssign(callback, returnObj, errorMessage?, errorObj?: Error) {
        if (typeof callback === 'function') {
            callback(returnObj);
        }
    }

    private createErrorArr(formObj: NgForm) {
        const errorObjArr = [];
        const controls = Object.keys(formObj.controls);
        if (formObj) {
            for (let i = 0; i < controls.length; i++) {
                if (!formObj.controls[controls[i]].valid) {
                    errorObjArr.push(new Error(`INVALID_FIELD: ${controls[i]} - ${JSON.stringify(formObj.controls[controls[i]].errors)}`))
                }
            }
        } else {
            errorObjArr.push(new Error(`INVALID_FORM: Invalid form object.`))
        }
        return errorObjArr;
    }

    private checkModelExits(modelName) {
        if (models && models[modelName]) {
            return true;
        } else {
            return false;
        }
    }

    private deserializingTest(dataModelName: string, dataModelObject: Object): Deserializer {
        if (dataModelName && dataModelObject) {
            const des = this.jsonConvert.deserialize(Object.assign({}, dataModelObject), models[dataModelName]);
            return des;
        }
    }

}
