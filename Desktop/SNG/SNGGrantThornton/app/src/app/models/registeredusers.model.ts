import {JsonProperty, JsonObject} from '../lib/tj.deserializer'

@JsonObject
export class registeredusers {
  @JsonProperty('firstName', String, true)
  public firstName: string = undefined;

  @JsonProperty('lastName', String, true)
  public lastName: string = undefined;

  @JsonProperty('mobile', String, true)
  public mobile: string = undefined;

  @JsonProperty('email', String, true)
  public email: string = undefined;

  @JsonProperty('userRole', String, true)
  public userRole: string = undefined;

  @JsonProperty('displayName', String, true)
  public displayName: string = undefined;

  @JsonProperty('is_active', Boolean, true)
  public is_active: boolean = undefined;

}