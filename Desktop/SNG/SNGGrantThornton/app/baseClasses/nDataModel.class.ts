import { registeredusers } from '../src/app/models/registeredusers.model';
import { scheduleslist } from '../src/app/models/scheduleslist.model';
import { schedulesfilled } from '../src/app/models/schedulesfilled.model';
import { schedulesassigned } from '../src/app/models/schedulesassigned.model';
import { assignedtomodel } from '../src/app/models/assignedtomodel.model';
//IMPORT NEW DATAMODEL

export class NDataModel {
registeredusers: registeredusers;
scheduleslist: scheduleslist;
schedulesfilled: schedulesfilled;
schedulesassigned: schedulesassigned;
assignedtomodel: assignedtomodel;
//DECLARE NEW VARIABLE

constructor() {
this.registeredusers = new registeredusers();
this.scheduleslist = new scheduleslist();
this.schedulesfilled = new schedulesfilled();
this.schedulesassigned = new schedulesassigned();
this.assignedtomodel = new assignedtomodel();
//CREATE NEW DM INSTANCE
    }
}