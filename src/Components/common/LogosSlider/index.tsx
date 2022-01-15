import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import sliderSettings from "./sliderSetting";
import style from "./style";
import "./cssStyle.css";

type LogoSliderType = {
  rtl?: any;
  content: any;
};

const LogosSlider = ({ rtl, content }: LogoSliderType) => {
  const classes = style();
  const settings = sliderSettings(rtl);
  return (
    <div className={classes.logoContainerWidth}>
      <Slider {...settings}>
        {content &&
          content.length > 0 &&
          content.map((item: any, index: number) => (
            <div key={Math.random() + index }>
              <img
                src={"/universityLogos/" + item.name}
                alt={`Clients-${index}`}
                className={classes.logo}
                height={75}
              />
            </div>
          ))}
      </Slider>
    </div>
  );
};

export default LogosSlider;
