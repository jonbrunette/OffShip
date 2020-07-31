package application.service.external.cloverly.request;

import application.model.Distance;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonPropertyOrder({
        "distance",
        "weight"
})
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OffsetEstimateRequest {

    @JsonProperty("distance")
    private Distance distance;

    @JsonProperty("weight")
    private Weight weight;

    @JsonProperty("distance")
    public Distance getDistance() {
        return distance;
    }

    @JsonProperty("distance")
    public void setDistance(Distance distance) {
        this.distance = distance;
    }

    @JsonProperty("weight")
    public Weight getWeight() {
        return weight;
    }

    @JsonProperty("weight")
    public void setWeight(Weight weight) {
        this.weight = weight;
    }

}
