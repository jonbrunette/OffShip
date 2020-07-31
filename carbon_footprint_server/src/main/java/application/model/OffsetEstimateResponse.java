package application.model;

public class OffsetEstimateResponse {
    private String currency;
    private double offset;

    public String getCurrency() {
        return currency;
    }

    public double getOffset() {
        return offset;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public void setOffset(double offset) {
        this.offset = offset;
    }
}
