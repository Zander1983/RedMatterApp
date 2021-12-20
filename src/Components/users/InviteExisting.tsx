import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory, useParams } from "react-router-dom";
import { snackbarService } from "uno-material-ui";
import userManager from "./userManager";
const useStyles = makeStyles((theme) => ({
  content: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    height: 50,
    marginRight: 20,
    width: 170,
    backgroundColor: "#66a",
    color: "white",
    "&:hover": {
      backgroundColor: "#333333",
    },
  },
}));

// interfaces
interface ParamsType {
  id: string;
}

interface Invite {
  accepted: boolean;
  facilityId: string;
  email: string;
  organisationId: string;
  __v: number;
  _id: string;
}

interface Payload {
  email: string;
  inviteId: string;
  facilityId: string;
  organisationId: string;
  verified: true;
}

const InviteExisting = () => {
  const params: ParamsType = useParams();
  const classes = useStyles();
  const history = useHistory();
  const [invitation, setInvitation] = useState<Invite>();

  const onSubmit = async () => {
    try {
      const data: Payload = {
        email: invitation.email,
        inviteId: invitation._id,
        facilityId: invitation.facilityId,
        organisationId: invitation.organisationId,
        verified: true,
      };
      const response = await axios.post(
        "/api/addExistingInvitedUserToDatabase",
        data,
        {
          headers: {
            token: userManager.getToken(),
          },
        }
      );

      snackbarService.showSnackbar(response?.data?.message, "success");
      history.push("/");
    } catch (err: any) {
      const errMsg = err?.response?.data?.message;
      snackbarService.showSnackbar(errMsg, "error");
    }
  };

  useEffect(() => {
    !userManager.isLoggedIn() && history.push("/login");
    fetchInvitation(params.id);
  }, []);

  const fetchInvitation = async (id: string) => {
    try {
      const { response }: { response: Invite } = await (
        await axios.get(`/api/invite/${id}`)
      ).data;
      setInvitation(response);
    } catch (error: any) {
      const errorMsg = error.response.data.message;
      snackbarService.showSnackbar(`${errorMsg}`, "error");
      history.push("/");
    }
  };

  return (
    <Button className={classes.content} onClick={() => onSubmit()}>
      {" "}
      Accept Invitation{" "}
    </Button>
  );
};
export default InviteExisting;
