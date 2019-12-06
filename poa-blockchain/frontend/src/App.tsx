import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [status, setStatus] = useState("");
  const sendRequest = () => {
    axios
      .post(
        "http://localhost:" + process.env.REACT_APP_BACKEND_PORT + "/register",
        { address: "0x" }
      )
      .then(res => {
        setStatus(res.data.msg);
      });
  };
  return (
    <div>
      <h3>Response</h3>
      <p>{status}</p>
      <button onClick={sendRequest}>send Request</button>
    </div>
  );
};

export default App;
