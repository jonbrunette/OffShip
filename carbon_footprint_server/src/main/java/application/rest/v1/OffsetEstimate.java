package application.rest.v1;


import application.model.OffsetEstimateResponse;
import application.model.UnitSystem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import application.service.OffsetEstimateService;

@RestController
@RequestMapping("/v1/offset")
public class OffsetEstimate {

    private final OffsetEstimateService offsetEstimateService;

    @Autowired
    public OffsetEstimate(OffsetEstimateService offsetEstimateService) {
        this.offsetEstimateService = offsetEstimateService;
    }

    @GetMapping("/estimate-by-weight")
    public OffsetEstimateResponse estimateCarbonOffset(
            @RequestParam UnitSystem unitSystem,
            @RequestParam Integer weight) {

        return offsetEstimateService.estimateCarbonOffset(unitSystem, weight);
    }
}
