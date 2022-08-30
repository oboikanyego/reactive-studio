import {JsonProperty, JsonObject} from '../lib/tj.deserializer'

@JsonObject
export class assignedtomodel {
  @JsonProperty('email', String, true)
  public email: string = undefined;

  @JsonProperty('status', String, true)
  public status: string = undefined;

  @JsonProperty('displayName', String, true)
  public displayName: string = undefined;

  @JsonProperty('assignedBy', String, true)
  public assignedBy: string = undefined;

  @JsonProperty('assignedByName', String, true)
  public assignedByName: string = undefined;

  @JsonProperty('role', String, true)
  public role: string = undefined;

  @JsonProperty('assignedDate', Number, true)
  public assignedDate: number = undefined;

}