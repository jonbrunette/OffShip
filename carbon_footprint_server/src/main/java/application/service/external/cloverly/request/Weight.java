package application.service.external.cloverly.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import io.swagger.annotations.ApiModelProperty;

@JsonPropertyOrder({
        "value",
        "units"
})
public class Weight {

    @ApiModelProperty(notes = "Total carbon units to offset", name="value")
    @JsonProperty("value")
    private Integer value;

    @ApiModelProperty(notes = "Units in kg", name="units")
    @JsonProperty("units")
    private String units;

    @JsonProperty("value")
    public Integer getValue() {
        return value;
    }

    @JsonProperty("value")
    public void setValue(Integer value) {
        this.value = value;
    }

    @JsonProperty("units")
    public String getUnits() {
        return units;
    }

    @JsonProperty("units")
    public void setUnits(String units) {
        this.units = units;
    }

}