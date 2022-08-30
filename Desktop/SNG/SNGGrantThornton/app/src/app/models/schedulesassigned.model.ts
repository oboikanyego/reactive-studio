import {JsonProperty, JsonObject} from '../lib/tj.deserializer'
import { assignedtomodel } from './assignedtomodel.model';

@JsonObject
export class schedulesassigned {
  @JsonProperty('name', String, true)
  public name: string = undefined;

  @JsonProperty('quarter', String, true)
  public quarter: string = undefined;

  @JsonProperty('closingDate', Number, true)
  public closingDate: number = undefined;

  @JsonProperty('type', String, true)
  public type: string = undefined;

  @JsonProperty('assignedTo', [assignedtomodel], true)
  public assignedTo: assignedtomodel[] = [];

}