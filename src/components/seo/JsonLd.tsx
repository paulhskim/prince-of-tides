import type { JsonLdObject } from "@/lib/seo/schema";

const LS = new RegExp(String.fromCharCode(0x2028), "g");
const PS = new RegExp(String.fromCharCode(0x2029), "g");

/**
 * Serialize for an inline <script>: escape characters that could close the tag or break parsing.
 * JSON.parse of the output returns the original data.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LS, "\\u2028")
    .replace(PS, "\\u2029");
}

type Props = {
  data: JsonLdObject | JsonLdObject[] | null | undefined;
  id?: string;
};

/** Server component. Renders nothing when data is null or an empty array. */
export function JsonLd({ data, id }: Props) {
  if (!data || (Array.isArray(data) && data.length === 0)) return null;
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

export default JsonLd;
