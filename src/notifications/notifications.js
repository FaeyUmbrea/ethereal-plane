import { createDirectus, readItems, rest } from "@directus/sdk";
import { getSetting } from "../utils/settings.js";

export async function getNotifications() {
  const lastReadNotification = getSetting("last-read-notification");
  const lastRunDate = Date.parse(lastReadNotification)
    ? new Date(lastReadNotification)
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
      ],
    },
  };

  if (lastReadNotification === "") {
    newsQuery.filter._and.push({
      new_users: {
        _eq: true,
      },
    });
  } else {
    newsQuery.filter._and.push({
      existing_users: {
        _eq: lastReadNotification !== "",
      },
    });
  }

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
