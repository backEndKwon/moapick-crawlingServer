const path = require("path");
const { exec } = require("child_process");

const inputFile = path.join(__dirname, "../swagger/openapi.yaml");
const outputFile = path.join(__dirname, "../swagger/swagger.yaml");

exec(
  `swagger-cli bundle ${inputFile} --outfile ${outputFile} --type yaml`,
  (err, stdout, stderr) => {
    if (err) {
      console.error(`Error bundling YAML with swagger-cli: ${err}`);
      return;
    }
    console.log("Successfully bundled YAML file with swagger-cli!");
  }
);
