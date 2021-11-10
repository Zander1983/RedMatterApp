import React from "react";

const PrototypeNotice = (props: { experimentId: string }) => {
  return props.experimentId === undefined ? (
    <div
      style={{
        color: "#555",
        backgroundColor: "#dedede",
        paddingBottom: 1,
        paddingTop: 15,
        fontSize: "1.1em",
        textAlign: "center",
      }}
    >
      <p>
        This is a <b>PROTOTYPE</b> showing functionalities we expect to add to
        Red Matter.
        <br />
        It uses local anonymous files for you to test how the app works quick
        and easy.
        <br />
        You can help us improve or learn more by sending an email to{" "}
        <a href="mailto:support@redmatterapp.com">
          <b>support@redmatterapp.com</b>
        </a>
        .
      </p>
    </div>
  ) : null;
};

export default PrototypeNotice;
