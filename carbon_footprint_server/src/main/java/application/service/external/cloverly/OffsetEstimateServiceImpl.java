package application.service.external.cloverly;

import application.model.Distance;
import application.model.OffsetEstimateResponse;
import application.model.UnitSystem;
import application.service.external.cloverly.request.OffsetEstimateRequest;
import application.service.external.cloverly.request.Weight;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import application.service.OffsetEstimateService;
import application.service.external.cloverly.response.OffsetEstimateDetails;

public class OffsetEstimateServiceImpl implements OffsetEstimateService {

    private RestTemplate restTemplate;

    public OffsetEstimateServiceImpl(RestTemplate restTemplate){
        this.restTemplate = restTemplate;
    }

    @Override
    public OffsetEstimateResponse estimateCarbonOffset(UnitSystem unitSystem, Integer weight) {

        HttpEntity<OffsetEstimateRequest> entity = new HttpEntity<>(createOffsetEstimateRequest(unitSystem, weight, null), createHeaders());

        OffsetEstimateDetails response = restTemplate.postForObject(
                "https://api.cloverly.com/2019-03-beta/estimates/carbon", entity, OffsetEstimateDetails.class);

        OffsetEstimateResponse estimateOffsetEstimateResponse = new OffsetEstimateResponse();
        estimateOffsetEstimateResponse.setCurrency(response.getCost().getCurrency());
        estimateOffsetEstimateResponse.setOffset(response.getCost().getOffset());

        return estimateOffsetEstimateResponse;
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer public_key:e023acce3abbbded");
        return headers;
    }

    private OffsetEstimateRequest createOffsetEstimateRequest(UnitSystem unitSystem, Integer weight, Integer distnace) {
        OffsetEstimateRequest offsetEstimateRequest = new OffsetEstimateRequest();
        Weight weightObj = new Weight();
        Distance distanceObj = null;
        if(unitSystem == UnitSystem.IMPERIAL) {
            weightObj.setUnits("pounds");
            if( distnace != null) {
                distanceObj = new Distance();
                distanceObj.setUnits("miles");
                distanceObj.setValue(distnace);
                offsetEstimateRequest.setDistance(distanceObj);}
        }

        if(unitSystem == UnitSystem.METRIC) {
            weightObj.setUnits("kg");
            if( distnace != null) {
                distanceObj = new Distance();
                distanceObj.setUnits("km");
                distanceObj.setValue(distnace);
                offsetEstimateRequest.setDistance(distanceObj);}
        }
        weightObj.setValue(weight);
        offsetEstimateRequest.setWeight(weightObj);

        return offsetEstimateRequest;
    }
}
