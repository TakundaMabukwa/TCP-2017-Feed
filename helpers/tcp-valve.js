require("dotenv").config();

let isValveClosed = process.env.TCP_VALVE_CLOSED === 'true';

const setValve = (closed) => {
  isValveClosed = closed;
};

const isValveOpen = () => !isValveClosed;

module.exports = { isValveOpen, setValve };