package application.service.internal;

import application.model.OffsetEstimateResponse;
import application.model.UnitSystem;
import application.service.OffsetEstimateService;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class OffsetEstimateServiceImpl implements OffsetEstimateService {

    private final int places = 2;

    @Override
    public OffsetEstimateResponse estimateCarbonOffset(UnitSystem unitSystem, Integer weight) {
        OffsetEstimateResponse offsetEstimateResponse = new OffsetEstimateResponse();
        offsetEstimateResponse.setCurrency("USD");
        BigDecimal offsetAmount;
        if (unitSystem == UnitSystem.IMPERIAL) {
            offsetAmount = new BigDecimal(Double.toString((0.454 * weight * 0.01) / 5));
        } else {
            offsetAmount = new BigDecimal(Double.toString((weight * 0.01) / 5));
        }
        offsetAmount = offsetAmount.setScale(places, RoundingMode.UP);
        offsetEstimateResponse.setOffset(offsetAmount.doubleValue());
        return offsetEstimateResponse;
    }
}
