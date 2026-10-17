"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type Json, type Row, text } from "@/lib/model";
import { labels, readonlyFields, hiddenFields } from "@/lib/modules";
import { importConfigs } from "@/lib/domain";
import metadata from "@/lib/legacy-metadata.json";
import { Button } from "./ui/button";
export interface Field {
  key: string;
  label?: string;
  kind?: "text" | "textarea" | "number" | "select" | "multi";
  options?: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}
export function FieldForm({
  fields,
  initial,
  onSave,
  submitLabel = "ตรวจสอบและบันทึก TEST_",
}: {
  fields: Field[];
  initial: Record<string, Json>;
  onSave: (values: Record<string, Json>) => void;
  submitLabel?: string;
}) {
  const defaults: Record<string, string | string[]> = {};
  for (const f of fields) {
    const v = initial[f.key];
    defaults[f.key] =
      f.kind === "multi" ? (Array.isArray(v) ? v.map(text) : []) : text(v);
  }
  const form = useForm<Record<string, string | string[]>>({
    defaultValues: defaults,
  });
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={form.handleSubmit((values) => {
        try {
          const parsed: Record<string, Json> = {};
          for (const field of fields) {
            const value = values[field.key] ?? defaults[field.key] ?? "";
            if (
              field.required &&
              (!value || (Array.isArray(value) && !value.length))
            )
              throw new Error(
                "กรุณากรอก" + (field.label || labels[field.key] || "ข้อมูล"),
              );
            parsed[field.key] =
              field.kind === "number"
                ? z.coerce
                    .number()
                    .int()
                    .min(0)
                    .max(Number.MAX_SAFE_INTEGER)
                    .parse(value)
                : value;
          }
          onSave(parsed);
        } catch (e) {
          setError(
            e instanceof z.ZodError
              ? "ตรวจจำนวนเต็มและข้อมูลที่จำเป็นอีกครั้ง"
              : e instanceof Error
                ? e.message
                : "บันทึกไม่สำเร็จ",
          );
        }
      })}
    >
      <div className="field-grid">
        {fields.map((field) => (
          <label
            key={field.key}
            htmlFor={`field-${field.key}`}
            className={
              field.kind === "textarea" || field.kind === "multi"
                ? "md:col-span-2"
                : ""
            }
          >
            {field.label || labels[field.key] || "ข้อมูลเพิ่มเติม"}
            {field.required ? " *" : ""}
            {field.kind === "select" || field.kind === "multi" ? (
              <select
                {...form.register(field.key)}
                id={`field-${field.key}`}
                aria-label={`${field.label || labels[field.key] || "ข้อมูลเพิ่มเติม"}${field.required ? " *" : ""}`}
                multiple={field.kind === "multi"}
                disabled={field.disabled}
                required={field.required}
                size={field.kind === "multi" ? 5 : undefined}
              >
                {field.kind !== "multi" && (
                  <option value="">เลือกข้อมูล</option>
                )}
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : field.kind === "textarea" ? (
              <textarea
                {...form.register(field.key)}
                id={`field-${field.key}`}
                aria-label={`${field.label || labels[field.key] || "ข้อมูลเพิ่มเติม"}${field.required ? " *" : ""}`}
                maxLength={5000}
                required={field.required}
              />
            ) : (
              <input
                {...form.register(field.key)}
                id={`field-${field.key}`}
                aria-label={`${field.label || labels[field.key] || "ข้อมูลเพิ่มเติม"}${field.required ? " *" : ""}`}
                type={field.kind === "number" ? "number" : "text"}
                min={field.kind === "number" ? 0 : undefined}
                step={field.kind === "number" ? 1 : undefined}
                maxLength={5000}
                disabled={field.disabled}
                required={field.required}
              />
            )}
          </label>
        ))}
      </div>
      <p role="alert" className="error my-4">
        {error}
      </p>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
export function recordFields(
  module: string,
  rows: Row[],
  record?: Row,
): Field[] {
  const sample: Record<string, Json> = record || rows[0] || {};
  const keys = [
    ...new Set([
      "id",
      "name",
      ...(importConfigs[module]?.fields
        .map((f) => f[1])
        .filter((k): k is string => !!k) || []),
      ...Object.keys(sample),
    ]),
  ].filter(
    (key) =>
      !readonlyFields.has(key) &&
      !hiddenFields.has(key) &&
      key !== "previousStatus" &&
      (typeof sample[key] !== "object" ||
        sample[key] === null ||
        key === "educationPositions"),
  );
  return keys.map((key) => {
    const field: Field = {
      key,
      required: key === "id" || key === "name",
      disabled: key === "id" && !!record,
    };
    const custom =
      key === "governancePosition"
        ? metadata.governance
        : key === "educationPositions"
          ? metadata.education
          : key === "sanghaRegion"
            ? Array.from({ length: 18 }, (_, i) => `TEST_ภาค_${i + 1}`)
            : key === "type" && module === "organizations"
              ? metadata.organizationTypes
              : key === "examType"
                ? metadata.examTypes
                : key === "type" && module === "requests"
                  ? metadata.requestTypes
                  : undefined;
    const enumKey = [
      "type",
      "applicantKind",
      "paliTrack",
      "formType",
      "level",
      "changeType",
      "classification",
      "direction",
      "urgency",
      "category",
      "section",
      "region",
    ].includes(key);
    const options =
      custom ||
      (enumKey
        ? [...new Set(rows.map((r) => text(r[key])).filter(Boolean))]
        : undefined);
    if (options?.length) {
      field.kind = key === "educationPositions" ? "multi" : "select";
      field.options = options.map((value) => ({
        value,
        label:
          key === "sanghaRegion" ? value.replace("TEST_ภาค_", "ภาค ") : value,
      }));
    } else
      field.kind =
        typeof sample[key] === "number"
          ? "number"
          : ["summary", "changeSummary", "evidence", "address"].includes(key)
            ? "textarea"
            : "text";
    return field;
  });
}
