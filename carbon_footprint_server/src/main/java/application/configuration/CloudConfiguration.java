package application.configuration;

import application.service.OffsetEstimateService;
import application.service.internal.OffsetEstimateServiceImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnCloudPlatform;
import org.springframework.boot.cloud.CloudPlatform;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
//@ConditionalOnCloudPlatform(CloudPlatform.CLOUD_FOUNDRY)
public class CloudConfiguration {

    @Bean
    OffsetEstimateService offsetEstimateService() {
        return new OffsetEstimateServiceImpl();
    }
}
