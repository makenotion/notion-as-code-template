/**
 * Vendored type declarations for the Notion-as-Code runtime.
 * Keep this file in sync with Notion's generated external types.
 */

// Type definitions for infra as code scripts (external SDK)
// This file is self-contained with no external imports.

declare const notionIconColors: [
  "gray",
  "lightgray",
  "brown",
  "yellow",
  "orange",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
]

export type NotionIconColor = (typeof notionIconColors)[number]

declare const selectColors: [
  "default",
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
]

export type SelectColor = (typeof selectColors)[number]

// Opaque types - external consumers should not construct these directly
// They are returned by the notion helper functions

/**
 * Represents a mention token in Notion text.
 * This is an opaque type returned by mention helper functions.
 */
export type MentionToken = unknown

export type ResourceId = string

/**
 * Emoji icon - uses a standard emoji character.
 *
 * @example
 * icon: { type: "emoji", emoji: "📊" }
 */
export type EmojiIcon = {
  type: "emoji"
  emoji: string
}

/**
 * Notion icon - uses a Notion custom icon.
 *
 * Resolution is two-stage:
 * 1. If `description` is already an exact internal Notion icon slug (e.g.
 *    `"rocket"`, `"arrow-down-basic"`), it is used directly with no
 *    network round-trip. This is the fastest path — prefer it when you
 *    already know the slug.
 * 2. Otherwise the description is treated as a natural-language query and
 *    used to look up the most relevant icon via semantic search against
 *    the turbopuffer icon index.
 *
 * @example exact slug (no semantic search, fastest)
 * icon: { type: "notion_icon", description: "rocket" }
 *
 * @example natural-language description (semantic search)
 * icon: { type: "notion_icon", description: "project management tasks" }
 *
 * @example with color
 * icon: { type: "notion_icon", description: "calendar", color: "blue" }
 */
export type NotionIcon = {
  type: "notion_icon"
  /**
   * Either an exact Notion icon slug (preferred when known) or a
   * natural-language description used for semantic search.
   */
  description: string
  /**
   * Optional color for the icon. Defaults to "gray" if not specified.
   * Available colors: gray, lightgray, brown, yellow, orange, green, blue, purple, pink, red
   */
  color?: NotionIconColor
}

/**
 * Icon type for Notion as Code resources.
 * Can be either an emoji, a Notion custom icon (resolved by exact slug match
 * or semantic search description — see `NotionIcon`), or a file reference.
 *
 * File references must be created via `notion.file()` and then referenced in the icon field.
 *
 * @example Emoji icon
 * icon: { type: "emoji", emoji: "📊" }
 *
 * @example Notion custom icon by exact slug (no semantic search)
 * icon: { type: "notion_icon", description: "rocket" }
 *
 * @example Notion custom icon by description (semantic search)
 * icon: { type: "notion_icon", description: "project management" }
 */
export type NotionAsCodeIcon = EmojiIcon | NotionIcon | FileReference

export type Parent = {
  type: "resourceId"
  resourceId: ResourceId
}

/**
 * Weekdays selected by a weekly recurrence schedule, using two-letter codes
 * from `MO` through `SU`. Set each weekday that should run to `true`.
 * For example, `{ TU: true, FR: true }` selects Tuesday and Friday.
 */
export type RecurrenceWeekdays = {
  MO?: true | undefined
  TU?: true | undefined
  WE?: true | undefined
  TH?: true | undefined
  FR?: true | undefined
  SA?: true | undefined
  SU?: true | undefined
}

/**
 * Which occurrence of a weekday to use in a month.
 *
 * Use `"1st"`, `"2nd"`, `"3rd"`, or `"4th"` for the corresponding occurrence,
 * or `"last"` for the final occurrence. For example, `"2nd"` with `"TU"`
 * means the second Tuesday of the month.
 */
export type MonthlyWeekdayOccurrence = "1st" | "2nd" | "3rd" | "4th" | "last"

/**
 * How to choose the day for a monthly recurrence: either a numbered day of the
 * month, such as the 15th, or a weekday occurrence, such as the second Tuesday.
 */
export type MonthlyRecurrenceRestriction =
  | {
      type: "day_of_month"
      /** Integer from 1 through 31. Months without this day are skipped. */
      day: number
    }
  | {
      type: "weekday_of_month"
      weekday: keyof RecurrenceWeekdays
      occurrence: MonthlyWeekdayOccurrence
    }

/**
 * Optional stopping condition for a recurrence schedule.
 */
export type RecurrenceScheduleEnd =
  | {
      type: "date"
      /**
       * ISO date or date-time interpreted in the schedule's `timeZone`.
       *
       * A date-only value uses the schedule's start time. If the start is also
       * date-only, both use midnight. A date-time value always uses its own time.
       */
      endsAt: string
    }
  | {
      type: "occurrences"
      /** Integer from 1 through 999. */
      count: number
    }

/**
 * Fields shared by every recurrence frequency.
 */
export type RecurrenceScheduleBase = {
  /** Positive integer from 1 through 99. */
  interval: number
  /**
   * ISO date or date-time, using the same format accepted by `notion.date()`
   * and `notion.datetime()`.
   *
   * A date-only start uses midnight.
   *
   * You can include seconds and milliseconds, but they are ignored and not recorded.
   */
  start: string
  /** IANA timezone such as `America/Los_Angeles`. Required for stable recurrence across daylight-saving changes. */
  timeZone: string
  end?: RecurrenceScheduleEnd
}

/**
 * An hourly recurrence schedule.
 */
export type HourlyRecurrenceSchedule = RecurrenceScheduleBase & {
  frequency: "hour"
}

/**
 * A daily recurrence schedule.
 */
export type DailyRecurrenceSchedule = RecurrenceScheduleBase & {
  frequency: "day"
}

/**
 * A weekly recurrence schedule.
 */
export type WeeklyRecurrenceSchedule = RecurrenceScheduleBase & {
  frequency: "week"
  /** At least one weekday must be set to `true`. */
  weekdays: RecurrenceWeekdays
}

/**
 * A monthly recurrence schedule.
 */
export type MonthlyRecurrenceSchedule = RecurrenceScheduleBase & {
  frequency: "month"
  monthlyRestriction: MonthlyRecurrenceRestriction
}

/**
 * A yearly recurrence schedule.
 */
export type YearlyRecurrenceSchedule = RecurrenceScheduleBase & {
  frequency: "year"
}

/**
 * A recurrence schedule supported by database templates.
 *
 * Database templates support daily through yearly schedules. Hourly schedules
 * are available for custom agent triggers only.
 *
 * @example The second Tuesday of every month
 * {
 *   frequency: "month",
 *   interval: 1,
 *   monthlyRestriction: {
 *     type: "weekday_of_month",
 *     weekday: "TU",
 *     occurrence: "2nd",
 *   },
 *   start: "2026-08-11T09:00:00",
 *   timeZone: "America/Los_Angeles",
 * }
 *
 * @example Every weekday at 9:00 AM Los Angeles time
 * {
 *   frequency: "week",
 *   interval: 1,
 *   weekdays: { MO: true, TU: true, WE: true, TH: true, FR: true },
 *   start: "2026-08-17T09:00:00",
 *   timeZone: "America/Los_Angeles",
 * }
 *
 */
export type DatabaseTemplateRecurrenceSchedule =
  | DailyRecurrenceSchedule
  | WeeklyRecurrenceSchedule
  | MonthlyRecurrenceSchedule
  | YearlyRecurrenceSchedule

/**
 * Arguments for creating a page.
 *
 * Note: For pages not in a database (e.g., regular pages in teamspaces),
 * set the page title via properties.title using notion.text("Your Title").
 * For database pages, use the database's title property name.
 *
 * RESTRICTION: Pages can only be parented to resources created within the same
 * Notion as Code script. Parenting to existing records outside the script is not supported
 * for permission safety reasons.
 */
export type PageIntent = {
  resourceId: ResourceId
  parent: Parent
  /**
   * Internal: update an existing block pointer pre-seeded in the resource registry
   * instead of creating and linking a new page block.
   */
  updateExisting?: boolean
  /**
   * Page properties including the title.
   * - For pages not in a database: Use `properties.title` to set the page title
   * - For database pages: Use property names matching the database schema
   *
   * Person property values are not supported.
   *
   * @example
   * // Regular page
   * properties: { title: notion.text("My Page Title") }
   *
   * // Database page
   * properties: { Name: notion.text("Task Name"), Status: "In Progress" }
   */
  properties?: Record<string, PropertyValue | undefined>
  /**
   * Icon for the page. Can be an emoji or a notion_icon (resolved by exact slug match or semantic search description).
   */
  icon?: NotionAsCodeIcon
  /**
   * Optional page content in Notion flavored markdown format.
   * When provided, the markdown will be parsed into blocks and added as children of the page.
   *
   * NOTE: The page title should be set via `properties.title`, NOT extracted from content.
   * Content markdown is only used to generate child blocks, not the page title.
   *
   * INLINE PAGES: To place another in-script page inline within this content
   * (a real child subpage at a chosen position, rather than appended at the
   * end), create that page with its `parent` set to THIS page's resourceId,
   * then reference it in this content with a
   * `<page url="{{that-resource-id}}"></page>` tag. The tag controls only
   * the placement; the child page's `parent` is the source of truth for
   * containment. Every page parented to this page must be created in the same
   * script and referenced exactly once in this content.
   *
   * The `<page url="{{...}}">` tag may appear anywhere in the content — at the
   * top level, or nested inside a column, callout, toggle, or other container
   * block (ideal for multi-column hub layouts). When nested, the child page is
   * re-parented into that container while remaining a real page.
   *
   * INLINE DATABASES: Position an in-script child database with
   * `<database url="{{that-resource-id}}"></database>`. Set its `parent` to
   * this page's resourceId. Add `inline="true"` to render it inline; omit
   * `inline` to render it as a full page. Every database parented to this page
   * must be referenced exactly once in this content.
   *
   * Use `url` for a real child database (full-page or inline) and
   * `data-source-url` for a linked database view. Never combine them.
   *
   * @example
   * // Hub page that lists a real child subpage under a heading:
   * content: '# Team\n<page url="{{getting-started}}"></page>'
   * // ...elsewhere in the same script:
   * notion.page({
   *   resourceId: "getting-started",
   *   parent: { type: "resourceId", resourceId: "hub-page" },
   *   properties: { title: notion.text("Getting Started") },
   * })
   */
  content?: string
  /**
   * Whether this page should be created as a data source template.
   *
   * Template pages must be parented to a data source.
   */
  template?: boolean
  /**
   * Controls how often this data source template is duplicated.
   *
   * If a recurrence already exists, the provided schedule updates it. Otherwise,
   * a new recurrence is created. An undefined recurrence leaves existing
   * recurrence state unchanged.
   *
   * This field requires `template: true`.
   */
  recurrence?: DatabaseRecurrenceSchedule
  /**
   * Optional cover image for the page.
   */
  cover?: PageCoverReference
  /**
   * Whether the page renders full width (no side margins).
   *
   * Omitted leaves the Notion default (not full width). An explicit
   * `false` clears full width on reruns against existing pages.
   */
  fullWidth?: boolean
}

/**
 * Base property schema definition shared by all property types.
 */
export type BasePropertySchemaDefinition = {
  /** Display name of the property in the database */
  name: string
  /**
   * Unique identifier for this property within the infra as code script.
   * Required for all properties to enable unambiguous references (e.g., for rollups).
   *
   * For two-way relations, use this to reference the property
   * from the other side of the relation via targetDataSourcePropertyResourceId.
   *
   * @example
   * // Projects database
   * {
   *   name: "Related Issues",
   *   type: "relation",
   *   resourceId: "related-issues-prop",  // Required identifier
   *   targetDataSourceResourceId: "issues-datasource",
   *   targetDataSourcePropertyResourceId: "project-prop"  // Points to other side
   * }
   */
  resourceId: ResourceId
  /**
   * Icon shown next to the property name in table headers, page property
   * lists, and property pickers. Defaults to the icon Notion picks for the
   * property's type when omitted.
   *
   * Only `NotionIcon` is accepted — unlike page, database, and teamspace
   * icons, properties support neither `EmojiIcon` nor `FileReference`. A
   * property is a key in the collection's schema rather than a record, so a
   * file upload has nothing to attach to, and an emoji renders as a broken
   * image.
   *
   * @example exact slug (no semantic search, fastest)
   * { resourceId: "due-prop", name: "Due", type: "date", icon: { type: "notion_icon", description: "calendar" } }
   *
   * @example natural-language description (semantic search)
   * { resourceId: "owner-prop", name: "Owner", type: "person", icon: { type: "notion_icon", description: "who is accountable" } }
   */
  icon?: NotionIcon
  /**
   * Optional plain-text description shown in the property's hover tooltip and
   * in its configuration menu. Use it to explain what belongs in the property.
   *
   * @example
   * { resourceId: "est-prop", name: "Estimate", type: "number", description: "Engineer-days, not calendar days." }
   */
  description?: string
}

/**
 * Title property - the primary name/title of database pages.
 * Every database must have exactly one title property.
 *
 * @example
 * { resourceId: "name-prop", name: "Name", type: "title" }
 */
export type TitlePropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "title"
}

/**
 * Text property - stores rich text content.
 *
 * @example
 * { resourceId: "desc-prop", name: "Description", type: "text" }
 */
export type TextPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "text"
}

/**
 * Number property - stores numeric values.
 *
 * @example
 * { resourceId: "budget-prop", name: "Budget", type: "number" }
 */
export type NumberPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "number"
}

/**
 * Select property - single choice from predefined options.
 *
 * @example
 * {
 *   resourceId: "priority-prop",
 *   name: "Priority",
 *   type: "select",
 *   options: [
 *     { name: "High", color: "red" },
 *     { name: "Medium", color: "yellow" },
 *     { name: "Low", color: "green" },
 *   ],
 * }
 */
export type SelectPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "select"
  options?: Array<SelectOptionDefinition>
}

/**
 * Multi-select property - multiple choices from predefined options.
 *
 * @example
 * {
 *   resourceId: "tags-prop",
 *   name: "Tags",
 *   type: "multi_select",
 *   options: [
 *     { name: "Frontend", color: "blue" },
 *     { name: "Backend", color: "purple" },
 *     { name: "Design", color: "pink" },
 *   ],
 * }
 */
export type MultiSelectPropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "multi_select"
    options?: Array<SelectOptionDefinition>
  }

/**
 * Available colors for select, multi-select, and status options.
 * These map to Notion's standard option colors.
 */

declare const selectOptionColors: typeof selectColors

export type SelectOptionColor = SelectColor

/**
 * Definition for a select or multi-select option with name and optional color.
 *
 * @example
 * { name: "High", color: "red" }
 */
export type SelectOptionDefinition = {
  /** Display name of the option */
  name: string
  /** Color for the option. If not specified, Notion's default color is used. */
  color?: SelectOptionColor
}

declare const statusOptionColors: typeof selectColors

export type StatusOptionColor = SelectColor

/**
 * Definition for a status option with name and optional color.
 *
 * @example
 * { name: "In Progress", color: "blue" }
 */
export type StatusOptionDefinition = {
  /** Display name of the option */
  name: string
  /** Color for the option. If not specified, the status group's default color is used. */
  color?: StatusOptionColor
  /** Whether this option should be the status property's default. Only one option can be set to default. */
  default?: boolean
}

/**
 * Status property schema definition for tracking workflow states.
 *
 * Status properties have three groups: To-do, In progress, and Complete.
 * Options are organized directly under their respective group keys.
 *
 * @example
 * {
 *   resourceId: "status-prop",
 *   name: "Status",
 *   type: "status",
 *   options: {
 *     todo: [
 *       { name: "Backlog", color: "gray", default: true },
 *       { name: "Not Started", color: "gray" },
 *     ],
 *     inProgress: [
 *       { name: "In Progress", color: "blue" },
 *       { name: "In Review", color: "purple" },
 *     ],
 *     complete: [
 *       { name: "Done", color: "green" },
 *       { name: "Archived", color: "brown" },
 *     ],
 *   },
 * }
 */
export type StatusPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "status"
  /**
   * Status options organized by workflow group.
   * All three groups (todo, inProgress, complete) are required.
   */
  options: {
    /** Options in the "To-do" group (not started) */
    todo: Array<StatusOptionDefinition>
    /** Options in the "In progress" group (actively being worked on) */
    inProgress: Array<StatusOptionDefinition>
    /** Options in the "Complete" group (finished) */
    complete: Array<StatusOptionDefinition>
  }
}

/**
 * Date property - stores dates or date ranges.
 * `notion.date("YYYY-MM-DD", end?)` or `notion.datetime({ start, end?, timeZone: "America/New_York" })`.
 *
 * @example
 * { resourceId: "due-date-prop", name: "Due Date", type: "date" }
 */
export type DatePropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "date"
}

/**
 * Checkbox property - stores boolean yes/no values.
 *
 * @example
 * { resourceId: "completed-prop", name: "Completed", type: "checkbox" }
 */
export type CheckboxPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "checkbox"
}

/**
 * URL property - stores web URLs with clickable links.
 *
 * @example
 * { resourceId: "website-prop", name: "Website", type: "url" }
 */
export type UrlPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "url"
}

/**
 * Email property - stores email addresses with mailto links.
 *
 * @example
 * { resourceId: "email-prop", name: "Contact Email", type: "email" }
 */
export type EmailPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "email"
}

/**
 * Phone number property - stores phone numbers.
 *
 * @example
 * { resourceId: "phone-prop", name: "Phone", type: "phone_number" }
 */
export type PhoneNumberPropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "phone_number"
  }

/**
 * Relation property schema definition for linking to other databases.
 *
 * Relations can be one-way or two-way:
 * - One-way: Only the source database has the relation property
 * - Two-way: Both databases have relation properties that point to each other,
 *   and changes automatically sync between them
 *
 * @example One-way relation
 * // Issues database has a relation to Projects
 * {
 *   resourceId: "project-prop",
 *   name: "Project",
 *   type: "relation",
 *   targetDataSourceResourceId: "projects-datasource"
 * }
 *
 * @example Two-way relation
 * // Projects database
 * {
 *   name: "Related Issues",
 *   type: "relation",
 *   resourceId: "related-issues-prop",
 *   targetDataSourceResourceId: "issues-datasource",
 *   targetDataSourcePropertyResourceId: "project-prop"  // Points to Issues' property
 * }
 *
 * // Issues database
 * {
 *   name: "Project",
 *   type: "relation",
 *   resourceId: "project-prop",
 *   targetDataSourceResourceId: "projects-datasource",
 *   targetDataSourcePropertyResourceId: "related-issues-prop"  // Points back to Projects' property
 * }
 *
 * With two-way relations, when you link an Issue to a Project:
 * - The Issue shows the Project in its "Project" property
 * - The Project automatically shows that Issue in its "Related Issues" property
 * - Both sides stay in sync automatically
 */
export type RelationPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "relation"
  /**
   * ResourceId of the target data source to create relations to.
   * This identifies which database this relation points to.
   */
  targetDataSourceResourceId: ResourceId
  /**
   * ResourceId of the relation property on the target data source for two-way relations.
   * When specified, changes on either side automatically sync to the other side.
   *
   * To create a two-way relation:
   * 1. Give both relation properties a resourceId
   * 2. Set each property's targetDataSourcePropertyResourceId to point to the other's resourceId
   *
   * Leave undefined for one-way relations where only the source database tracks the relationship.
   */
  targetDataSourcePropertyResourceId?: ResourceId
  /** Limit the relation to a single item (makes it a 1:1 relation instead of 1:many) */
  limit?: 1
}

/**
 * Formula property schema definition.
 *
 * Formula expressions can reference properties by resourceId using `prop(...)`:
 * - `prop("my-property-resource-id")` for a property on the current data source
 *
 * During database creation, these resourceId references are rewritten to Notion's
 * internal formula token syntax using the resolved property IDs and collection IDs.
 *
 * If omitted, `expression` creates an empty formula property.
 *
 * @example
 * {
 *   resourceId: "hours-left-prop",
 *   name: "Hours Left",
 *   type: "formula",
 *   expression: 'prop("hours-estimate-prop") - prop("hours-spent-prop")'
 * }
 */
export type FormulaPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "formula"
  expression?: string
}

/**
 * Aggregation types for rollup properties.
 *
 * Available aggregations depend on the target property type:
 * - All types: count, count_values, unique, empty, not_empty, percent_empty, percent_not_empty, show_unique
 * - Numbers: sum, average, median, min, max, range
 * - Dates: earliest_date, latest_date, date_range
 */
export type RollupAggregationType =
  // Default/property aggregations (available for all types)
  | "count"
  | "count_values"
  | "unique"
  | "empty"
  | "not_empty"
  | "percent_empty"
  | "percent_not_empty"
  | "show_unique"
  // Numeric aggregations (only for number properties)
  | "sum"
  | "average"
  | "median"
  | "min"
  | "max"
  | "range"
  // Date aggregations (only for date properties)
  | "earliest_date"
  | "latest_date"
  | "date_range"

/**
 * Target property types that can be rolled up.
 * Note: rollup of rollup is NOT supported.
 */
export type RollupTargetPropertyType =
  | "title"
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "status"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "relation"
  | "person"
  | "created_time"
  | "last_edited_time"
  | "created_by"
  | "last_edited_by"

/**
 * Rollup property schema definition for aggregating data from related records.
 *
 * Rollups require:
 * 1. A source relation property in the same database (referenced by resourceId)
 * 2. A target property in the related database to aggregate (referenced by resourceId)
 * 3. Optionally, an aggregation function
 *
 * Without aggregation, rollups show all related values (lookup mode).
 * With aggregation, rollups compute a single value (sum, count, etc.).
 *
 * IMPORTANT: Rollup properties are read-only. Do NOT include them in page `properties`
 * when calling `addPage()`. If you attempt to set values for rollup properties, an error
 * will be thrown.
 *
 * @example Rollup via relation (lookup mode - no aggregation)
 * {
 *   resourceId: "proj-names-rollup",
 *   name: "Project Names",
 *   type: "rollup",
 *   relationPropertyResourceId: "projects-rel",  // resourceId of relation property in same database
 *   targetPropertyResourceId: "proj-name",       // resourceId of property in target database
 *   targetPropertyType: "title"                  // Type for validation
 * }
 *
 * @example Rollup with aggregation (sum of numbers)
 * {
 *   resourceId: "total-budget-rollup",
 *   name: "Total Budget",
 *   type: "rollup",
 *   relationPropertyResourceId: "tasks-rel",
 *   targetPropertyResourceId: "task-estimate",
 *   targetPropertyType: "number",
 *   aggregation: "sum"
 * }
 *
 * @example Rollup with date aggregation
 * {
 *   resourceId: "latest-due-rollup",
 *   name: "Latest Due Date",
 *   type: "rollup",
 *   relationPropertyResourceId: "tasks-rel",
 *   targetPropertyResourceId: "task-due-date",
 *   targetPropertyType: "date",
 *   aggregation: "latest_date"
 * }
 */
export type RollupPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "rollup"
  /**
   * ResourceId of the relation property in the same database that provides the related records.
   * This must match the `resourceId` of a relation property defined earlier in the same data source.
   *
   * Note: The relation property must be defined BEFORE the rollup property in the properties array.
   */
  relationPropertyResourceId: ResourceId
  /**
   * ResourceId of the property in the target database to aggregate.
   * Must match a property resourceId in the database that the relation points to.
   */
  targetPropertyResourceId: ResourceId
  /**
   * Type of the target property. Required because:
   * 1. It's part of Notion's rollup schema that gets persisted to the database
   * 2. It enables early validation of aggregation compatibility
   * 3. It catches mismatches if the target property type changes later
   *
   * Must match the actual type of the target property in the target database.
   * We validate this at runtime and throw a helpful error if there's a mismatch.
   */
  targetPropertyType: RollupTargetPropertyType
  /**
   * Aggregation function to apply to the related values.
   * If omitted, the rollup acts as a lookup, showing all related values.
   *
   * Available aggregations depend on targetPropertyType:
   * - Numbers: sum, average, median, min, max, range
   * - Dates: earliest_date, latest_date, date_range
   * - All types: count, count_values, unique, empty, not_empty, percent_empty, percent_not_empty, show_unique
   */
  aggregation?: RollupAggregationType
}

/**
 * Created time property schema definition.
 *
 * This property automatically tracks when a page was created.
 * Values are set automatically by Notion and cannot be manually set.
 *
 * @example
 * { resourceId: "created-prop", name: "Created", type: "created_time" }
 */
export type CreatedTimePropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "created_time"
  }

/**
 * Last edited time property schema definition.
 *
 * This property automatically tracks when a page was last modified.
 * Values are set automatically by Notion and cannot be manually set.
 *
 * @example
 * { resourceId: "last-modified-prop", name: "Last Modified", type: "last_edited_time" }
 */
export type LastEditedTimePropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "last_edited_time"
  }

/**
 * Created by property schema definition.
 *
 * This property automatically tracks who created a page.
 * Values are set automatically by Notion and cannot be manually set.
 *
 * @example
 * { resourceId: "author-prop", name: "Author", type: "created_by" }
 */
export type CreatedByPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "created_by"
}

/**
 * Last edited by property schema definition.
 *
 * This property automatically tracks who last modified a page.
 * Values are set automatically by Notion and cannot be manually set.
 *
 * @example
 * { resourceId: "editor-prop", name: "Editor", type: "last_edited_by" }
 */
export type LastEditedByPropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "last_edited_by"
  }

/**
 * Auto-increment ID property schema definition.
 *
 * This property automatically assigns incrementing IDs to pages (e.g., TASK-1, TASK-2).
 * Values are set automatically by Notion and cannot be manually set.
 * An optional prefix can be specified to prepend to the numeric ID. This prefix must be unique within the workspace.
 *
 * @example
 * { resourceId: "task-id-prop", name: "Task ID", type: "auto_increment_id" }
 * @example
 * { resourceId: "task-id-prop", name: "Task ID", type: "auto_increment_id", prefix: "TASK" }
 */
export type AutoIncrementIdPropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "auto_increment_id"
    /**
     * Optional prefix for the auto-increment ID (e.g., "TASK" produces TASK-1, TASK-2, ...)
     *
     * This must be unique within the workspace
     */
    prefix?: string
  }

/**
 * File property - stores file attachments and media.
 * Values are set using `notion.file("resource-id")` referencing uploaded files.
 *
 * @example
 * { resourceId: "attachments-prop", name: "Attachments", type: "file" }
 */
export type FilePropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "file"
}

/**
 * Person property - stores references to Notion users.
 */
export type PersonPropertySchemaDefinition = BasePropertySchemaDefinition & {
  type: "person"
  /** Limit the property to a single user (omit for unlimited). */
  limit?: 1
}

export type VerificationPropertySchemaDefinition =
  BasePropertySchemaDefinition & {
    type: "verification"
    verifierPropertyResourceId: ResourceId
  }

export type PropertySchemaDefinition =
  | TitlePropertySchemaDefinition
  | TextPropertySchemaDefinition
  | NumberPropertySchemaDefinition
  | SelectPropertySchemaDefinition
  | MultiSelectPropertySchemaDefinition
  | StatusPropertySchemaDefinition
  | DatePropertySchemaDefinition
  | CheckboxPropertySchemaDefinition
  | UrlPropertySchemaDefinition
  | EmailPropertySchemaDefinition
  | PhoneNumberPropertySchemaDefinition
  | RelationPropertySchemaDefinition
  | FormulaPropertySchemaDefinition
  | RollupPropertySchemaDefinition
  | CreatedTimePropertySchemaDefinition
  | LastEditedTimePropertySchemaDefinition
  | CreatedByPropertySchemaDefinition
  | LastEditedByPropertySchemaDefinition
  | AutoIncrementIdPropertySchemaDefinition
  | FilePropertySchemaDefinition
  | PersonPropertySchemaDefinition
  | VerificationPropertySchemaDefinition

/**
 * A Content tab in a database page layout. It contains the page's editor and
 * discussions.
 */
export type ContentPageLayoutTab = {
  type: "content"
  name?: string
}

/**
 * A database view rendered as a tab in the page layout.
 * Uses the referenced view's name and icon. Configure `icon` on the view itself.
 */
export type ViewPageLayoutTab = {
  type: "view"
  resourceId: ResourceId
}

/**
 * A tab in a database page layout.
 */
export type DatabasePageLayoutTab = ContentPageLayoutTab | ViewPageLayoutTab

/**
 * Ordered page layout areas. Exactly one properties module must appear across
 * main and sidebar. Cover, title, and editor modules are managed automatically.
 */
export type DatabasePageLayout = {
  /** Ordered modules on the page, or inside its Content tab when using tabs. */
  main: Array<PageLayoutMainModule>
  /** Ordered sidebar modules. Omitted means no sidebar modules. */
  sidebar?: Array<PageLayoutSidebarModule>
  /** Ordered property chips below the title. At most 15; omitted means none. */
  pinnedProperties?: Array<ResourceId>
  /** Show discussions above or below the editor, or hide them. Defaults to top. */
  discussions?: "top" | "bottom" | "hidden"
  /**
   * Ordered tabs. Omit this field or pass an empty array to remove all tabs.
   * Otherwise, include exactly one Content tab to place page content among view
   * tabs; view tabs use the referenced view's name.
   */
  tabs?: Array<DatabasePageLayoutTab>
  /**
   * Whether pages use the full width of the window. Defaults to false.
   */
  fullWidth?: boolean
  /**
   * Whether property icons are shown next to property names. Defaults to
   * true.
   */
  showPropertyIcons?: boolean
  /**
   * Whether the database templates section is shown on new pages.
   * Defaults to true.
   */
  showTemplates?: boolean
}

export type DataSourceSchema = {
  resourceId: ResourceId
  name: string
  /** Descriptive metadata; not applied to the provisioned data source. */
  description?: string
  /**
   * Icon for the data source. Can be an emoji or a notion_icon (looked up via semantic search).
   */
  icon?: NotionAsCodeIcon
  /**
   * Optional resource ID of a template page in this data source to use as the
   * data source default template.
   *
   * The referenced page must be created with `template: true` and be parented to
   * this same data source.
   */
  defaultTemplate?: ResourceId
  /**
   * Optional database page layout used for pages in this data source.
   */
  pageLayout?: DatabasePageLayout
  properties: Array<PropertySchemaDefinition>
}

/**
 * A single text token - either plain text [string] or text with annotations [string, annotations[]].
 */
export type SimpleTextToken = [string] | [string, ...unknown[]]

/**
 * Simplified text value for Infra as Code property values.
 * This is the JSON-serializable subset of TextValue - an array of text tokens.
 *
 * The full TextValue type includes React.ReactNode which contains `any`,
 * preventing validator generation. This simplified type matches what the
 * runtime validation in validation.ts actually checks.
 */
export type SimpleTextValue = Array<SimpleTextToken>

/**
 * Text value returned by Infra as Code text helper functions.
 *
 * The external Infra as Code type surface aliases TextValue to the
 * JSON-serializable text token format instead of exposing the full internal
 * shared text helper shape.
 */
export type TextValue = SimpleTextValue

/**
 * A reference to an uploaded file, returned by `notion.file()`.
 * Used in database file property values.
 */
export type FileReference = {
  type: "file"
  resourceId: ResourceId
}

/**
 * A reference to a page cover image.
 *
 * Uploaded file references (from `notion.file()`) are resolved through the
 * file manifest. URL references are written directly to the page's
 * `format.page_cover`, matching built-in Notion cover URLs.
 */
export type PageCoverReference = (
  | FileReference
  | {
      type: "url"
      url: string
    }
) & {
  /**
   * Vertical position of the cover image as a percentage from the top, in
   * [0, 1]. Defaults to 0.5 (center).
   */
  position?: number
}

/**
 * Property values can be:
 * - SimpleTextValue (array format from runtime helpers - includes annotations)
 * - Array<string> (relation values)
 * - string (single relation reference)
 * - number (raw values for title, text, and number properties)
 * - Array<FileReference> (from notion.file() for file properties)
 * - undefined
 */
export type PropertyValue =
  | string
  | number
  | SimpleTextValue
  | string[]
  | FileReference[]
  | VerificationPropertyValue
  | undefined

/**
 * Maps a literal properties tuple to the union of property names.
 */
export type PropertyNameUnion<P extends PropertySchemaDefinition[]> =
  P[number] extends { name: infer N } ? (N extends string ? N : never) : never

/**
 * Allowed input value type for a particular property schema definition, keyed
 * by property type. Computed properties (formula, rollup, timestamps, audit
 * people, auto-increment ids) take no input, and person properties are
 * filter-only. Helper-valued properties take their runtime helper results
 * (`notion.file`, `notion.date`, `notion.checkbox`, `notion.select`,
 * `notion.multiSelect`, etc.).
 * Date properties accept `notion.date("YYYY-MM-DD", end?)` or `notion.datetime({ start, end?, timeZone: "America/New_York" })`; datetime values use the explicit zone if provided, always ignoring ISO offsets.
 */
export type PropertyInputForDefinition<S extends PropertySchemaDefinition> = {
  relation: ResourceId | Array<ResourceId>
  file: Array<FileReference>
  select: string
  status: string
  multi_select: string
  formula: never
  rollup: never
  created_time: never
  last_edited_time: never
  created_by: never
  last_edited_by: never
  auto_increment_id: never
  person: never
  verification: VerificationInput & { type: "verification" }
  title: SimpleTextValue | string | number
  text: SimpleTextValue | string | number
  number: SimpleTextValue | string | number
  date: SimpleTextValue
  checkbox: SimpleTextValue
  url: SimpleTextValue | string
  email: SimpleTextValue | string
  phone_number: SimpleTextValue | string
}[S["type"]]

/**
 * Shape of the properties object accepted by DataSourceHandle.addPage based on a
 * literal schema snapshot provided at database creation time.
 */
export type PropertiesInputForSchema<P extends PropertySchemaDefinition[]> = {
  [K in PropertyNameUnion<P>]?:
    | PropertyInputForDefinition<Extract<P[number], { name: K }>>
    | undefined
}

export type ViewType =
  | "table"
  | "board"
  | "calendar"
  | "list"
  | "gallery"
  | "feed"
  | "timeline"

export type PropertyVisibility = "show" | "hide" | "hide_if_empty"

/**
 * Format for a single visible property entry in a view (table / board / list /
 * gallery / feed / timeline).
 *
 * `property` must be the `resourceId` of a property in the view's data
 * source, matching the same convention used by board `groupBy.property`,
 * `calendarBy`, and `timelineBy`.
 *
 */
export type PropertyFormat = {
  /** ResourceId of the property in the view's data source. */
  property: ResourceId
  visible?: boolean
  width?: number
  visibility?: PropertyVisibility
}

/**
 * Format for a single column entry in a board view.
 *
 * `property` must be the `resourceId` of a property in the view's data
 * source, matching the same convention used by `PropertyFormat.property`
 * and board `groupBy.property`.
 *
 */
export type GroupFormat = {
  /** ResourceId of the property in the view's data source. */
  property: ResourceId
  hidden?: boolean | undefined
  value?: {
    type: string
    value?: string | boolean | number | null
  }
}

export type GroupByFormatBase = {
  /** ResourceId of the property in the view's data source. */
  property: ResourceId
  /** Whether groups with no pages are visible. Defaults to "show". */
  emptyGroupVisibility?: "show" | "hide"
  statusBy?: never
}

export type SelectGroupByFormat = GroupByFormatBase & {
  type: "select" | "multi_select"
}

export type StatusGroupByFormat = Omit<GroupByFormatBase, "statusBy"> & {
  type: "status"
  /** Groups status values by their canonical status group or individual option. */
  statusBy?: "group" | "option" | undefined
}

export type PersonGroupByFormat = GroupByFormatBase & {
  type: "person" | "created_by" | "last_edited_by"
}

export type DateGroupByFormat = GroupByFormatBase & {
  type: "date" | "created_time" | "last_edited_time" | "last_visited_time"
}

export type TextGroupByFormat = GroupByFormatBase & {
  type: "text" | "title" | "url" | "email" | "phone_number"
}

export type NumberGroupByFormat = GroupByFormatBase & {
  type: "number"
}

export type CheckboxGroupByFormat = GroupByFormatBase & {
  type: "checkbox"
}

export type RelationGroupByFormat = GroupByFormatBase & {
  type: "relation"
}

export type LocationGroupByFormat = GroupByFormatBase & {
  type: "location"
}

export type FormulaGroupByFormat = GroupByFormatBase & {
  type: "formula"
}

/**
 * Board view group-by configuration.
 *
 * `property` must be the `resourceId` of a property in the view's data
 * source, matching the same convention used by `PropertyFormat.property`,
 * `CalendarViewSchema.calendarBy`, and `TimelineViewSchema.timelineBy`.
 *
 */
export type GroupByFormat =
  | SelectGroupByFormat
  | StatusGroupByFormat
  | PersonGroupByFormat
  | DateGroupByFormat
  | TextGroupByFormat
  | NumberGroupByFormat
  | CheckboxGroupByFormat
  | RelationGroupByFormat
  | LocationGroupByFormat
  | FormulaGroupByFormat

export type CoverFormat =
  | { type: "page_cover" }
  | { type: "page_content" }
  | { type: "page_content_first" }
  | { type: "property"; property: string }

export type CoverSizeFormat = "small" | "medium" | "large"

export type CoverAspectFormat = "contain" | "cover"

export type DatabaseViewSortDirection = "ascending" | "descending"

/**
 * Sort schema for ordering database view results.
 * Sorts are applied in order — all pages are first sorted by the first sort,
 * then ties are broken by the second sort, and so on.
 */
export type PropertyViewSortSchema = {
  propertyId: string
  direction: DatabaseViewSortDirection
}

export type DatePropertyTypes = "date" | "created_time" | "last_edited_time"

export type BasePropertyFilter = {
  propertyId: string
  type: "property"
}

export type TextPropertyFilter = {
  propertyType: "title" | "text" | "url" | "email" | "phone_number"
  operator:
    | "string_is"
    | "string_is_not"
    | "string_contains"
    | "string_does_not_contain"
    | "string_starts_with"
    | "string_ends_with"
  value: string
} & BasePropertyFilter

export type NumberPropertyFilter = {
  propertyType: Extract<PropertyType, "number">
  operator:
    | "number_equals"
    | "number_does_not_equal"
    | "number_greater_than"
    | "number_less_than"
    | "number_greater_than_or_equal_to"
    | "number_less_than_or_equal_to"
  value: number
} & BasePropertyFilter

export type CheckboxPropertyFilter = {
  propertyType: Extract<PropertyType, "checkbox">
  operator: "checkbox_is" | "checkbox_is_not"
  value: boolean
} & BasePropertyFilter

export type SelectPropertyFilter = {
  propertyType: Extract<PropertyType, "select">
  operator: "enum_is" | "enum_is_not"
  value: Array<string>
} & BasePropertyFilter

export type MultiSelectPropertyFilter = {
  propertyType: Extract<PropertyType, "multi_select">
  operator: "enum_contains" | "enum_does_not_contain" | "enum_contains_all"
  value: Array<string>
} & BasePropertyFilter

export type StatusPropertyFilter = {
  propertyType: Extract<PropertyType, "status">
  operator: "status_is" | "status_is_not"
  value: Array<string>
} & BasePropertyFilter

/**
 * Date presets resolved relative to today, matching options such as
 * "Today", "Tomorrow", and "One week ago".
 */
export type RelativeDatePreset =
  | "today"
  | "tomorrow"
  | "yesterday"
  | "one_week_ago"
  | "one_week_from_now"
  | "one_month_ago"
  | "one_month_from_now"

/**
 * The unit spanned by a relative "is relative to today" date range.
 */
export type RelativeDateRangeUnit = "day" | "week" | "month" | "year"

/**
 * Which date a date property filter compares against. Notion date properties
 * can hold a range, and `end_date` reads the far end of it.
 */
export type DateFilterMode = "start_date" | "end_date"

export type ExactDatePropertyFilterValue = { type: "exact"; value: string }

export type RelativeDatePropertyFilterValue = {
  type: "relative"
  value: RelativeDatePreset
}

export type RelativeToTodayDatePropertyFilterValue = {
  type: "relative_to_today"
  value: {
    direction: "past" | "next" | "this"
    count?: number
    unit: RelativeDateRangeUnit
  }
}

/**
 * Value for a date property filter.
 *
 * - `exact` matches a calendar date in `YYYY-MM-DD` format.
 * - `relative` matches a date preset such as today or tomorrow.
 * - `relative_to_today` matches a range relative to today. `unit` can be
 *   `day`, `week`, `month`, or `year`. `count` defaults to `1` when omitted
 *   and is unnecessary for `direction: "this"`.
 * - `exact_range` matches a fixed calendar range, optionally open at one end.
 *
 */
export type DatePropertyFilterValue =
  | ExactDatePropertyFilterValue
  | RelativeDatePropertyFilterValue
  | RelativeToTodayDatePropertyFilterValue
  | ExactRangeDatePropertyFilterValue

/**
 * Date property filter.
 *
 * Single-date operators accept `exact` or `relative` values.
 * `date_is_relative_to` requires a `relative_to_today` value.
 * `date_is_within` requires an `exact_range` value.
 *
 * `dateFilterMode` chooses which end of a date range the comparison reads.
 * It defaults to `"start_date"`. `"end_date"` falls back to the start date for
 * rows whose date is a single day rather than a range, and has no effect on
 * `created_time` / `last_edited_time` properties, which are never ranges.
 *
 * @example Exact date
 * {
 *   type: "property",
 *   propertyId: "due",
 *   propertyType: "date",
 *   operator: "date_is_on_or_after",
 *   value: { type: "exact", value: "2025-10-03" }
 * }
 *
 * @example Relative date preset
 * {
 *   type: "property",
 *   propertyId: "due",
 *   propertyType: "date",
 *   operator: "date_is",
 *   value: { type: "relative", value: "today" }
 * }
 *
 * @example Next two months
 * {
 *   type: "property",
 *   propertyId: "due",
 *   propertyType: "date",
 *   operator: "date_is_relative_to",
 *   value: { type: "relative_to_today", value: { direction: "next", count: 2, unit: "month" } }
 * }
 *
 * @example Sprints that end this week
 * {
 *   type: "property",
 *   propertyId: "sprint",
 *   propertyType: "date",
 *   operator: "date_is_relative_to",
 *   value: { type: "relative_to_today", value: { direction: "this", unit: "week" } },
 *   dateFilterMode: "end_date"
 * }
 *
 * @example Fixed calendar range
 * {
 *   type: "property",
 *   propertyId: "due",
 *   propertyType: "date",
 *   operator: "date_is_within",
 *   value: { type: "exact_range", value: { startDate: "2026-01-01", endDate: "2026-03-31" } }
 * }
 *
 * @example Range left open at the end
 * {
 *   type: "property",
 *   propertyId: "due",
 *   propertyType: "date",
 *   operator: "date_is_within",
 *   value: { type: "exact_range", value: { startDate: "2026-01-01" } }
 * }
 *
 */
export type DatePropertyFilter =
  | ({
      propertyType: DatePropertyTypes
      operator:
        | "date_is"
        | "date_is_before"
        | "date_is_after"
        | "date_is_on_or_before"
        | "date_is_on_or_after"
      value: ExactDatePropertyFilterValue | RelativeDatePropertyFilterValue
      dateFilterMode?: DateFilterMode
    } & BasePropertyFilter)
  | ({
      propertyType: DatePropertyTypes
      operator: "date_is_relative_to"
      value: RelativeToTodayDatePropertyFilterValue
      dateFilterMode?: DateFilterMode
    } & BasePropertyFilter)
  | ({
      propertyType: DatePropertyTypes
      operator: "date_is_within"
      value: ExactRangeDatePropertyFilterValue
      dateFilterMode?: DateFilterMode
    } & BasePropertyFilter)

export type RelationPropertyFilter = {
  propertyType: Extract<PropertyType, "relation">
  operator: "relation_contains" | "relation_does_not_contain"
  /** References related pages, or the current page when rendered as a page-layout tab. */
  value:
    | { type: "exact"; value: Array<ResourceId> }
    | { type: "relative"; value: "this_page" }
} & BasePropertyFilter

/**
 * Person property filter — matches rows whose person property contains (or
 * does not contain) the viewer (the `"me"` template variable, resolved at
 * read time).
 */
export type PersonPropertyFilter = {
  propertyType: "created_by" | "last_edited_by" | "person"
  operator: "person_contains" | "person_does_not_contain"
  value: [{ type: "relative"; value: "me" }]
} & BasePropertyFilter

/**
 * Filter schema for filtering database views by property values.
 * Used in view definitions to specify which pages should be visible.
 *
 * Each filter targets a specific property by ID and applies a type-appropriate
 * filter operator with a comparison value.
 *
 * @example Text property filter
 * {
 *   propertyId: "name-prop",
 *   type: "property",
 *   propertyType: "text",
 *   operator: "string_contains",
 *   value: "Project"
 * }
 */
export type PropertyFilterSchema =
  | TextPropertyFilter
  | NumberPropertyFilter
  | CheckboxPropertyFilter
  | SelectPropertyFilter
  | MultiSelectPropertyFilter
  | StatusPropertyFilter
  | DatePropertyFilter
  | RelationPropertyFilter
  | PersonPropertyFilter

export type FilterSchema = Array<PropertyFilterSchema | AdvancedFilterSchema>

/**
 */
export type AdvancedFilterSchema = {
  type: "advanced"
  operator: "and" | "or"
  filters: FilterSchema
}

/**
 * Base view schema shared by all view types.
 *
 * `dataSourceResourceId` must reference a data source created by the script or
 * supplied through existing resources.
 *
 * @example
 * // When creating a database with a data source
 * const db = await notion.database({
 *   resourceId: "my-database",
 *   dataSources: [{ resourceId: "my-datasource", name: "Main", properties: [...] }]
 * })
 *
 * // Views must reference that data source
 * await db.addView({
 *   resourceId: "my-table-view",
 *   type: "table",
 *   dataSourceResourceId: "my-datasource"  // REQUIRED: matches data source above
 * })
 *
 * @example
 * // A linked database can reference another script-created or existing data source
 * const linkedDatabase = await notion.database({
 *   resourceId: "linked-database",
 *   parent: { type: "resourceId", resourceId: "project-page" },
 *   views: [{
 *     resourceId: "linked-table-view",
 *     type: "table",
 *     dataSourceResourceId: "my-datasource"  // Created elsewhere or supplied through an existing collection
 *   }]
 * })
 */
export type BaseViewSchema = {
  resourceId: ResourceId
  name?: string
  /**
   * Notion icon shown in the view tab, including tabs in database page layouts.
   * View icons do not support emoji or uploaded files. Omit to use the default
   * icon for the view type.
   */
  icon?: NotionIcon
  type: ViewType
  /** Resource ID of a script-created or existing data source. */
  dataSourceResourceId: ResourceId
  /**
   * Optional resource ID of a template page in this view's data source to use as
   * the view default template.
   *
   * The referenced page must be created with `template: true` and be parented to
   * this same data source.
   */
  defaultTemplate?: ResourceId
  /**
   * Optional: create this view as a linked view referenced by `<database>` tags
   * in page content markdown or use it as a tab in a database layout. It does
   * not attach to the database block's main view tabs.
   */
  ephemeral?: boolean
  sorts?: Array<PropertyViewSortSchema>
  /** Optional filter to control which pages appear in this view. */
  filters?: FilterSchema
  /** Whether page icons are shown in this view. */
  showPageIcon?: boolean
}

export type TableViewSchema = BaseViewSchema & {
  type: "table"
  properties?: Array<PropertyFormat>
  wrap?: boolean
  groupBy?: GroupByFormat
}

export type BoardViewSchema = BaseViewSchema & {
  type: "board"
  properties?: Array<PropertyFormat>
  groupBy?: GroupByFormat
  columns?: Array<GroupFormat>
  cover?: CoverFormat
  coverSize?: CoverSizeFormat
  coverAspect?: CoverAspectFormat
  wrap?: boolean
}

export type CalendarViewSchema = BaseViewSchema & {
  type: "calendar"
  properties?: Array<PropertyFormat>
  /**
   * REQUIRED: ResourceId of the date property to use for the calendar.
   * Must match the `resourceId` of a date property in the database schema.
   *
   * @example
   * calendarBy: "due-date-prop"  // resourceId of a property of type "date"
   */
  calendarBy: ResourceId
  showWeekends?: boolean
}

export type ListViewSchema = BaseViewSchema & {
  type: "list"
  properties?: Array<PropertyFormat>
  groupBy?: GroupByFormat
}

export type GalleryViewSchema = BaseViewSchema & {
  type: "gallery"
  properties?: Array<PropertyFormat>
  cover?: CoverFormat
  coverSize?: CoverSizeFormat
  coverAspect?: CoverAspectFormat
}

export type FeedViewSchema = BaseViewSchema & {
  type: "feed"
  properties?: Array<PropertyFormat>
  wrap?: boolean
  showAuthorByline?: boolean
}

export type TimelineViewSchema = BaseViewSchema & {
  type: "timeline"
  properties?: Array<PropertyFormat>
  tableProperties?: Array<PropertyFormat>
  /**
   * REQUIRED: ResourceId of the date property to use for the timeline start.
   * Must match the `resourceId` of a date property in the database schema.
   *
   * @example
   * timelineBy: "start-date-prop"  // resourceId of a property of type "date"
   */
  timelineBy: ResourceId
  /**
   * Optional: ResourceId of the date property to use for the timeline end
   * (for date ranges). Must match the `resourceId` of a date property in
   * the database schema.
   */
  timelineByEnd?: ResourceId
  showTable?: boolean
}

export type ViewSchema =
  | TableViewSchema
  | BoardViewSchema
  | CalendarViewSchema
  | ListViewSchema
  | GalleryViewSchema
  | FeedViewSchema
  | TimelineViewSchema

/**
 * Arguments for creating a database.
 *
 * RESTRICTION: Databases can only be parented to resources created within the same
 * Notion as Code script. Parenting to existing records outside the script is not supported
 * for permission safety reasons.
 */
export type DatabaseIntent = {
  resourceId: ResourceId
  parent: Parent
  dataSources: Array<DataSourceSchema>
  views?: Array<ViewSchema>
  /**
   * Icon for the database. Can be an emoji or a notion_icon (looked up via semantic search).
   */
  icon?: NotionAsCodeIcon
  /**
   * Optional cover for the database page.
   */
  cover?: PageCoverReference
  /**
   * Whether to hide the data source title above an inline database. Defaults to false.
   */
  hideDataSourceTitle?: boolean
  /**
   * Whether to hide the default database title when it is empty. Defaults to false.
   *
   * For a database that owns multiple data sources, including one that also links
   * to another database, Notion otherwise generates a default title when left empty.
   * Setting this to true would hide these default titles.
   *
   * Some examples look like this:
   * - Multiple owned data sources: "First DB and Second DB"
   * - Owned and linked data sources: "First DB and View of Other DB"
   */
  hideDatabaseTitleIfEmpty?: boolean
  /**
   * Optional name for the database. For a linked views-only database (one with
   * no data sources), this is applied directly to the database block as its title.
   */
  name?: string
  /**
   * Optional description for the database. A database with a description must
   * have at least one data source, i.e. a purely linked database should not
   * have a description set on it.
   */
  description?: string
}

export type SpaceUserMember = {
  role: "page_guest" | "restricted_member" | "member" | "owner"
} & ({ userId: string } | { email: string })

/**
 * Arguments for creating a space.
 *
 * NOTE: Notion as Code scripts are required to create a new space - you cannot work within
 * an existing space. This restriction exists for permission safety: all operations
 * run in a freshly created space where the executing user has full ownership.
 */
export type SpaceIntent = {
  resourceId: ResourceId
  name: string
  /**
   * Icon for the space. Can be an emoji or a notion_icon (resolved by exact slug match or semantic search description).
   */
  icon?: NotionAsCodeIcon
  /**
   * Additional members to add to the workspace.
   * The executing actor is always added automatically as an owner.
   */
  members?: SpaceUserMember[]
}

export type TeamspaceMember = {
  userId: string
  role: "owner" | "member"
}

export type TeamspaceAccessLevel = "default" | "open" | "closed" | "private"

/**
 * Arguments for creating a teamspace.
 *
 * RESTRICTION: Teamspaces can only be created within spaces created in the same
 * Notion as Code script. Creating teamspaces in existing spaces is not supported for
 * permission safety reasons.
 */
export type TeamspaceIntent = {
  resourceId: ResourceId
  name: string
  accessLevel: TeamspaceAccessLevel
  parent?: Parent
  /**
   * Icon for the teamspace. Can be an emoji or a notion_icon (resolved by exact slug match or semantic search description).
   */
  icon?: NotionAsCodeIcon
  description?: string
}

/**
 * A recurrence schedule supported by custom agent triggers.
 *
 * Custom agents support every database recurrence frequency, plus hourly
 * schedules. Weekdays use standard two-letter recurrence codes, while
 * monthly schedules repeat on either one day of the month or one weekday
 * occurrence.
 *
 * @example Every three hours
 * {
 *   frequency: "hour",
 *   interval: 3,
 *   start: "2026-08-17T09:00:00",
 *   timeZone: "America/Los_Angeles",
 * }
 *
 */
export type CustomAgentRecurrenceSchedule = (
  | DatabaseRecurrenceSchedule
  | HourlyRecurrenceSchedule
) & {
  type: "recurrence"
}

export type CustomAgentTriggerBase = {
  resourceId: ResourceId
  /** Whether the trigger is active. Defaults to true. */
  enabled?: boolean
}

export type CustomAgentRecurrenceTrigger = CustomAgentTriggerBase &
  CustomAgentRecurrenceSchedule

/**
 * Runs when a page is added to the selected data source.
 *
 * The custom agent automatically receives read-only access to the database that
 * contains the selected data source. If more permissive access is already
 * granted, that access is used.
 */
export type CustomAgentPageAddedTrigger = CustomAgentTriggerBase &
  PageAddedAutomationEvent & {
    dataSourceResourceId: ResourceId
    /**
     * Whether to wait for follow-up edits before the agent runs. Defaults to
     * true.
     */
    waitForEditsToFinish?: boolean
  }

/**
 * Defines when a custom agent runs automatically.
 */
export type CustomAgentTrigger =
  | CustomAgentRecurrenceTrigger
  | CustomAgentPageAddedTrigger
  | CustomAgentPropertyUpdatedTrigger
  | CustomAgentPageRemovedTrigger
  | CustomAgentCommentAddedTrigger
  | CustomAgentMeetingNoteSummarizedTrigger

/**
 * Arguments for creating a custom agent.
 *
 * Custom agents are AI agents scoped to a Notion workspace.
 *
 */
export type CustomAgentIntent = {
  resourceId: ResourceId
  name: string
  /**
   * Icon shown next to the agent in the sidebar, agents list, mentions,
   * and settings. Accepts the two shapes Notion's `data.icon` field
   * actually persists for workflow rows:
   * - `{ type: "emoji", emoji: "🛟" }` — written verbatim to `data.icon`.
   * - `{ type: "notion_icon", description: "rocket", color: "purple" }` —
   *   resolved to a `/icons/<slug>_<color>.svg` path; exact slug matches
   *   skip the embeddings round-trip.
   *
   * `FileReference` (the third `NotionAsCodeIcon` variant) is intentionally
   * NOT supported here yet.
   * [ref:custom_agent_file_uploads]
   *
   * When omitted, the workflow row is created without an icon and the
   * Notion UI renders the default agent avatar.
   */
  icon?: EmojiIcon | NotionIcon
  /**
   * Markdown instructions that tell the agent how to behave. The string
   * is parsed as markdown and materialized into a hidden instruction
   * page (a block tree under the agent's own space), and
   * `workflow.data.instructions` is set to a `block_page` pointer to
   * that page rather than to the raw text.
   *
   * Use standard markdown — headings, lists, bold, links, etc. — and
   * the agent runtime will see the rendered page content. Plain text
   * also works: it becomes a single paragraph block on the instruction
   * page.
   *
   * When omitted, the workflow row is created without instructions.
   */
  instructions?: string
  /**
   * Inference model identifier for this agent. Currently supports a
   * curated subset:
   * - `"ambrosia-tart-high"` — Opus 4.8 (High)
   * - `"opal-quince-medium"` — GPT 5.5 (Medium)
   * - `"almond-croissant-low"` — Sonnet 4.6 (Low)
   *
   * When omitted the agent inherits the workspace default model.
   *
   * TODO: Externalize the model names. These are internal codename
   * slugs that rotate with model releases; we need a stable external
   * naming scheme before this becomes a real public surface.
   * [ref:custom_agent_model_externalize]
   */
  model?: "ambrosia-tart-high" | "opal-quince-medium" | "almond-croissant-low"
  /**
   * Whether the agent can use the Web Browser and unrestricted internet access.
   * When omitted, the agent's current setting is left unchanged.
   */
  browserUse?: boolean
  /**
   * Whether the agent can use web search. Defaults to `false` when omitted for
   * a new agent. When updating an existing agent, omitting this field preserves
   * its current web access and domain restrictions.
   */
  webAccess?: boolean
  /**
   * URL trust policy for this agent. `{ type: "all" }` allows every HTTP and
   * HTTPS URL, while `{ type: "list", urls: [...] }` allows only the listed URL
   * globs. For a new agent, omitting this field leaves URL trust disabled; for
   * an existing agent, omission preserves the current URL trust policy.
   */
  trustedUrls?: CustomAgentTrustedUrls
  /**
   * Grants the agent access to pages and databases.
   *
   * Each entry must reference a page or database created earlier in the same
   * script or pre-seeded as an existing resource. If an entry references another
   * resource (for example, a teamspace or workspace), the finalize step throws.
   *
   * Enabled data-source triggers require reader access
   * to the database that contains each data source. The helper recomputes this
   * minimum from all effective triggers, including existing triggers omitted from
   * an update. If an explicit grant has a stronger role, the helper retains it.
   *
   * For an existing custom agent, omit this field or provide an empty list to
   * preserve current page and database grants. Each listed resource adds a grant
   * or replaces its existing grant with the listed role. Grants for unlisted
   * resources remain unchanged.
   */
  access?: Array<CustomAgentAccess>
  /**
   * Triggers that can run this agent automatically.
   *
   * Newly created custom agents include Notion's standard @mention trigger by
   * default. That trigger is not configured through this field and is preserved
   * when Notion as Code updates the trigger types it manages.
   *
   * Each listed custom agent trigger is either created or updated by `resourceId`.
   * Existing triggers that are not listed are left unchanged. An undefined or
   * empty array also leaves existing triggers unchanged.
   */
  triggers?: Array<CustomAgentTrigger>
}

/**
 * Handle returned when creating a custom agent.
 *
 * Mirrors PageHandle / TeamspaceHandle: only the resourceId is exposed so
 * downstream IaC primitives (e.g. sharedResources) can reference the agent
 * by its forward-declared ID.
 */
export type CustomAgentHandle = {
  resourceId: ResourceId
}

/**
 * Arguments for creating a child page through a page or teamspace handle. The
 * handle supplies the parent automatically.
 */
export type ChildPageArgs = Omit<
  PageIntent,
  "parent" | "updateExisting" | "template" | "recurrence"
>

/**
 * Arguments for creating a child database through a page or teamspace handle.
 * The handle supplies the parent automatically.
 */
export type ChildDatabaseArgs<
  DS extends {
    resourceId: ResourceId
    name: string
    properties: PropertySchemaDefinition[]
  }[] = [],
> = Omit<DatabaseIntent, "parent" | "dataSources"> & {
  dataSources?: DS
}

/**
 * Handle returned when creating a page.
 *
 * IMPORTANT: When using pages in relations, you must use the page resourceId, not the full PageHandle.
 *
 * @example Correct usage in relations
 * const projectPage = await projectsDS.addPage({ ... })
 * const issueProps = {
 *   Project: notion.relation([projectPage.resourceId])  // Use resourceId, not projectPage directly
 * }
 *
 * @example Incorrect usage (will cause type error)
 * const issueProps = {
 *   Project: notion.relation([projectPage])  // ERROR: PageHandle is not assignable to string
 * }
 */
export type PageHandle = {
  resourceId: ResourceId
  /** Add a database to this page */
  addDatabase<
    DS extends {
      resourceId: ResourceId
      name: string
      properties: PropertySchemaDefinition[]
    }[] = [],
  >(args: ChildDatabaseArgs<DS>): DatabaseHandle<DS>
  /** Add a page to this page */
  addPage(args: ChildPageArgs): PageHandle
}

export type DataSourceHandle<P extends PropertySchemaDefinition[]> = {
  resourceId: ResourceId
  /** Literal snapshot of the data source's properties at database creation */
  schema: P
  addPage(args: {
    resourceId: ResourceId
    /**
     * Icon for the page. Can be an emoji or a notion_icon (resolved by exact slug match or semantic search description).
     */
    icon?: NotionAsCodeIcon
    /**
     * Properties for the database page, matching the schema defined in the data source.
     * Must include values for required properties (e.g., the title property).
     * @example
     * properties: { Name: notion.text("Task"), Status: "Done" }
     */
    properties: PropertiesInputForSchema<P>
    /**
     * Optional page content in Notion flavored markdown format.
     * When provided, the markdown will be parsed into blocks and added as children of the page.
     *
     * NOTE: The page title must be set via the title property in `properties`, NOT from content.
     * Content markdown is only used to generate child blocks.
     */
    content?: string
    /**
     * Whether this page should be created as a data source template.
     */
    template?: boolean
    /**
     * Controls how often this template is duplicated. If a recurrence already
     * exists, the provided schedule updates it. Otherwise, a new recurrence is
     * created. An undefined recurrence leaves existing recurrence state unchanged.
     * Requires `template: true`.
     */
    recurrence?: DatabaseRecurrenceSchedule
    /**
     * Optional cover image referencing a file resource ID from the file manifest.
     * The file must be an image type (png, jpg, gif, svg, webp). URL cover
     * references are also accepted.
     */
    cover?: PageCoverReference
    /**
     * Whether the page renders full width (no side margins).
     */
    fullWidth?: boolean
  }): PageHandle
  /**
   * Adds a database automation owned by this data source.
   * The workspace must be on the Plus plan or higher.
   */
  addAutomation(args: ChildDatabaseAutomationArgs): DatabaseAutomationHandle
}

/**
 * Handle returned when creating a database.
 */
export type DatabaseHandle<
  DS extends {
    resourceId: ResourceId
    properties: PropertySchemaDefinition[]
  }[],
> = {
  resourceId: ResourceId
  dataSources: {
    [DataSource in DS[number] as DataSource["resourceId"]]: DataSourceHandle<
      DataSource["properties"]
    >
  }
  /** Get a data source handle by ID with schema-aware typing. */
  getDataSource: <DataSourceResourceId extends DS[number]["resourceId"]>(
    id: DataSourceResourceId,
  ) => DataSourceHandle<
    Extract<DS[number], { resourceId: DataSourceResourceId }>["properties"]
  >
  /** Records a view that references a data source created in this script. */
  addView: (view: ViewSchema) => void
}

/**
 * Handle returned when creating a teamspace.
 *
 * @example Creating a page in a teamspace
 * const teamspace = await notion.teamspace({ ... })
 *
 * // Using the addPage convenience method
 * const page = await teamspace.addPage({
 *   resourceId: "my-page",
 *   properties: { title: notion.text("Page Title") }
 * })
 *
 * // Or using notion.page() directly
 * const page = await notion.page({
 *   resourceId: "my-page",
 *   parent: { type: "resourceId", resourceId: teamspace.resourceId },
 *   properties: { title: notion.text("Page Title") }
 * })
 */
export type TeamspaceHandle = {
  resourceId: ResourceId
  /** Add a database to this teamspace */
  addDatabase<
    DS extends {
      resourceId: ResourceId
      name: string
      properties: PropertySchemaDefinition[]
    }[] = [],
  >(args: ChildDatabaseArgs<DS>): DatabaseHandle<DS>
  /** Add a page to this teamspace */
  addPage(args: ChildPageArgs): PageHandle
}

export type SpaceHandle = {
  resourceId: ResourceId
  addTeamspace(args: Omit<TeamspaceIntent, "parent">): TeamspaceHandle
  /** Add a private database to this workspace */
  addDatabase<
    DS extends {
      resourceId: ResourceId
      name: string
      properties: PropertySchemaDefinition[]
    }[] = [],
  >(args: ChildDatabaseArgs<DS>): DatabaseHandle<DS>
  /** Add a private page to this workspace */
  addPage(args: ChildPageArgs): PageHandle
}

/**
 * Intent for adding a view to a database.
 * Emitted separately from the database intent to allow streaming output
 * without needing to buffer views until the database is finalized.
 *
 */
export type ViewIntent = {
  /** The resourceId of the database to add the view to */
  databaseResourceId: ResourceId
  /** The view configuration */
  view: ViewSchema
}

/**
 * Intent for attaching a file to a parent block, database page property, teamspace icon, or space icon.
 * Used for database file property values where the file
 * is not embedded inline via markdown content.
 *
 */
export type FileAttachmentIntent = {
  /** Resource ID of the file from the file manifest */
  resourceId: ResourceId
  /** Resource ID of the parent page to attach the file to */
  parentResourceId: ResourceId
  /**
   * Property name on the parent page to set the file as value.
   * Only applicable when the parent is a database page with a file property.
   */
  propertyName?: string
}

/**
 * Discriminated union of all intent types for sandbox output.
 * Each intent includes a `type` discriminator and the corresponding args.
 *
 */
export type NotionAsCodeIntent =
  | ({ type: "space" } & SpaceIntent)
  | ({ type: "teamspace" } & TeamspaceIntent)
  | ({ type: "database" } & DatabaseIntent)
  | ({ type: "database_automation" } & DatabaseAutomationIntent)
  | ({ type: "page" } & PageIntent)
  | ({ type: "view" } & ViewIntent)
  | ({ type: "file_attachment" } & FileAttachmentIntent)
  | ({ type: "custom_agent" } & CustomAgentIntent)

// Property value helper functions

export type DateTimeInput = {
  start: string
  end?: string
  timeZone?: string
}

export type VerificationInput =
  | {
      state: "verified"
      // Set the verification expiration with notion.datetime(...); omit it for indefinite verification.
      datetime?: TextValue
    }
  | { state: "unverified" }

export type VerificationPropertyValue = VerificationInput & {
  type: "verification"
}

/**
 * Property types supported by infra as code scripts.
 */
export type PropertyType =
  | "title"
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "status"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone_number"
  | "relation"
  | "rollup"
  | "created_time"
  | "last_edited_time"
  | "created_by"
  | "last_edited_by"

/**
 * An action that can be used by Notion buttons and database automations.
 * Each action type defines its own configuration.
 */
export type AutomationAction = CreatePageAutomationAction

/**
 * Creates a page in the referenced data source.
 */
export type CreatePageAutomationAction = {
  resourceId: ResourceId
  type: "create_page"
  dataSourceResourceId: ResourceId
  /**
   * Optional resource ID of the template page used to create the new page.
   *
   * When provided, this template overrides the target data source's default
   * template. When omitted, the action uses the data source's default template,
   * or creates the page without a template if no default exists.
   *
   * The referenced page must use `template: true` and belong to the target data
   * source.
   */
  templatePageResourceId?: ResourceId
}

export type DatabaseRecurrenceSchedule = DatabaseTemplateRecurrenceSchedule

/**
 * Grouped properties, either sectionless or in ordered named sections.
 * Remaining properties are appended to the list or the final section in schema
 * order, excluding the title and properties placed elsewhere in the layout.
 */
export type PageLayoutPropertiesModule = {
  type: "properties"
} & (
  | { properties?: Array<PageLayoutPropertyConfig>; sections?: never }
  | { sections: Array<PageLayoutPropertySection>; properties?: never }
)

/**
 * An ordered named section in the grouped properties module.
 */
export type PageLayoutPropertySection = {
  name: string
  properties: Array<PageLayoutPropertyConfig>
}

/**
 * A property in a grouped list or named section.
 */
export type PageLayoutPropertyConfig = {
  property: ResourceId
  /** Defaults to show. This controls presentation, not access permissions. */
  visibility?: "show" | "hide_if_empty" | "hide"
}

/**
 * A standalone property in an ordered layout area.
 */
export type PageLayoutPropertyModule = {
  type: "property"
  property: ResourceId
  /**
   * Person, created-by, last-edited-by: compact or large.
   * Number and formula: large or small. Non-numeric formulas render small.
   * Files: landscape, portrait, or square. Other property types omit style.
   * Omitted uses the native default for the property type.
   * TODO: Link the property resource ID to its schema type so TypeScript can
   * reject styles that do not match the referenced property type.
   */
  style?:
    | PageLayoutPersonStyle
    | PageLayoutNumberAndFormulaStyle
    | PageLayoutFilesAndMediaStyle
}

/**
 * Styles for person, created-by, and last-edited-by properties.
 */
export type PageLayoutPersonStyle = "compact" | "large"

/**
 * Styles for number and formula properties.
 */
export type PageLayoutNumberAndFormulaStyle = "large" | "small"

/**
 * Styles for file and media properties.
 */
export type PageLayoutFilesAndMediaStyle = "landscape" | "portrait" | "square"

/**
 * A main-area group of ordered relation properties. At most one per layout.
 */
export type PageLayoutRelationsGroupModule = {
  type: "relations"
  relations: Array<PageLayoutRelationConfig>
}

/**
 * A relation rendered as an expanded page section or a minimal button.
 */
export type PageLayoutRelationConfig = {
  property: ResourceId
  display: "pageSection" | "minimal"
}

/**
 * Configurable modules before the editor and discussions.
 */
export type PageLayoutMainModule =
  | PageLayoutPropertiesModule
  | PageLayoutPropertyModule
  | PageLayoutRelationsGroupModule

/**
 * Configurable modules in the sidebar.
 */
export type PageLayoutSidebarModule =
  | PageLayoutPropertiesModule
  | PageLayoutPropertyModule

/**
 * Value for the `date_is_within` operator, shown as "Is between" in the UI.
 *
 * Bounds are inclusive `YYYY-MM-DD` dates; supplying only one leaves the range
 * open at the other end.
 *
 */
export type ExactRangeDatePropertyFilterValue = {
  type: "exact_range"
  value:
    | { startDate: string; endDate?: string }
    | { startDate?: string; endDate: string }
}

export type PropertyTriggerCondition = {
  type: "property_edited"
}

/**
 * Runs an automation when a page is added.
 */
export type PageAddedAutomationEvent = {
  type: "page_added"
}

/**
 * Runs an automation when a property is updated.
 */
export type PropertyUpdatedAutomationEvent = {
  type: "property_updated"
  /**
   * Property edit conditions keyed by each property's resource ID.
   *
   * For database automations, omit this field to run on any property edit.
   * For custom agents, omit this field and set `triggerWhenPageContentEdited: true`
   * to watch only page content edits.
   * TODO: Add support for any-property-edit for custom agents.
   *
   * An empty object is invalid.
   *
   * @example Trigger when the name property is edited:
   * propertyConditions: {
   *     "support-request-name": {
   *         type: "property_edited",
   *     },
   * }
   */
  propertyConditions?: Record<ResourceId, PropertyTriggerCondition>
}

/**
 * Runs when selected properties or page content are edited in the selected
 * data source.
 *
 * The custom agent automatically receives read-only access to the database
 * that contains the selected data source. If more permissive access is already
 * granted, that access is used.
 *
 * Omit `propertyConditions` and set `triggerWhenPageContentEdited` to `true`
 * to run the agent only when page content is edited.
 */
export type CustomAgentPropertyUpdatedTrigger = CustomAgentTriggerBase &
  PropertyUpdatedAutomationEvent & {
    dataSourceResourceId: ResourceId
    /**
     * Whether page content edits also run the agent. Set this with
     * `propertyConditions` to watch both property and page content edits.
     * Defaults to false.
     */
    triggerWhenPageContentEdited?: boolean
    /**
     * Whether to wait for follow-up edits before the agent runs. Defaults to
     * true.
     */
    waitForEditsToFinish?: boolean
  }

/**
 * Runs when a page in the selected data source is moved to Trash.
 *
 * The custom agent automatically receives read-only access to the database that
 * contains the selected data source. If more permissive access is already
 * granted, that access is used.
 */
export type CustomAgentPageRemovedTrigger = CustomAgentTriggerBase & {
  type: "page_removed"
  dataSourceResourceId: ResourceId
}

/**
 * Runs when someone adds a comment to a page in the selected data source.
 *
 * The custom agent automatically receives read-only access to the database that
 * contains the selected data source. If more permissive access is already
 * granted, that access is used.
 */
export type CustomAgentCommentAddedTrigger = CustomAgentTriggerBase & {
  type: "comment_added"
  dataSourceResourceId: ResourceId
}

/**
 * Runs when a meeting note in the selected data source finishes summarizing.
 *
 * The custom agent automatically receives read-only access to the database that
 * contains the selected data source. If more permissive access is already
 * granted, that access is used.
 */
export type CustomAgentMeetingNoteSummarizedTrigger = CustomAgentTriggerBase & {
  type: "meeting_note_summarized"
  dataSourceResourceId: ResourceId
}

/**
 * Defines access levels for resources that a custom agent can use.
 *
 * These values map to Notion module permissions: full access, content editing,
 * commenting, and read-only.
 */
export type CustomAgentAccessLevel = "view" | "comment" | "edit" | "fullAccess"

/**
 * Grants a custom agent access to a page or database resource.
 */
export type CustomAgentAccess = {
  resourceId: ResourceId
  level: CustomAgentAccessLevel
}

/**
 * URL trust settings for a custom agent.
 *
 * Set `{ type: "all" }` to trust every HTTP and HTTPS URL. URL trust is
 * independent from `webAccess`: an agent can trust URLs without being granted
 * web search access.
 *
 * Set `{ type: "list", urls: [...] }` to trust up to 20 listed URL globs. An
 * empty list disables URL trust.
 */
export type CustomAgentTrustedUrls =
  | {
      type: "all"
    }
  | {
      type: "list"
      urls: Array<string>
    }

/**
 * Defines an event that runs a database automation.
 */
export type DatabaseAutomationEventTrigger =
  | PageAddedAutomationEvent
  | PropertyUpdatedAutomationEvent

/**
 * Runs a database automation on a recurring schedule.
 *
 * Database automations support daily through yearly schedules. Unlike custom
 * agent triggers, they do not support hourly schedules.
 */
export type DatabaseAutomationRecurrenceTrigger = DatabaseRecurrenceSchedule & {
  type: "recurrence"
}

export type DatabaseAutomationTriggerConfiguration =
  | {
      /**
       * How the configured trigger conditions are combined. `all` requires every
       * condition to occur. `any` requires at least one. Defaults to `all`. `any`
       * cannot combine page-added with an any-property-updated trigger.
       */
      triggerOperator?: "all" | "any"
      triggers: Array<DatabaseAutomationEventTrigger>
    }
  | {
      /**
       * A recurrence is the automation's only trigger.
       * Trigger operators apply only to event triggers.
       */
      triggers: [DatabaseAutomationRecurrenceTrigger]
      triggerOperator?: never
    }

/**
 * A database automation that runs ordered actions when its triggers fire.
 * The workspace must be on the Plus plan or higher.
 */
export type DatabaseAutomationIntentBase = {
  resourceId: ResourceId
  name?: string
  /** Whether the automation is active. Defaults to true. */
  enabled?: boolean
  dataSourceResourceId: ResourceId
  actions: Array<AutomationAction>
}

export type DatabaseAutomationIntent = DatabaseAutomationIntentBase &
  DatabaseAutomationTriggerConfiguration

export type ChildDatabaseAutomationArgs = Omit<
  DatabaseAutomationIntentBase,
  "dataSourceResourceId"
> &
  DatabaseAutomationTriggerConfiguration

export type DatabaseAutomationHandle = {
  resourceId: ResourceId
}

export declare const notion: {
  /**
   * Creates a new page under a page, database, or teamspace.
   * Pages are the basic content units in Notion that can contain rich content.
   */
  page: (args: PageIntent) => PageHandle

  /**
   * Creates a database and returns a typed DatabaseHandle for data source access
   * and views.
   *
   * Omit `dataSources` for a linked (i.e. views-only) database. Declare at
   * least one non-ephemeral view in `views`; those views may reference data
   * sources created elsewhere in the script.
   */
  database: <
    DS extends Array<{
      resourceId: ResourceId
      name: string
      properties: Array<PropertySchemaDefinition>
    }> = [],
  >(
    args: Omit<DatabaseIntent, "dataSources"> & { dataSources?: DS },
  ) => DatabaseHandle<DS>

  /**
   * Creates a new teamspace and returns a TeamspaceHandle for adding databases.
   */
  teamspace: (args: TeamspaceIntent) => TeamspaceHandle

  /**
   * Modifies or references the existing Notion workspace and returns a SpaceHandle
   * for adding teamspaces.
   */
  space: (args: SpaceIntent) => SpaceHandle

  /**
   * Creates a new custom agent (an AI agent scoped to the workspace) and
   * returns a CustomAgentHandle.
   */
  customAgent: (args: CustomAgentIntent) => CustomAgentHandle

  /**
   * Creates an all-day date-property value.
   *
   * @example
   * notion.date("2024-12-31")
   * notion.date("2024-12-01", "2024-12-31")
   */
  date: (startDate: string, endDate?: string) => TextValue
  /**
   * Creates a timed date-property value. Both timestamps must be full ISO 8601
   * values including an offset. `timeZone` defaults to UTC; a supplied IANA zone
   * controls display while ISO offsets are ignored.
   *
   * @example
   * notion.datetime({ start: "2024-12-31T09:00:00.000-05:00", timeZone: "America/New_York" })
   */
  datetime: (value: DateTimeInput) => TextValue
  verification: (value: VerificationInput) => VerificationPropertyValue
  text: (value: string) => TextValue
  number: (value: number) => TextValue
  select: (value: string) => string
  status: (value: string) => string
  multiSelect: (values: Array<string>) => string
  checkbox: (value: boolean) => TextValue
  url: (value: string) => TextValue
  email: (value: string) => TextValue
  phone: (value: string) => TextValue
  relation: (items: Array<ResourceId>) => Array<ResourceId>
  file: (resourceId: ResourceId) => FileReference
}

/**
 * Complete specification for Notion's enhanced Markdown format.
 * This includes all block types, rich text formatting, and XML elements.
 * Used for the content parameter in page creation and database page creation.
 */
declare const INFRA_AS_CODE_MARKDOWN_SPEC = `
### Notion-flavored Markdown
Notion-flavored Markdown is a variant of standard Markdown with additional features to support all Block and Rich text types.
Use tabs for indentation.
Use backslashes to escape characters. For example, \* will render as * and not as a bold delimiter.
These are the characters that should be escaped: \ * ~ \` $ [ ] < > { } | ^
Block types:
Markdown blocks use a {color="Color"} attribute list to set a block color.
Text:
Rich text {color="Color"}
	Children
Headings:
# Rich text {color="Color"}
## Rich text {color="Color"}
### Rich text {color="Color"}
#### Rich text {color="Color"}
(Headings 5 and 6 are not supported in Notion and will be converted to heading 4.)
Bulleted list:
- Rich text {color="Color"}
	Children
Numbered list:
1. Rich text {color="Color"}
Bulleted and numbered list items should contain inline rich text -- otherwise they will render as empty list items, which look awkward in the Notion UI. (The inline text should be rich text -- any other block type will not be rendered inline, but as a child to an empty list item.)
Empty line:
<empty-block/>
Notion renders blocks with appropriate spacing, so there is almost never a need to use empty lines.
To render correctly as an empty line, <empty-block/> must be on its own line with no other text.
Empty lines without <empty-block/> will be stripped out.
Rich text types:
Bold:
**Rich text**
Italic:
*Rich text*
Strikethrough:
~~Rich text~~
Underline:
<span underline="true">Rich text</span>
Inline code:
\`Code\`
Multi-line inline code:
\`Line 1<br>Line 2<br>Line 3\`
Unlike in standard markdown, never use ordinary newlines inside inline code -- this will break the code span and render backticks as literal text:
\`Line 1
Line 2\` <-- BAD: newline breaks the inline code
Link:
[Link text](URL)
Citation:
[^URL]
To create a citation, you can either reference a compressed URL like this,[^{{1}}] or a full URL like this.[^example.com]
Inline colors:
<span color?="Color">Rich text</span>
Inline math:
$\`Equation\`$
The equation must be enclosed in backticks.
Inline line breaks within a block (this is mostly useful in multi-line quote blocks, where an ordinary newline character should not be used since it will break up the block structure):
<br>
Quote:
> Rich text {color="Color"}
	Children
Multi-line quote:
> Line 1<br>Line 2<br>Line 3 {color="Color"}
Unlike in standard markdown, never use ordinary newlines anywhere mid-quote -- this will render as multiple separate quote blocks, not a single multi-line quote:
> This is a quote
> This is a different, unrelated quote
> This is a third quote
Use of a single > on a line without any other text should be avoided -- this will render as an empty blockquote, which is not visually appealing.
To-do:
- [ ] Rich text {color="Color"}
	Children
- [x] Rich text {color="Color"}
	Children
Divider:
---
Table:
<table fit-page-width?="true|false" header-row?="true|false" header-column?="true|false">
	<colgroup>
		<col color?="Color">
		<col color?="Color">
	</colgroup>
	<tr color?="Color">
		<td>Data cell</td>
		<td color?="Color">Data cell</td>
	</tr>
	<tr>
		<td>Data cell</td>
		<td>Data cell</td>
	</tr>
</table>
Note: All table attributes are optional. If omitted, they default to "false".
Table structure:
- <table>: Root element with optional attributes:
  - fit-page-width: Whether the table should fill the page width
  - header-row: Whether the first row is a header
  - header-column: Whether the first column is a header
- <colgroup>: Optional element defining column-wide styles. Do not include a <colgroup> element if you do not want to set any column colors or widths.
- <col>: Column definition with optional attributes:
  - color: The color of the column
  - width: The width of the column. Leave empty to auto-size.
- <tr>: Table row with optional color attribute
- <td>: Data cell with optional color attribute
Color precedence (highest to lowest):
1. Cell color (<td color="red">)
2. Row color (<tr color="blue_bg">)
3. Column color (<col color="gray">)
Contents of table cells:
- Table cells can only contain rich text. Other block types (headings, lists, images, etc.) are not supported.
- Never use raw HTML formatting tags inside table cells; use the equivalent Notion-flavored Markdown instead, for example **bold** instead of <strong> or <b>.
Cell merging:
- Notion supports merging rectangular groups of cells into a single cell.
- You cannot create or modify cell merges through this format. If the user asks you to merge cells, tell them Notion supports it but they must do it in the UI: select the cells, right-click, and choose "Merge cells". To unmerge, use "Unmerge cells" from the same menu.
Equation:
$$
Equation
$$
		Code:
\`\`\`language
Code
\`\`\`
Note: Set the language if known (e.g. mermaid). Do NOT escape special characters inside code blocks. Code block content is literal - write it exactly as it should appear. For example, write \`const arr = [1, 2, 3]\` NOT \`const arr = \[1, 2, 3\]\`. Backslash escaping rules only apply outside of code blocks.
Mermaid diagrams: Use \`\`\`mermaid as the language. Enclose node text in double quotes when it contains special characters like parentheses, e.g. \`A["Notion (App + API)"]\`. Use \`<br>\` for line breaks inside node labels, not \n. Do not use \( or \) inside Mermaid — instead just wrap the whole label in double quotes.
XML blocks use the 'color' attribute to set a block color.
Mentions:
Users, pages, databases, data sources, agents, dates, and datetimes can be mentioned:
<mention-user url="{{URL}}">User name</mention-user>
<mention-page url="{{URL}}">Page title</mention-page>
<mention-database url="{{URL}}">Database name</mention-database>
<mention-data-source url="{{URL}}">Data source name</mention-data-source>
<mention-agent url="{{URL}}">Agent name</mention-agent>
<mention-date start="YYYY-MM-DD" end="YYYY-MM-DD"/>
<mention-date start="YYYY-MM-DD" startTime="HH:mm" timeZone="IANA_TIMEZONE"/>
<mention-date start="YYYY-MM-DD" startTime="HH:mm" end="YYYY-MM-DD" endTime="HH:mm" timeZone="IANA_TIMEZONE"/>
The URL must always be provided, and refer to an existing user, page, database, data source, agent, date, or datetime.
The inner text (name/title) is optional. The UI always displays the resolved name. So an alternative self-closing format is also supported: <mention-user url="{{URL}}"/>
Mentions are clickable and link to the entity.
For dates and datetimes, omit the 'end' attribute to mention a single date or datetime.
<mention-page> is an inline reference only. Do NOT use it to replace a <page> block — removing a <page> block deletes the child page.
Colors:
Text colors (colored text with transparent background):
gray, brown, orange, yellow, green, blue, purple, pink, red
Background colors (colored background with contrasting text):
gray_bg, brown_bg, orange_bg, yellow_bg, green_bg, blue_bg, purple_bg, pink_bg, red_bg
Usage:
- Block colors: Add color="Color" to the first line of any block
- Inline rich text colors (text colors and background colors are both supported): Use <span color="Color">Rich text</span>
#### Advanced Block types for Page content
The following block types may only be used in page content, not in the chat UI.
<advanced-blocks>
Toggle:
<details color?="Color">
<summary>Rich text</summary>
Children
</details>
Toggle headings use the {toggle="true"} attribute on a heading:
Toggle heading 1:
# Rich text {toggle="true" color?="Color"}
	Children
Toggle heading 2:
## Rich text {toggle="true" color?="Color"}
	Children
Toggle heading 3:
### Rich text {toggle="true" color?="Color"}
	Children
For toggles and toggle headings, the children must be indented in order for them to be toggleable. If you do not indent the children, they will not be contained within the toggle or toggle heading.
Callout:
<callout icon?="emoji or Notion Icon" color?="Color">
	Rich text
	Children
</callout>
Callouts can contain multiple blocks and nested children, not just inline rich text. Each child block should be indented.
For any formatting inside of callout blocks, use Notion-flavored Markdown, not HTML. For instance, bold text in a callout should be wrapped in **, not <strong>.
Columns:
<columns>
	<column ratio?="50">
		Children
	</column>
	<column ratio?="50">
		Children
	</column>
</columns>
- ratio: Optional column width as a percentage of the full width, e.g. 50 for half. Omit it to use the default even split when creating columns. When updating existing columns, set every ratio explicitly.
Tabs:
<tabs>
  <tab icon?="emoji or Notion Icon">
    Tab title
    Children
  </tab>
</tabs>
Each <tab> must have its title as the first indented line. The optional icon attribute accepts an emoji or Notion Icon, such as icon="icons/document_gray".
Custom emoji:
:emoji_name:
Page:
<page url="{{URL}}" color?="Color">Title</page>
IMPORTANT: A <page> tag represents a subpage (child page) on the current page.
WARNING: Using <page> with an existing page URL will MOVE that page into this page as a subpage. Removing that <page> tag from the content will REMOVE that child page from the current page. If moving is not intended use the <mention-page> block instead.
Database:
<database url?="{{URL}}" inline?="true|false" icon?="Emoji" color?="Color" data-source-url?="{{URL}}" wiki?="true|false">Title</database>
Provide either url or data-source-url attribute:
- If 'url' is an existing database URL, including it here will MOVE that database into the current page. If you just want to mention an existing database, use <mention-database> instead.
- If 'data-source-url' is an existing data source URL, creates a linked database view.
The 'inline' attribute toggles how the database is displayed in the UI. If set to "true", the database is fully visible and interactive on the page. If set to "false", the database is displayed as a sub-page. If you try to set inline to an invalid value, it will default to "false".
The 'wiki' attribute indicates whether this database is a wiki. Wiki databases have wiki="true". When creating pages in a wiki database, you MUST use parent type "page" with the wiki's page URL instead of parent type "dataSource". Wiki pages must be created under the database page, not the data source directly.
There is no 'Data Source' block type. Data Sources are always inside a Database, and only Databases can be inserted into a Page.
Audio:
<audio src="{{URL}}" color?="Color">Caption</audio>
File:
<file src="{{URL}}" color?="Color">Caption</file>
Embed (renders an HTML attachment file inline in a sandboxed iframe):
<embed src="{{URL}}" color?="Color">Caption</embed>
"HTML", "HTML block", "HTML artifact", and "HTML embed" all mean an HTML attachment rendered with <embed>. Never create one as a code block or file block.
Always use <embed> for HTML attachment files
For files created by the MCP create-attachment tool, use its returned file-upload:// source as the src value. The source is resolved and attached when create-pages or update-page saves the block. Keep the returned file upload ID if you need to retrieve the text later with download-attachment.
Image:
![Caption](URL) {color?="Color"}
PDF:
<pdf src="{{URL}}" color?="Color">Caption</pdf>
Video:
<video src="{{URL}}" color?="Color">Caption</video>
(Note that source URLs can either be compressed URLs, such as src="{{1}}", or full URLs, such as src="example.com". Full URLs enclosed in curly brackets, like src="{{https://example.com}}" or src="{{example.com}}", do not work.)
Table of contents:
<table_of_contents color?="Color"/>
Synced block:
The original source for a synced block.
When creating a new synced block, do not provide the URL. After inserting the synced block into a page, the URL will be provided.
<synced_block url?="{{URL}}">
	Children
</synced_block>
Note: When creating new synced blocks, omit the url attribute - it will be auto-generated. When reading existing synced blocks, the url attribute will be present.
Synced block reference:
A reference to a synced block.
The synced block must already exist and url must be provided.
You can directly update the children of the synced block reference and it will update both the original synced block and the synced block reference.
If content is unavailable due to permissions, a non-editable notice may be included via the optional notice attribute.
<synced_block_reference url="{{URL}}" notice="{{OPTIONAL_NOTICE}}">
	Children
</synced_block_reference>
Meeting notes:
<meeting-notes>
	Rich text (meeting title)
	<summary>
		AI-generated summary of the notes + transcript
	</summary>
	<notes>
		User notes
	</notes>
	<transcript>
		Transcript of the audio (cannot be edited)
	</transcript>
</meeting-notes>
- The <transcript> tag contains a raw transcript and cannot be edited by AI, but it can be edited by a user.
- When creating new meeting notes blocks, you must omit the <summary> and <transcript> tags.
- Only include <notes> in a new meeting notes block if the user is SPECIFICALLY requesting note content.
- Attempting to include or edit <transcript> will result in an error.
- All content within <summary>, <notes>, and <transcript> tags must be indented at least one level deeper than the <meeting-notes> tag.
Unknown (a block type that is not supported in the API yet):
<unknown url="{{URL}}" alt="Alt"/>
</advanced-blocks>
`
