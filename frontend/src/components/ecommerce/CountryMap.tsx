// react plugin for creating vector maps
import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";

// Define the component props
interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = ({ mapColor }) => {
  return (
    <VectorMap
      map={worldMill}
      backgroundColor="transparent"
      markerStyle={{
        initial: {
          fill: "#465FFF",
          r: 4, // Custom radius for markers
        } as any, // Type assertion to bypass strict CSS property checks
      }}
      markersSelectable={true}
      markers={[
        {
          latLng: [37.2580397, -104.657039],
          name: "United States",
          style: {
            fill: "#465FFF",
            borderWidth: 1,
            borderColor: "white",
            stroke: "#383f47",
          },
        },
        {
          latLng: [20.7504374, 73.7276105],
          name: "India",
          style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
        },
        {
          latLng: [53.613, -11.6368],
          name: "United Kingdom",
          style: { fill: "#465FFF", borderWidth: 1, borderColor: "white" },
        },
      ]}
      zoomOnScroll={false}
      zoomMax={12}
      zoomMin={1}
      zoomAnimate={true}
      zoomStep={1.5}
      regionStyle={{
        initial: {
          fill: mapColor || "#D0D5DD", // Default color
          fillOpacity: 1,
          fontFamily: "Outfit",
          stroke: "none",
          strokeWidth: 0,
          strokeOpacity: 0,
        },
        hover: {
          fillOpacity: 0.7,
          cursor: "pointer",
          fill: "#465fff",
          stroke: "none",
        },
        selected: {
          fill: "#465FFF",
        },
        selectedHover: {},
      }}
      series={{
        regions: [
          {
            // Highlight the regions of interest with specific colors
            values: {
              // America
              US: 1,
              CA: 1,
              MX: 1,
              BR: 1,

              // India
              IN: 1,
              PK: 1,
              BD: 1,

              // Europe
              FR: 1,
              DE: 1,
              IT: 1,
              ES: 1,
              GB: 1,

              // Southeast Asia
              SG: 1,
              MY: 1,
              ID: 1,
              TH: 1,
              PH: 1,
              VN: 1,
              LA: 1,
              KH: 1,
              MM: 1,
            },
            scale: ["#465FFF"], // Use scale to map value 1 to the desired color
            attribute: "fill", // Apply fill color to the region
          },
        ],
      }}
    />
  );
};

export default CountryMap;
