const assert = require('assert');
const { parseFuelData } = require('./helpers/fuel-parser');

function runTests() {
  const twoProbeSample = '0,0,0,0,03E8,0,07D0,0,1E,0,64,0,01F4,0,0320,0,19,0,50';
  const parsedTwoProbe = parseFuelData(twoProbeSample);

  assert.deepStrictEqual(parsedTwoProbe, {
    fuel_probe_1_level: '100.0',
    fuel_probe_1_volume_in_tank: '200.0',
    fuel_probe_1_temperature: '30',
    fuel_probe_1_level_percentage: '100',
    fuel_probe_2_level: '50.0',
    fuel_probe_2_volume_in_tank: '80.0',
    fuel_probe_2_temperature: '25',
    fuel_probe_2_level_percentage: '80'
  });

  const singleProbeSample = '0,0,0,0,00FA,0,01F4,0,14,0,32';
  const parsedSingleProbe = parseFuelData(singleProbeSample);

  assert.deepStrictEqual(parsedSingleProbe, {
    fuel_probe_1_level: '25.0',
    fuel_probe_1_volume_in_tank: '50.0',
    fuel_probe_1_temperature: '20',
    fuel_probe_1_level_percentage: '50'
  });

  assert.strictEqual(parseFuelData(''), null);
  assert.strictEqual(parseFuelData('0,1,2'), null);

  console.log('Fuel parser tests passed');
}

runTests();
