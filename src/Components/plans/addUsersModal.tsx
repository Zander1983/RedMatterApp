import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import CircularProgress from "@material-ui/core/CircularProgress";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { snackbarService } from "uno-material-ui";
import { Facility } from "Components/users/userManager";
import userManager from "Components/users/userManager";

export default function AddUsersModal(props: {
  open: boolean;
  user: any;
  close: Function;
  copiedToClipboard: Function;
  facility: Facility;
}) {
  const addUserForm = useRef();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    organizationId: userManager.getOrganiztionID(),
    facilityId: props.facility?._id,
  });

  useEffect(() => {
    setFormData((prevData: any) => {
      return { ...prevData, facilityId: props.facility?._id };
    });
  }, [props.facility]);

  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/invites", formData, {
        headers: {
          token: userManager.getToken(),
        },
      });

      setFormData((prevData: any) => {
        return { ...prevData, email: "" };
      });
      setLoading(false);
      props.close();
      snackbarService.showSnackbar(response?.data?.message, "success");
    } catch (err: any) {
      const errMsg = err.response.data.message;
      snackbarService.showSnackbar(errMsg, "error");
      setFormData((prevData: any) => {
        return { ...prevData, email: "" };
      });
      props.close();
    }
  };

  return (
    <div>
      {props.facility ? (
        <Dialog open={props.open} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title" style={{ margin: "auto" }}>
            Add Users To Your Organisation
          </DialogTitle>
          <DialogContent>
            {/* Form */}
            <ValidatorForm
              ref={addUserForm}
              onSubmit={() => {
                handleSubmit();
              }}
            >
              {/* Email */}
              <TextValidator
                style={{
                  width: "100%",
                  marginTop: 30,
                  backgroundColor: "white",
                }}
                variant="outlined"
                label="Email"
                onChange={handleChange}
                name="email"
                value={formData.email}
                validators={["required", "isEmail"]}
                errorMessages={[
                  "Email Address is required",
                  "Email Address is not valid",
                ]}
              />
              {/* Predefined OrganisationId */}
              <TextValidator
                style={{
                  width: "100%",
                  marginTop: 30,
                  backgroundColor: "white",
                }}
                variant="outlined"
                label="OrganizationId"
                name="organizationId"
                disabled={true}
                value={formData.organizationId}
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

                <Button type="submit">
                  {loading ? (
                    <CircularProgress style={{ width: 23, height: 23 }} />
                  ) : (
                    "Add User"
                  )}
                </Button>
              </div>
            </ValidatorForm>
          </DialogContent>
        </Dialog>
      ) : (
        <Dialog open={props.open} aria-labelledby="form-dialog-title">
          <DialogTitle id="form-dialog-title" style={{ margin: "auto" }}>
            Create a Facility in order to Add New Users!
          </DialogTitle>
          <Button
            onClick={() => {
              props.close();
            }}
            color="primary"
          >
            Close
          </Button>
        </Dialog>
      )}
    </div>
  );
}
