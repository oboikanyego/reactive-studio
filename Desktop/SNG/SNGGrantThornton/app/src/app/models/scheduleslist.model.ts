import {JsonProperty, JsonObject} from '../lib/tj.deserializer'

@JsonObject
export class scheduleslist {
  @JsonProperty('name', String, true)
  public name: string = undefined;

  @JsonProperty('columnsDef', [String], true)
  public columnsDef: string[] = [];

  @JsonProperty('tags', [String], true)
  public tags: string[] = [];

  @JsonProperty('guidance', [String], true)
  public guidance: string[] = [];

  @JsonProperty('is_active', Boolean, true)
  public is_active: boolean = undefined;

}