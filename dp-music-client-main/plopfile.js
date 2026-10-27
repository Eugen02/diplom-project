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
    if (folderName === "shared") {
      return [
        {
          type: "add",
          path: `src/components/shared-components/{{pascalCase name}}/{{pascalCase name}}.tsx`,
          templateFile: "plop-templates/component.tsx.hbs",
        },
        {
          type: "add",
          path: `src/components/shared-components/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
          templateFile: "plop-templates/component.styled.hbs",
        },
      ];
    }

    if (folderName === "composit") {
      return [
        {
          type: "add",
          path: `src/components/composit-components/{{pascalCase name}}/{{pascalCase name}}.tsx`,
          templateFile: "plop-templates/component.tsx.hbs",
        },
        {
          type: "add",
          path: `src/components/composit-components/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
          templateFile: "plop-templates/component.styled.hbs",
        },
      ];
    }

    if (folderName === "trading") {
      return [
        {
          type: "add",
          path: `src/components/composit-components/trading-module/{{pascalCase name}}/{{pascalCase name}}.tsx`,
          templateFile: "plop-templates/component.tsx.hbs",
        },
        {
          type: "add",
          path: `src/components/composit-components/trading-module/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
          templateFile: "plop-templates/component.styled.hbs",
        },
      ];
    }

    if (folderName === "sellers") {
      return [
        {
          type: "add",
          path: `src/components/composit-components/sellers-module/{{pascalCase name}}/{{pascalCase name}}.tsx`,
          templateFile: "plop-templates/component.tsx.hbs",
        },
        {
          type: "add",
          path: `src/components/composit-components/sellers-module/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
          templateFile: "plop-templates/component.styled.hbs",
        },
      ];
    }

    if (folderName === "app") {
      return [
        {
          type: "add",
          path: `src/components/composit-components/app-module/{{pascalCase name}}/{{pascalCase name}}.tsx`,
          templateFile: "plop-templates/component.tsx.hbs",
        },
        {
          type: "add",
          path: `src/components/composit-components/app-module/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
          templateFile: "plop-templates/component.styled.hbs",
        },
      ];
    }

    if (folderName === "i") {
      return [
        {
          type: "add",
          path: `src/types/interfaces/{{pascalCase name}}.interface.ts`,
          templateFile: "plop-templates/interface.ts.hbs",
        },
      ];
    }

    if (folderName === "e") {
      return [
        {
          type: "add",
          path: `src/types/enums/{{pascalCase name}}.enum.ts`,
          templateFile: "plop-templates/enum.ts.hbs",
        },
      ];
    }

    if (folderName === "t") {
      return [
        {
          type: "add",
          path: `src/types/{{pascalCase name}}.type.ts`,
          templateFile: "plop-templates/type.ts.hbs",
        },
      ];
    }

    if (folderName === "api") {
      return [
        {
          type: "add",
          path: `src/api/requests/{{toKebabCase name}}.api.ts`,
          templateFile: "plop-templates/api.ts.hbs",
        },
      ];
    }

    if (folderName === "hook") {
      return [
        {
          type: "add",
          path: `src/hooks/use-{{toKebabCase name}}-hook/use{{pascalCase name}}.ts`,
          templateFile: "plop-templates/hook.ts.hbs",
        },
      ];
    }

    if (folderName === "page") {
      return [
        {
          type: "add",
          path: `src/pages/{{pascalCase name}}/{{pascalCase name}}.tsx`,
          templateFile: "plop-templates/component.page.tsx.hbs",
        },
        {
          type: "add",
          path: `src/pages/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
          templateFile: "plop-templates/component.styled.hbs",
        },
      ];
    }

    return [
      {
        type: "add",
        path: `src/components/composit-components/{{pascalCase name}}/{{pascalCase name}}.tsx`,
        templateFile: "plop-templates/component.tsx.hbs",
      },
      {
        type: "add",
        path: `src/components/composit-components/{{pascalCase name}}/{{pascalCase name}}.styled.ts`,
        templateFile: "plop-templates/component.styled.hbs",
      },
    ];
  };

  // Component generator for composit
  plop.setGenerator("composit", {
    description: "Create a composit component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your composit component name?",
      },
    ],
    actions: commonActions("composit"),
  });

  // Component generator for shared
  plop.setGenerator("shared", {
    description: "Create a shared component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your shared component name?",
      },
    ],
    actions: commonActions("shared"),
  });

  // Component generator for trading
  plop.setGenerator("trading", {
    description: "Create a trading component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your trading component name?",
      },
    ],
    actions: commonActions("trading"),
  });

  // Component generator for sellers
  plop.setGenerator("sellers", {
    description: "Create a sellers component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your sellers component name?",
      },
    ],
    actions: commonActions("sellers"),
  });

  // Component generator for app mule
  plop.setGenerator("app", {
    description: "Create a app component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your app component name?",
      },
    ],
    actions: commonActions("app"),
  });

  // Component generator for page
  plop.setGenerator("page", {
    description: "Create a page component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your page component name?",
      },
    ],
    actions: commonActions("page"),
  });

  // Component generator for interface
  plop.setGenerator("i", {
    description: "Create an interface",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your interface name?",
      },
    ],
    actions: commonActions("i"),
  });

  // Component generator for enum
  plop.setGenerator("e", {
    description: "Create an enum",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your enum name?",
      },
    ],
    actions: commonActions("e"),
  });

  // Component generator for type
  plop.setGenerator("t", {
    description: "Create a type",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your type name?",
      },
    ],
    actions: commonActions("t"),
  });

  // Component generator for type
  plop.setGenerator("api", {
    description: "Create an api",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your api name?",
      },
    ],
    actions: commonActions("api"),
  });

  // Component generator for hook
  plop.setGenerator("hook", {
    description: "Create a hook",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is your hook name?",
      },
    ],
    actions: commonActions("hook"),
  });
};
