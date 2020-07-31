package application.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import application.service.OffsetEstimateService;
import application.service.external.cloverly.OffsetEstimateServiceImpl;

//@Configuration
public class DevelopmentConfiguration {

    /*@Bean
    OffsetEstimateService offsetEstimateService() {
        RestTemplate restTemplate = new RestTemplate();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(new ObjectMapper());
        restTemplate.getMessageConverters().add(converter);
        return new OffsetEstimateServiceImpl(restTemplate);
    }*/
}
