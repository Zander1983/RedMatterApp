import Button from "@material-ui/core/Button";
import { ButtonTypes } from "../../constants";

const btnSyles = {
  [ButtonTypes.PURPLE]: {
    backgroundColor: "#6666AA",
    color: "white",
    maxHeight: 40,
  },
  [ButtonTypes.GRAY]: {
    backgroundColor: "#fafafa",
    color: "#000000",
    maxHeight: 40,
  },
  [ButtonTypes.RED]: {
    backgroundColor: "#F44336",
    color: "white",
    maxHeight: 40,
  },
};

const Buttons = (props: {
  children: any;
  variant?: any;
  size?: any;
  color?: any;
  startIcon?: any;
  disabled?: boolean;
  endIcon?: any;
  onClick?: any;
  type?: any;
  style?: any;
  rest?: any;
}) => {
  return (
    <Button
      disabled={props.disabled}
      variant={props.variant}
      size={props.size}
      color={props.color}
      startIcon={props.startIcon}
      endIcon={props.endIcon}
      onClick={props.onClick}
      style={{
        ...btnSyles[props.type],
        ...props.style,
      }}
      {...props.rest}
    >
      {props.children}
    </Button>
  );
};

Buttons.defaultProps = {
  variant: "contained",
  color: "secondary",
};

export default Buttons;
