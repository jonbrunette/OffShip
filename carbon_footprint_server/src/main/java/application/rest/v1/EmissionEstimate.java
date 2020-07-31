package application.rest.v1;

import application.model.EmissionEstimateResponse;
import application.model.UnitSystem;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("/v1/emission")
public class EmissionEstimate {

    private final int places = 2;

    @GetMapping("/ground-shipping")
    public EmissionEstimateResponse calculateForGroundShipping(
            @RequestParam UnitSystem unitSystem,
            @RequestParam double weightInTons,
            @RequestParam double distance) {

        return createResponse(unitSystem, 0.209, weightInTons, distance);

    }

    @GetMapping("/air-shipping")
    public EmissionEstimateResponse calculateForAirShipping(
            @RequestParam UnitSystem unitSystem,
            @RequestParam double weightInTons,
            @RequestParam double distance) {

        return createResponse(unitSystem, 1.278, weightInTons, distance);

    }

    @GetMapping("/rail-shipping")
    public EmissionEstimateResponse calculateForRailShipping(
            @RequestParam UnitSystem unitSystem,
            @RequestParam double weightInTons,
            @RequestParam double distance) {

        return createResponse(unitSystem, 0.021, weightInTons, distance);

    }

    @GetMapping("/ocean-shipping")
    public EmissionEstimateResponse calculateForOceanShipping(
            @RequestParam UnitSystem unitSystem,
            @RequestParam double weightInTons,
            @RequestParam double distance) {

        return createResponse(unitSystem, 0.0409, weightInTons, distance);

    }

    private EmissionEstimateResponse createResponse(UnitSystem unitSystem,
                                                    double shippingCostPerTonMile,
                                                    double weightInTons,
                                                    double distance) throws RuntimeException {
        String unit;
        BigDecimal bd;
        if (unitSystem == UnitSystem.IMPERIAL) {
            unit = "pounds/ton-mile";
            bd = new BigDecimal(Double.toString(shippingCostPerTonMile * (weightInTons * distance) * 0.454));
        } else {
            unit = "kilograms/ton-km";
            bd = new BigDecimal(Double.toString((shippingCostPerTonMile * (weightInTons * distance))/ 1.609));
        }
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return new EmissionEstimateResponse(unit, bd.doubleValue());
    }

}
