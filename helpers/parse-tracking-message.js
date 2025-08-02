function parseTrackingMessage(message) {
  message = message.trim();
  if (message.startsWith("^")) message = message.slice(1);
  if (message.endsWith("^")) message = message.slice(0, -1);

  const parts = message.split("|");

  return {
    Plate: parts[0],
    Speed: parseInt(parts[1], 10),
    Latitude: parseFloat(parts[2]),
    Longitude: parseFloat(parts[3]),
    LocTime: parts[4],
    Quality: parts[5],
    Mileage: parseInt(parts[6], 10),
    Pocsagstr: parts[7],
    Head: parts[8],
    Geozone: parts[9],
    DriverName: parts[10],
    NameEvent: parts[11],
    Temperature: parts[12],
    Address: parts[13],
    Statuses: parts[14],
    Rules: parts[15],
    LimMsg: parts[16],
    CustomerDriverID: parts[17],
    PlatformName: parts[18],
    EcmCode: parts[19],
    DriverAuthentication: parts[20],
    PlatformId: parts[21],
    UserId: parts[22],
    UserName: parts[23],
    CustomerId: parts[24],
    UAID: parts[25],
    UtcNowTime: parts[26],
    EngineState: parts[27],
    GeoAreaCircle: parts[28],
    GeoAreaPolygon: parts[29],
    GeoAreaRout: parts[30],
    EcmCategory: parts[31],
    EcmName: parts[32],
    DriverCode: parts[33], // Last unique field
  };
}

module.exports = { parseTrackingMessage };