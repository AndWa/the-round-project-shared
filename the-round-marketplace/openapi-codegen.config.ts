import { defineConfig } from "@openapi-codegen/cli";
import {
  generateReactQueryComponents,
  generateSchemaTypes,
} from "@openapi-codegen/typescript";
export default defineConfig({
  theRound: {
    from: {
      source: "url",
      url: `http://localhost:3000/swagger-json`, // TODO: Update url
    },
    outputDir: "services/api",
    to: async (context) => {
      const filenamePrefix = "theRound";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
