// Vendored from the Notion SDK's Notion-as-Code stub runtime
// (notion-sdk-js: src/EXPERIMENTAL__notion-as-code/utils/runtime.ts,
// createNotionAsCodeStubRuntime). Do not edit by hand; update it from the
// SDK when new intent helpers ship.
//
// Calls such as `notion.page()` record plain intent objects instead of
// calling the Notion API directly. `ntn notion-as-code apply` submits the
// recorded intents.

import type {
  DatabaseHandle,
  DatabaseIntent,
  DataSourceHandle,
  InfraAsCodeIntent,
  notion as notionDefinition,
  PageIntent,
  PropertySchemaDefinition,
} from "./types";

const intents: InfraAsCodeIntent[] = [];

function recordIntent(intent: InfraAsCodeIntent) {
  intents.push(intent);
}

const notion: typeof notionDefinition = {

  space: args => {
    recordIntent({ type: "space", ...args });
    return {
      resourceId: args.resourceId,
      addTeamspace: tsArgs =>
        notion.teamspace({
          ...tsArgs,
          parent: { type: "resourceId", resourceId: args.resourceId },
        }),
    };
  },

  teamspace: args => {
    recordIntent({ type: "teamspace", ...args });
    return {
      resourceId: args.resourceId,
      addDatabase: dbArgs =>
        notion.database({
          ...dbArgs,
          parent: { type: "resourceId", resourceId: args.resourceId },
        }),
      addPage: pageArgs =>
        notion.page({
          ...pageArgs,
          parent: { type: "resourceId", resourceId: args.resourceId },
        }),
    };
  },

  database: <
    DS extends {
      resourceId: string;
      name: string;
      properties: PropertySchemaDefinition[];
    }[],
  >(
    args: Omit<DatabaseIntent, "dataSources"> & { dataSources: DS },
  ): DatabaseHandle<DS> => {
    recordIntent({ type: "database", ...args });

    const dataSources: Record<
      string,
      DataSourceHandle<PropertySchemaDefinition[]>
    > = {};
    for (const ds of args.dataSources) {
      const dataSourceResourceId = ds.resourceId;
      dataSources[ds.resourceId] = {
        resourceId: dataSourceResourceId,
        schema: ds.properties,
        addPage: pageArgs =>
          notion.page({
            ...pageArgs,
            parent: {
              type: "resourceId",
              resourceId: dataSourceResourceId,
            },
          }),
      };
    }

    return {
      resourceId: args.resourceId,
      dataSources,
      getDataSource: id => {
        const dataSource = dataSources[id];
        if (dataSource === undefined) {
          throw new Error(`Unknown data source resourceId: ${id}`);
        }

        return dataSource;
      },
      addView: view => {
        recordIntent({
          type: "view",
          databaseResourceId: args.resourceId,
          view,
        });
      },
    } as DatabaseHandle<DS>;
  },

  page: args => {
    recordIntent({ type: "page", ...args });
    return {
      resourceId: args.resourceId,
      addPage: (pageArgs: Omit<PageIntent, "parent">) =>
        notion.page({
          ...pageArgs,
          parent: { type: "resourceId", resourceId: args.resourceId },
        }),
      addDatabase: (dbArgs: Omit<DatabaseIntent, "parent">) =>
        notion.database({
          ...dbArgs,
          parent: { type: "resourceId", resourceId: args.resourceId },
        }),
    };
  },

  customAgent: args => {
    recordIntent({ type: "custom_agent", ...args });
    return {
      resourceId: args.resourceId,
    };
  },

  // Creates a file reference for use in database file properties. The
  // resourceId must match a file from the file manifest.
  file: resourceId => ({ type: "file", resourceId }),

  text: value => [[value]],
  number: value => [[String(value)]],
  checkbox: value => [[value ? "Yes" : "No"]],
  phone: value => [[value]],
  select: value => value,
  status: value => value,
  multiSelect: values => values.join(","),
  date: (startDate, endDate) => {
    const dateData = endDate
      ? { type: "daterange", start_date: startDate, end_date: endDate }
      : { type: "date", start_date: startDate };
    return [["\u2023", [["d", dateData]]]];
  },
  url: value => [[value, [["a", value]]]],
  email: value => [[value, [["a", `mailto:${value}`]]]],
  relation: value => value,
};

export type * from "./types";
export { notion };

/** Internal: consumed by entry.ts after the user script has run. */
export function getIntents() {
  return intents;
}
