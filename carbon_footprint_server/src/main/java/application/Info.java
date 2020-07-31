package application;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class Info {

  @EventListener(ApplicationReadyEvent.class)
    public void contextRefreshedEvent() {
      System.out.println("The following endpoints are available by default :-");
      System.out.println("  Health        : http://localhost:8080/health");
      System.out.println("  Application   : http://localhost:8080/v1/");
      System.out.println("  Swagger       : http://localhost:8080/swagger-ui.html");

  }

}
