import { useStyles } from "./style";
import {
  UpCircleOutlined,
  DownCircleOutlined,
  LeftOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useState, useRef } from "react";
import emailjs from "emailjs-com";
import { snackbarService } from "uno-material-ui";
const ChatBox = () => {
  const classes = useStyles();
  const [showChatBox, setShowChatBox] = useState(false);
  const form = useRef(null);
  const message = useRef(null);

  // EmailJS Credentials
  const SERVICE_ID = "service_xyqlqni";
  const TEMPLATE_ID = "template_hn4j6wk";
  const USER_ID = "user_zALoLS3eVkg7yKN6e5kSL";

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
            "Could not feedback due to some technical issues, reload the page and try again!",
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
        <UpCircleOutlined
          className={classes.icon}
          onClick={() => setShowChatBox((prev) => !prev)}
        />
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
            <h3 className={classes.chatBoxHeaderTitle}> Card Support Team </h3>
            <p className={classes.headerMessage}> We are here to Help </p>
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
            placeholder="user@mail.com"
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

          <button type="submit" className={classes.sendButton}>
            <SendOutlined className={classes.sendIcon} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default ChatBox;
