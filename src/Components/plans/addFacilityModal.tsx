import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { snackbarService } from "uno-material-ui";
import userManager from "Components/users/userManager";
import { Facility } from "Components/users/userManager";

const AddFacilityModal = (props: {
  open: boolean;
  close: Function;
  facility: Facility;
}) => {
  const dispatch = useDispatch();
  const addFacilityForm = useRef();
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
  });
  // const { facility } = props;
  useEffect(() => {
    if (props.facility) {
      setFormData({
        location: props.facility?.location,
        name: props.facility?.name,
      });
    }
  }, [props.facility]);

  useEffect(() => {
    setIsChanged(
      formData.name !== props.facility?.name ||
        formData.location !== props.facility?.location
    );
  }, [formData]);

  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
          props.facility ? "/api/updateFacility" : "/api/createFacility",
          props.facility ? { ...formData, id: props.facility._id } : formData,
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      );

      dispatch({
        type: "ADD_FACILITY",
        payload: { facility: response.data?.facility },
      });
      setLoading(false);
      props.close();
      snackbarService.showSnackbar(response?.data?.message, "success");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message;
      snackbarService.showSnackbar(errMsg, "error");
      props.close();
    }
  };

  return (
    <div>
      <Dialog open={props.open} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" style={{ margin: "auto" }}>
          {props.facility ? "Update " : "Add "}
          {"Facility To Your Organisation"}
        </DialogTitle>
        <DialogContent>
          {/* Form */}
          <ValidatorForm
            ref={addFacilityForm}
            onSubmit={() => {
              handleSubmit();
            }}
          >
            {/* Name */}
            <TextValidator
              style={{
                width: "100%",
                marginTop: 30,
                backgroundColor: "white",
              }}
              variant="outlined"
              label="Name"
              onChange={handleChange}
              name="name"
              value={formData.name}
              validators={["required"]}
              errorMessages={["Email Address is required"]}
            />

            {/* Location */}
            <TextValidator
              style={{
                width: "100%",
                marginTop: 30,
                backgroundColor: "white",
              }}
              variant="outlined"
              label="Location"
              name="location"
              onChange={handleChange}
              value={formData.location}
            />

            {/* Buttons */}
            <div
              style={{
                marginTop: 30,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => {
                  props.close();
                }}
                color="primary"
              >
                Close
              </Button>

              <Button type="submit" disabled={!isChanged}>
                {loading ? (
                  <CircularProgress style={{ width: 23, height: 23 }} />
                ) : props.facility ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </ValidatorForm>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AddFacilityModal;
