package application.model;

public class EmissionEstimateResponse {

    private String unit;
    private double emissionFactor;

    public EmissionEstimateResponse(String unit, double emissionFactor) {
        this.unit = unit;
        this.emissionFactor = emissionFactor;
    }

    public String getUnit() {
        return unit;
    }
    public double getEmissionFactor() {
        return emissionFactor;
    }

}
