const normalizePhone = (value = "") => String(value).replace(/[^+0-9]/g, "");

export default function DeveloperCredit({
  className = "",
  showLabel = true,
  label = "Developed By",
}) {
  const nameRaw = import.meta.env.VITE_DEVELOPER_NAME;
  const phoneRaw = import.meta.env.VITE_DEVELOPER_PHONE;

  const name = nameRaw ? String(nameRaw).trim() : "";
  const phone = phoneRaw ? String(phoneRaw).trim() : "";

  if (!name && !phone) {
    return null;
  }

  const normalized = phone ? normalizePhone(phone) : "";
  const telHref = normalized ? `tel:${normalized}` : null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
      {showLabel ? <span>{label}</span> : null}

      {name ? <span className="font-medium">{name}</span> : null}

      {name && phone ? (
        <span aria-hidden="true" className="opacity-50">
          •
        </span>
      ) : null}

      {phone ? (
        telHref ? (
          <a
            className="hover:opacity-80 transition-opacity underline underline-offset-2"
            href={telHref}
            title="Call"
            aria-label={`Call ${name || "developer"} at ${phone}`}
          >
            {phone}
          </a>
        ) : (
          <span>{phone}</span>
        )
      ) : null}
    </div>
  );
}
