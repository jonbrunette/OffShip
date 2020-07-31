package application.service.external.cloverly.response;

public class Renewable_energy_certificate {
    private String slug;
    private String name;
    private String city;
    private String province;
    private String country;
    private String renewable_type;
    private String total_capacity;
    private String technical_details;
    private String deprecated;


    // Getter Methods

    public String getSlug() {
        return slug;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public String getProvince() {
        return province;
    }

    public String getCountry() {
        return country;
    }

    public String getRenewable_type() {
        return renewable_type;
    }

    public String getTotal_capacity() {
        return total_capacity;
    }

    public String getTechnical_details() {
        return technical_details;
    }

    public String getDeprecated() {
        return deprecated;
    }

    // Setter Methods

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setRenewable_type(String renewable_type) {
        this.renewable_type = renewable_type;
    }

    public void setTotal_capacity(String total_capacity) {
        this.total_capacity = total_capacity;
    }

    public void setTechnical_details(String technical_details) {
        this.technical_details = technical_details;
    }

    public void setDeprecated(String deprecated) {
        this.deprecated = deprecated;
    }
}
