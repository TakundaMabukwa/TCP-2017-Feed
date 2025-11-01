require("dotenv").config();

const ALLOWED_IPS = [
  process.env.ALLOWED_IP1,
  process.env.ALLOWED_IP2,
  process.env.ALLOWED_IP,
  process.env.ALLOWED_IP_RENDI,
  process.env.ALLOWED_IP_LOCALHOST,
  process.env.ALLOWED_IP3,
  process.env.ALLOWED_IP4,
  process.env.ALLOWED_IP5,
  process.env.ALLOWED_IP6,
  process.env.ALLOWED_IP_SUBNET,
  process.env.ALLOWED_IP7,
  process.env.ALLOWED_IP_BRIAN
].filter(Boolean);

module.exports = { ALLOWED_IPS };