import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [status, setStatus] = useState("");
  const sendRequest = () => {
    axios.get("/startContainer").then(res => {
      console.log(res);
    });
  };
  return (
    <div>
      <h3>Response{status}</h3>
      <button onClick={sendRequest}>send Request</button>
    </div>
  );
};

export default App;
