// Every chart imports Highcharts from HERE, not from 'highcharts' directly.
// That way extra modules are loaded exactly once, in one place.
import Highcharts from 'highcharts';
// Adds screen-reader descriptions and keyboard navigation to all charts.
import 'highcharts/modules/accessibility';

export default Highcharts;
