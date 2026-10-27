module.exports = function (plop) {
  // Custom helper to convert text to uppercase
  plop.setHelper("toUpperCase", function (text) {
    return text.toUpperCase();
  });

  // Custom helper to convert string to kebab-case
  plop.setHelper("toKebabCase", function (text) {
    return text
      .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2") // Convert camelCase to kebab-case
      .toLowerCase() // Convert to lowercase
      .replace(/^-/, ""); // Remove hyphen at the beginning
  });

  // Common actions function
  const commonActions = (folderName) => {
    if (folderName === "controller") {
      return [
        {
          type: "add",
          path: `src/controllers/{{toKebabCase name}}/{{toKebabCase name}}.ts`,
          templateFile: "plop-templates/controller.ts.hbs",
        },
      ];
    }

    return [
      {
        type: "add",
        path: `src/controllers/{{toKebabCase name}}/{{toKebabCase name}}.ts`,
        templateFile: "plop-templates/controller.ts.hbs",
      },
    ];
  };

  // Component generator for controller
  plop.setGenerator("controller", {
    description: "Create a controller",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your controller name?",
      },
    ],
    actions: commonActions("controller"),
  });

  plop.setGenerator("model", {
    description: "Create a new mongoose model",
    prompts: [
      {
        type: "input",
        name: "modelName",
        message: "What is your model model?",
      },
    ],
    actions: [
      // Create mongoose schema file using snake case for file name
      {
        type: "add",
        path: "src/database/models/{{toKebabCase modelName}}.model.ts",
        templateFile: "plop-templates/mongoose-schema.hbs",
      },
      {
        type: "add",
        path: "src/database/active-records/{{toKebabCase modelName}}.record.ts",
        templateFile: "plop-templates/active-record.hbs",
      },
      // Modify enum file to add the model name
      {
        type: "modify",
        path: "src/types/enums/ModelsNames.enum.ts",
        pattern: /(?<=enum ModelsNamesEnum {)([\s\S]*?)(?=})/,
        template:
          "$1\n  {{constantCase modelName}} = '{{snakeCase modelName}}'",
      },
      // Custom transform function to remove the last comma
      {
        type: "modify",
        path: "src/types/enums/ModelsNames.enum.ts",
        transform: (fileContents) => {
          return fileContents.replace(/,\s*$/, "\n}");
        },
      },
    ],
  });
};
