import { createDirectus, Query, readItems, rest } from "@directus/sdk";
import { getSetting } from "../utils/settings.js";

interface Schema {
  news: News;
}

type News = {
  date_created?: "datetime";
  date_updated?: "datetime";
  existing_users?: boolean | null;
  id: number;
  message?: string | null;
  new_users?: boolean | null;
  sort?: number | null;
  status: string;
  tags?: string;
  title?: string | null;
};

export async function getNotifications() {
  const lastReadNotification = getSetting("last-read-notification");
  const lastRunDate = Date.parse(lastReadNotification)
    ? new Date(lastReadNotification).toString()
    : "1990-01-01";
  const client = createDirectus("https://cms.void.monster").with(rest());

  const newsQuery = {
    filter: {
      _and: [
        {
          tags: {
            _contains: "ethereal-plane",
          },
        },
        {
          _or: [
            {
              date_updated: {
                _gte: lastRunDate,
              },
            },
            {
              date_created: {
                _gte: lastRunDate,
              },
            },
          ],
        },
        {
          status: {
            _eq: "published",
          },
        },
        lastReadNotification === ""
          ? {
              new_users: {
                _eq: true,
              },
            }
          : {
              existing_users: {
                _eq: lastReadNotification !== "",
              },
            },
      ],
    },
  } satisfies Query<Schema, News>;

  return await client.request(readItems("News", newsQuery));
}

export async function getLinks() {
  const client = createDirectus("https://cms.void.monster").with(rest());

  const linksQuery = {
    filter: {
      _and: [
        {
          tags: {
            _contains: "ethereal-plane",
          },
        },
        {
          status: {
            _eq: "published",
          },
        },
      ],
    },
  };
  return await client.request(readItems("Links", linksQuery));
}
