package application.service.external.cloverly.response;

public class OffsetEstimateDetails {
    private String slug;
    private String environment;
    private String state;
    Renewable_energy_certificate renewable_energyCertificateObject;
    private String micro_rec_count;
    private String micro_units;
    Offset OffsetObject;
    private String total_cost_in_usd_cents;
    private String estimated_at;
    private String equivalent_carbon_in_kg;
    private String electricity_in_kwh;
    private String rec_cost_in_usd_cents;
    private String transaction_cost_in_usd_cents;
    Cost costObject;
    private String pretty_url;


    // Getter Methods

    public String getSlug() {
        return slug;
    }

    public String getEnvironment() {
        return environment;
    }

    public String getState() {
        return state;
    }

    public Renewable_energy_certificate getRenewable_energy_certificate() {
        return renewable_energyCertificateObject;
    }

    public String getMicro_rec_count() {
        return micro_rec_count;
    }

    public String getMicro_units() {
        return micro_units;
    }

    public Offset getOffset() {
        return OffsetObject;
    }

    public String getTotal_cost_in_usd_cents() {
        return total_cost_in_usd_cents;
    }

    public String getEstimated_at() {
        return estimated_at;
    }

    public String getEquivalent_carbon_in_kg() {
        return equivalent_carbon_in_kg;
    }

    public String getElectricity_in_kwh() {
        return electricity_in_kwh;
    }

    public String getRec_cost_in_usd_cents() {
        return rec_cost_in_usd_cents;
    }

    public String getTransaction_cost_in_usd_cents() {
        return transaction_cost_in_usd_cents;
    }

    public Cost getCost() {
        return costObject;
    }

    public String getPretty_url() {
        return pretty_url;
    }

    // Setter Methods

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public void setState(String state) {
        this.state = state;
    }

    public void setRenewable_energy_certificate(Renewable_energy_certificate renewable_energyCertificateObject) {
        this.renewable_energyCertificateObject = renewable_energyCertificateObject;
    }

    public void setMicro_rec_count(String micro_rec_count) {
        this.micro_rec_count = micro_rec_count;
    }

    public void setMicro_units(String micro_units) {
        this.micro_units = micro_units;
    }

    public void setOffset(Offset offsetObject) {
        this.OffsetObject = offsetObject;
    }

    public void setTotal_cost_in_usd_cents(String total_cost_in_usd_cents) {
        this.total_cost_in_usd_cents = total_cost_in_usd_cents;
    }

    public void setEstimated_at(String estimated_at) {
        this.estimated_at = estimated_at;
    }

    public void setEquivalent_carbon_in_kg(String equivalent_carbon_in_kg) {
        this.equivalent_carbon_in_kg = equivalent_carbon_in_kg;
    }

    public void setElectricity_in_kwh(String electricity_in_kwh) {
        this.electricity_in_kwh = electricity_in_kwh;
    }

    public void setRec_cost_in_usd_cents(String rec_cost_in_usd_cents) {
        this.rec_cost_in_usd_cents = rec_cost_in_usd_cents;
    }

    public void setTransaction_cost_in_usd_cents(String transaction_cost_in_usd_cents) {
        this.transaction_cost_in_usd_cents = transaction_cost_in_usd_cents;
    }

    public void setCost(Cost costObject) {
        this.costObject = costObject;
    }

    public void setPretty_url(String pretty_url) {
        this.pretty_url = pretty_url;
    }
}


