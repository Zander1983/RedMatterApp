import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ReactSVG } from "react-svg";
import { Box } from "@material-ui/core";
import sliderSettings from "./sliderSetting";
import style from "./style";

type LogoSliderType = {
  rtl?: any;
  content: any;
};
const LogosSlider = ({ rtl, content }: LogoSliderType) => {
  const classes = style();

  const settings = sliderSettings(rtl);
  // const settings = {
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1,
  // };

  return (
    <Box
      mb={5}
      className={classes.logosContainer}
      // style={{ backgroundColor: "black" }}
    >
      <Slider {...settings}>
        {content &&
          content.length > 0 &&
          content.map((item: any, index: number) => (
            <img
              src={"/universityLogos/University of Michigan.png"}
              alt={`Clients-${index}`}
              className={classes.logo}
              key={index}
              height={50}
              style={{ maxWidth: 140 }}
            />
            // <ReactSVG
            //   key={index}
            //   className={classes.logo}
            //   src={"/universityLogos/University of Michigan.png"}
            //   alt={`Clients-${index}`}
            // />
          ))}
      </Slider>
      {/* <div>
        <Slider {...settings}>
          <div>
            <img
              src={"/universityLogos/University of Michigan.png"}
              height={50}
              style={{ maxWidth: 140 }}
            />
            <img
              src={"/universityLogos/University of Michigan.png"}
              height={50}
              style={{ maxWidth: 140 }}
            />
          </div>
        </Slider>
      </div> */}
    </Box>
  );
};

export default LogosSlider;
