# compliance-md-generator

`compliance-md-generator` creates pie charts and donut charts based on the compliance controls in an OSCAL file. By default it will create pie charts on the % of our opinionated list of technical controls met.

## Where is this useful?

If you are the maintainer or creator of a platform or system that leverages OSCAL to map compliance controls to compliance frameworks and are looking for a high level way to show what controls are met by a codebase.

### Usage

#### Run the Javascript in CI or locally

Run the Javascript file

```bash
node generateComplianceMD.js ./path-to-oscal.yaml
```

This creates the images and places them in a folder compliance-imaged located in the root of the codebase.

### What's Included?
This repo contains an example of our COMPLIANCE.md where we use the pie and donut charts created by the generatePieChartSvg.js. It also includes txt files of our opinionated technical controls for NIST 800-53 High, Moderate, and Low. Lastly it contains an example of the compliance-images folder with the images inside of it.

*Note the images are a point in time created as an example and will not be updated.