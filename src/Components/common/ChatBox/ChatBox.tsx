import { useState, useRef, useEffect } from "react";
import emailjs from "emailjs-com";
import { snackbarService } from "uno-material-ui";
import { Tooltip } from "@material-ui/core";
import { Button } from "@material-ui/core";

import {
  UpCircleOutlined,
  DownCircleOutlined,
  LeftOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { useStyles } from "./style";

const ChatBox = () => {
  const classes = useStyles();
  const form = useRef(null);
  const message = useRef(null);

  const [showChatBox, setShowChatBox] = useState(false);

  // EmailJS Credentials
  const SERVICE_ID = "service_y5igv03";
  const TEMPLATE_ID = "template_g92ud5l";
  const USER_ID = "UCv_p-ftFj9rxKnn0";

  const sendEmail = (e: any) => {
    e.preventDefault();
    if (message.current.value.trim().length) {
      emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, USER_ID).then(
        (result) => {
          form && form.current.reset();
          snackbarService.showSnackbar(
            "Your feedback was sent successfully.",
            "success"
          );
        },
        (error) => {
          snackbarService.showSnackbar(
            "Something went wrong! Please email us directly at support@redmatterapp.com",
            "error"
          );
        }
      );
    } else {
      snackbarService.showSnackbar("Please enter a valid Feedback", "error");
    }
  };

  return (
    <div className={classes.chatBoxContainer}>
      {/* Icon */}

      {showChatBox ? (
        <DownCircleOutlined
          className={classes.icon}
          onClick={() => setShowChatBox((prev) => !prev)}
        />
      ) : (
        <Tooltip title={"Click here to send feedback to the Red Matter Team."}>
          <Button
            color="primary"
            variant="contained"
            onClick={() => setShowChatBox((prev) => !prev)}
            style={{
              marginBottom: 5,
              marginRight: 5,
            }}
          >
            Send Feedback
          </Button>
        </Tooltip>
      )}
      {/* Chat Box */}
      <div
        className={`${classes.chatBox} ${
          showChatBox ? classes.open : classes.close
        }`}
      >
        {/* Chat Box Header */}
        <div className={classes.chatBoxHeader}>
          <LeftOutlined
            className={classes.backIcon}
            onClick={() => setShowChatBox(false)}
          />
          <div>
            <h3 className={classes.chatBoxHeaderTitle}> Feedback</h3>
            <p className={classes.headerMessage}>
              Send Feature Requests & Feedback
            </p>
          </div>
        </div>
        {/* Chat Box Body */}

        <form
          style={{ backgroundColor: "white" }}
          ref={form}
          onSubmit={sendEmail}
        >
          {/* <div className="field">
    <label for="from_name">You Email</label>
    <input type="text" name="from_name" id="from_name">
  </div>

  <div class="field">
    <label for="message">message</label>
    <input type="text" name="message" id="message">
  </div>

  <input type="submit" id="button" value="Send Email" > */}

          <input
            type="text"
            placeholder="Your email address"
            className={classes.mailInput}
            name="from_name"
          />
          <textarea
            name="message"
            id=""
            placeholder="message"
            className={classes.messageInput}
            ref={message}
          ></textarea>

          <button type="submit" className={classes.sendButton}>
            <SendOutlined className={classes.sendIcon} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
