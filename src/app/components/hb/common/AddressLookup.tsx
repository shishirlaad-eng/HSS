/**
 * ADDRESS LOOKUP
 *
 * Shared "Select Address" block used everywhere an address is captured
 * (Members, Karyakram venue, Shakha Session venue, Shakha/Activity Centre
 * master). One search box (postcode or street name) surfaces mock matches;
 * picking one fills Building Name / Address Line 1 / Address Line 2 /
 * Town-City / Post Code. Those five fields stay editable directly too.
 */
import { useMemo, useState, type Ref } from "react";
import { MapPin, Search, ShieldCheck } from "lucide-react";
import { cn } from "../../ui/utils";
import { FormLabel, FormInput, ErrorText } from "./Form";

export type AddressField = "buildingName" | "addressLine1" | "addressLine2" | "townCity" | "postCode";

export interface AddressValues {
  buildingName?: string;
  addressLine1?: string;
  addressLine2?: string;
  townCity?: string;
  postCode?: string;
}

interface AddressLookupProps {
  values: AddressValues;
  onChange: (field: AddressField, value: string) => void;
  /** Used as the Town/City guess for mock suggestions when the query itself doesn't imply one. */
  fallbackTown?: string;
  errors?: Partial<Record<AddressField, boolean>>;
  errorMessages?: Partial<Record<AddressField, string>>;
  /** For the scroll-to-first-error pattern — wired to the required fields only. */
  fieldRefs?: Partial<Record<"addressLine1" | "townCity" | "postCode", Ref<HTMLInputElement>>>;
  disabled?: boolean;
  /** Read-only view (e.g. a detail page not in edit mode) — hides the search box, fields stay readOnly. */
  readOnly?: boolean;
  className?: string;
}

interface AddressSuggestion {
  label: string;
  buildingName: string;
  addressLine1: string;
  townCity: string;
  postCode: string;
}

const MOCK_STREET_NAMES = ["High Street", "Church Road", "Kings Avenue", "Mill Lane", "Victoria Street", "Station Road"];

// Deterministic mock lookup — same query always returns the same suggestions,
// so the UI feels stable in the prototype without a real address API.
function mockAddressLookup(query: string, fallbackTown?: string): AddressSuggestion[] {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];
  const seed = cleaned.toUpperCase().split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const looksLikePostcode = /^[A-Z]{1,2}\d/i.test(cleaned);
  const town = fallbackTown || "London";
  return [1, 2, 3].map(n => {
    const street = MOCK_STREET_NAMES[(seed + n) % MOCK_STREET_NAMES.length];
    const houseNumber = ((seed * n) % 90) + 1;
    const postCode = looksLikePostcode
      ? cleaned.toUpperCase()
      : `${String.fromCharCode(65 + (seed % 26))}${(seed % 9) + 1} ${(n * seed) % 9}${String.fromCharCode(65 + (n % 26))}${String.fromCharCode(65 + ((n + 1) % 26))}`;
    return {
      label: `${houseNumber} ${street}, ${town}, ${postCode}`,
      buildingName: "",
      addressLine1: `${houseNumber} ${street}`,
      townCity: town,
      postCode,
    };
  });
}

export function AddressLookup({ values, onChange, fallbackTown, errors, errorMessages, fieldRefs, disabled, readOnly, className }: AddressLookupProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const suggestions = useMemo(() => mockAddressLookup(query, fallbackTown), [query, fallbackTown]);

  const pick = (s: AddressSuggestion) => {
    onChange("buildingName", s.buildingName);
    onChange("addressLine1", s.addressLine1);
    onChange("townCity", s.townCity);
    onChange("postCode", s.postCode);
    setQuery(s.label);
    setShowResults(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {!readOnly && (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
              <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              Select Address
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium bg-success-50 text-success-700 dark:bg-success-950/20 dark:text-success-400 border-success-200 dark:border-success-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Proxy Active
            </span>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <FormInput
                type="text"
                value={query}
                disabled={disabled}
                onChange={e => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                placeholder="Start typing postcode or street name (e.g. SW1A 1AA)…"
                className="pl-9"
              />
            </div>
            {showResults && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseDown={() => pick(s)}
                    className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
              Type a UK postcode or street name to select automatically via secure server lookup.
            </p>
          </div>
        </>
      )}

      <div>
        <FormLabel>Building Name</FormLabel>
        <FormInput
          type="text"
          value={values.buildingName ?? ""}
          disabled={disabled}
          readOnly={readOnly}
          onChange={e => onChange("buildingName", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel required>Address Line 1</FormLabel>
          <FormInput
            ref={fieldRefs?.addressLine1}
            type="text"
            value={values.addressLine1 ?? ""}
            disabled={disabled}
            readOnly={readOnly}
            onChange={e => onChange("addressLine1", e.target.value)}
            className={errors?.addressLine1 ? "border-error-400 dark:border-error-600 focus:ring-error-400/30" : ""}
          />
          <ErrorText>{errors?.addressLine1 && (errorMessages?.addressLine1 ?? "Address line 1 is required.")}</ErrorText>
        </div>
        <div>
          <FormLabel>Address Line 2</FormLabel>
          <FormInput
            type="text"
            value={values.addressLine2 ?? ""}
            disabled={disabled}
            readOnly={readOnly}
            onChange={e => onChange("addressLine2", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel required>Town / City</FormLabel>
          <FormInput
            ref={fieldRefs?.townCity}
            type="text"
            value={values.townCity ?? ""}
            disabled={disabled}
            readOnly={readOnly}
            onChange={e => onChange("townCity", e.target.value)}
            className={errors?.townCity ? "border-error-400 dark:border-error-600 focus:ring-error-400/30" : ""}
          />
          <ErrorText>{errors?.townCity && (errorMessages?.townCity ?? "Town / city is required.")}</ErrorText>
        </div>
        <div>
          <FormLabel required>Post Code</FormLabel>
          <FormInput
            ref={fieldRefs?.postCode}
            type="text"
            value={values.postCode ?? ""}
            disabled={disabled}
            readOnly={readOnly}
            onChange={e => onChange("postCode", e.target.value)}
            className={errors?.postCode ? "border-error-400 dark:border-error-600 focus:ring-error-400/30" : ""}
          />
          <ErrorText>{errors?.postCode && (errorMessages?.postCode ?? "Post code is required.")}</ErrorText>
        </div>
      </div>
    </div>
  );
}
