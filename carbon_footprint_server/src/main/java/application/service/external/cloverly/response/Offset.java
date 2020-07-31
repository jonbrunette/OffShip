package application.service.external.cloverly.response;

public class Offset {
    private String slug;
    private String name;
    private String city;
    private String province;
    private String country;
    private String offset_type;
    private String offset_type_slug;
    private String total_capacity;
    private String technical_details;
    private String available_carbon_in_kg;
    private String pretty_url;


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

    public String getOffset_type() {
        return offset_type;
    }

    public String getOffset_type_slug() {
        return offset_type_slug;
    }

    public String getTotal_capacity() {
        return total_capacity;
    }

    public String getTechnical_details() {
        return technical_details;
    }

    public String getAvailable_carbon_in_kg() {
        return available_carbon_in_kg;
    }

    public String getPretty_url() {
        return pretty_url;
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

    public void setOffset_type(String offset_type) {
        this.offset_type = offset_type;
    }

    public void setOffset_type_slug(String offset_type_slug) {
        this.offset_type_slug = offset_type_slug;
    }

    public void setTotal_capacity(String total_capacity) {
        this.total_capacity = total_capacity;
    }

    public void setTechnical_details(String technical_details) {
        this.technical_details = technical_details;
    }

    public void setAvailable_carbon_in_kg(String available_carbon_in_kg) {
        this.available_carbon_in_kg = available_carbon_in_kg;
    }

    public void setPretty_url(String pretty_url) {
        this.pretty_url = pretty_url;
    }
}