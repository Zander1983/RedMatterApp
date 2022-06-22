import { useState, useRef, useEffect } from "react";
import emailjs from "emailjs-com";
import { snackbarService } from "uno-material-ui";
import { Tooltip } from "@material-ui/core";

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
  const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const USER_ID = process.env.REACT_APP_EMAILJS_USER_ID;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowChatBox(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

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
          <UpCircleOutlined
            className={classes.icon}
            onClick={() => setShowChatBox((prev) => !prev)}
          />
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
          <input
            type="text"
            placeholder="support@redmatterapp.com"
            className={classes.mailInput}
            name="gmail"
          />
          <textarea
            name="message"
            id=""
            placeholder="message"
            className={classes.messageInput}
            ref={message}
          ></textarea>
          <input
            type="text"
            name="pageLink"
            value={window.location.href}
            readOnly
            style={{ display: "none" }}
          />

          <button type="submit" className={classes.sendButton}>
            <SendOutlined className={classes.sendIcon} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
