require("dotenv").config();

const ALLOWED_IPS = [
  process.env.ALLOWED_IP1 || "81.218.55.66",
  process.env.ALLOWED_IP2 || "212.150.50.68",
  process.env.ALLOWED_IP || "10.2.1.148",
  process.env.ALLOWED_IP_RENDI,
  "127.0.0.1",
  "143.198.204.127",
  "192.168.1.165",
  "64.227.138.235",
  "41.157.41.148",
  "10.2.1.0/24",
  "198.54.173.198",
];

module.exports = { ALLOWED_IPS };