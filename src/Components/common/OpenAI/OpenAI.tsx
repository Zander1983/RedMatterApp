import { useState, useRef, useEffect } from "react";
import { snackbarService } from "uno-material-ui";
import { Tooltip } from "@material-ui/core";
import { Button } from "@material-ui/core";
import axios from "axios";

import {
  UpCircleOutlined,
  DownCircleOutlined,
  LeftOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { useStyles } from "./style";

const OpenAI = () => {
  const classes = useStyles();
  const form = useRef(null);
  const question = useRef(null);
  const [questionResponse, setQuestionResponse] = useState(null);
  const [isSpinnerActive, setIsActive] = useState(false);
  const [showOpenAI, setShowOpenAI] = useState(false);

  const sendQuestion = async (e: any) => {
    e.preventDefault();
    if (question.current.value.trim().length) {
      // make a call to OpenAI API here
      // https://beta.openai.com/docs/api-reference/completions/create
      // setIsActive(true);
      // const response = await axios.post(
      //   "https://api.openai.com/v1/completions",
      //   {
      //     prompt: "In flow cytometry, " + question.current.value,
      //     model: "text-davinci-003",
      //     // model: "text-curie-001",
      //     // model: "text-ada-001",
      //     max_tokens: 1024,
      //     temperature: 0.5,
      //   },
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization:
      //         "Bearer sk-xxx",
      //     },
      //   }
      // );
      // console.log(response.data);
      // setIsActive(false);
      // if (response.data && response.data.choices) {
      //   setQuestionResponse(response.data.choices[0].text);
      // }
    } else {
      snackbarService.showSnackbar("Please enter a valid Feedback", "error");
    }
  };

  return (
    <div className={classes.OpenAIContainer}>
      {/* Icon */}

      {/* Chat Box */}
      <div
        className={`${classes.OpenAI} ${
          showOpenAI ? classes.open : classes.close
        }`}
      >
        <div className={classes.OpenAIHeader}>
          <LeftOutlined
            className={classes.backIcon}
            onClick={() => setShowOpenAI(false)}
          />
          <div>
            <h3 className={classes.OpenAIHeaderTitle}>
              {" "}
              Ask OpenAI a Question
            </h3>
            <p
              className={classes.headerMessage}
              style={{
                marginTop: "1px",
              }}
            >
              e.g. In flow cytometry, how would I detect B cells?
            </p>
          </div>
        </div>

        <form
          style={{ backgroundColor: "white" }}
          ref={form}
          onSubmit={sendQuestion}
        >
          <input
            type="text"
            className={classes.mailInput}
            name="question"
            ref={question}
            style={{
              paddingLeft: "140px",
            }}
            onClick={() => {
              // set the value to empty string onClick in input
              question.current.value = "";
              setQuestionResponse("");
            }}
          />
          <span
            style={{
              position: "absolute",
              display: "block",
              left: "3px",
              top: "75px",
              zIndex: "9",
            }}
          >
            Q. In flow cytometry...
          </span>
          <button type="submit" className={classes.sendButton}>
            <SendOutlined className={classes.sendIcon} />
          </button>
        </form>

        <div
          style={{
            width: "100%",
            textAlign: "left",
            padding: "3px",
          }}
        >
          A. {isSpinnerActive && <div className="spinner"></div>}
          {questionResponse ? questionResponse : ""}
        </div>
      </div>

      {showOpenAI ? (
        <DownCircleOutlined
          className={classes.icon}
          onClick={() => setShowOpenAI((prev) => !prev)}
        />
      ) : (
        <Tooltip
          title={"Click here to ask Open AI a question about Flow Cytomtry"}
        >
          <Button
            color="primary"
            variant="contained"
            onClick={() => setShowOpenAI((prev) => !prev)}
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              width: "224px",
            }}
          >
            Ask Open AI a question
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default OpenAI;
