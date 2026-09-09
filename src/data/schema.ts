import { z } from 'zod';

/** ISO date string, YYYY-MM-DD. */
export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

/** kebab-case slug used as the item id and URL path. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'expected kebab-case slug');

/** Contact details for one listing. All fields optional and public only. */
export const contactSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
  })
  .strict();

/** Public social profile URLs for one listing. */
export const socialsSchema = z
  .object({
    instagram: z.url().optional(),
    facebook: z.url().optional(),
    tiktok: z.url().optional(),
    youtube: z.url().optional(),
    soundcloud: z.url().optional(),
    other: z.array(z.string().min(1)).optional(),
  })
  .strict();

/** Where a listing was found, so readers can verify it themselves. */
export const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
});

/** Optional dated occurrence used by /calendar.ics and add-to-calendar links. */
export const calendarDateSchema = z
  .object({
    start: isoDateSchema,
    end: isoDateSchema.optional(),
    label: z.string().min(1).optional(),
  })
  .strict();

/** Lifecycle status of a festival listing. */
export const festivalStatusSchema = z.enum(['active', 'tbc', 'hiatus', 'defunct', 'unconfirmed']);

/** One festival listing, extending the base item with festival facts. */
export const festivalSchema = z
  .object({
    /** Lifecycle status, e.g. "active". */
    status: festivalStatusSchema,
    /** Genre label, e.g. "Jazz / Blues". */
    genre: z.string().min(1).optional(),
    /** Human cost text, e.g. "Free". */
    cost: z.string().optional(),
    /** True when the festival offers camping. */
    camping: z.boolean().optional(),
    /** Approximate crowd size; null = unknown. */
    attendance: z.number().int().nonnegative().optional(),
    /** Ticket price text, e.g. "$25-$60 per session". */
    ticketPrice: z.string().optional(),
    /** Ticket purchase URL. */
    ticketUrl: z.url().optional(),
    /** One-line vibe description. */
    vibe: z.string().optional(),
    /** Promoter name, when known. */
    promoter: z.string().optional(),
  })
  .strict();

/** A validated festival listing. */
export type Festival = z.infer<typeof festivalSchema>;

/**
 * One listing in the open directory.
 *
 * Validated at the data boundary (zod) so a bad entry fails tests and the
 * build instead of breaking the site at runtime. `id` doubles as the URL
 * slug; `slug` is kept in the data for human readability and must match.
 */
export const itemSchema = z
  .object({
    /** Stable kebab-case slug, unique per listing. */
    id: slugSchema,
    /** Display name of the listing. */
    name: z.string().min(1),
    /** URL slug; always equal to id (enforced below). */
    slug: slugSchema,
    /** City the listing sits in, e.g. "Wellington". */
    city: z.string().min(1),
    /** Broader region label, e.g. "Wellington region". */
    region: z.string().min(1),
    /** Suburb or area within the city, human text. */
    location: z.string().optional(),
    /** Latitude, if known, used by the map. */
    lat: z.number().min(-90).max(90).optional(),
    /** Longitude, if known, used by the map. */
    lng: z.number().min(-180).max(180).optional(),
    /** Public contact details. */
    contact: contactSchema.optional(),
    /** Public website. */
    website: z.url().optional(),
    /** Public social profiles. */
    socials: socialsSchema.optional(),
    /** Free-form category labels, used for browsing and filtering. */
    categories: z.array(z.string().min(1)).default([]),
    /** Short human description of what this listing is. */
    description: z.string().optional(),
    /** Where the listing was found, with a URL readers can check. */
    source: sourceSchema,
    /** ISO date the listing was last verified by a human or scraper. */
    lastVerified: isoDateSchema,
    /** True when a human confirmed the listing is current. */
    verified: z.boolean().default(false),
    /** False hides the listing from the public site. */
    active: z.boolean().default(true),
    /** True when the subject asked to be removed; always excluded. */
    optOut: z.boolean().default(false),
    /** Dated occurrences, used by the iCal feed. */
    calendarDates: z.array(calendarDateSchema).default([]),
    /** Festival facts, present on festival listings. */
    festival: festivalSchema.optional(),
    /** Anything worth knowing, shown on the detail page. */
    notes: z.string().optional(),
  })
  .superRefine((item, ctx) => {
    if (item.id !== item.slug) {
      ctx.addIssue({
        code: 'custom',
        path: ['slug'],
        message: 'slug must equal id',
      });
    }
    for (const c of item.calendarDates) {
      if (c.end && c.end < c.start) {
        ctx.addIssue({
          code: 'custom',
          path: ['calendarDates'],
          message: 'calendarDates.end must not be before start',
        });
      }
    }
  });

/** A validated listing. */
export type Item = z.infer<typeof itemSchema>;

/** Validates the full listing dataset in one pass. */
export const itemListSchema = z.array(itemSchema);

/** Envelope around every dataset-backed export, versioned by content hash. */
export const datasetExportSchema = z.object({
  /** Content hash of the items array (stable ETag source). */
  version: z.string(),
  /** ISO timestamp the export was generated. */
  exportedAt: z.string(),
  /** Short license statement. */
  license: z.string(),
  /** The listings themselves, opt-outs and inactive entries removed. */
  items: itemListSchema,
});

/** A validated dataset export. */
export type DatasetExport = z.infer<typeof datasetExportSchema>;

/** Count of listings per city, used by /api/v1/cities and browse pages. */
export const cityCountSchema = z.object({
  city: z.string(),
  count: z.number().int().nonnegative(),
});

/** A single city count row. */
export type CityCount = z.infer<typeof cityCountSchema>;

/** Count of listings per category, used by /api/v1/categories. */
export const categoryCountSchema = z.object({
  category: z.string(),
  count: z.number().int().nonnegative(),
});

/** A single category count row. */
export type CategoryCount = z.infer<typeof categoryCountSchema>;

/** Metadata block for /api/v1/dataset/meta. */
export const datasetMetaSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  itemCount: z.number().int().nonnegative(),
  cities: z.array(cityCountSchema),
  categories: z.array(categoryCountSchema),
  sources: z.array(z.string()),
  license: z.string(),
  staleAfterDays: z.number().int().positive(),
});

/** A validated dataset metadata block. */
export type DatasetMeta = z.infer<typeof datasetMetaSchema>;
