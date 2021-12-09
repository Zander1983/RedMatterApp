import { useState, useRef } from "react";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { ValidatorForm, TextValidator } from "react-material-ui-form-validator";
import { snackbarService } from "uno-material-ui";
import userManager from "Components/users/userManager";

export default function AddUsersModal(props: {
  open: boolean;
  user: any;
  close: Function;
  copiedToClipboard: Function;
}) {
  const addUserForm = useRef();
  const [formData, setFormData] = useState({
    email: "",
    organizationId: userManager.getOrganiztionID(),
  });

  const handleChange = (event: any) => {
    setFormData((prevData: any) => {
      return { ...prevData, [event.target.name]: event.target.value };
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/invites", formData, {
        headers: {
          token: userManager.getToken(),
        },
      });

      setFormData((prevData: any) => {
        return { ...prevData, email: "" };
      });
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

              <Button type="submit">{"Add User"}</Button>
            </div>
          </ValidatorForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
