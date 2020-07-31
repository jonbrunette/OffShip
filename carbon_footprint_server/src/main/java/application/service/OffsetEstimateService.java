package application.service;


import application.model.UnitSystem;
import application.model.OffsetEstimateResponse;

public interface OffsetEstimateService {

    OffsetEstimateResponse estimateCarbonOffset(UnitSystem unitSystem, Integer weight);

}
