import {JsonProperty, JsonObject} from '../lib/tj.deserializer'

@JsonObject
export class schedulesfilled {
  @JsonProperty('schedule', String, true)
  public schedule: string = undefined;

  @JsonProperty('status', String, true)
  public status: string = undefined;

  @JsonProperty('assignedTo', String, true)
  public assignedTo: string = undefined;

  @JsonProperty('output', [String], true)
  public output: string[] = [];

  @JsonProperty('filledByName', String, true)
  public filledByName: string = undefined;

  @JsonProperty('quarter', String, true)
  public quarter: string = undefined;

  @JsonProperty('createdDate', Number, true)
  public createdDate: number = undefined;

  @JsonProperty('modifiedDate', Number, true)
  public modifiedDate: number = undefined;

  @JsonProperty('is_active', Boolean, true)
  public is_active: boolean = undefined;

  @JsonProperty('filledBy', String, true)
  public filledBy: string = undefined;

  @JsonProperty('role', String, true)
  public role: string = undefined;

}