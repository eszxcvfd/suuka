interface ExternalLinkValue {
  id: string;
  label: string;
  url: string;
}

interface ExternalLinksEditorProps {
  links: ExternalLinkValue[];
  onChange: (links: ExternalLinkValue[]) => void;
}

export function ExternalLinksEditor({ links, onChange }: ExternalLinksEditorProps) {
  const nextLinks = links.length > 0 ? links : [];

  return (
    <div className="field external-links-editor">
      <span className="field-label">External links</span>
      <p className="field-support">
        Pin the destinations that matter most: portfolio, shop, newsletter, or another social.
      </p>
      {nextLinks.map((link, index) => (
        <div className="external-links-editor__item" key={link.id}>
          <input
            aria-label={`Link label ${index + 1}`}
            className="field-input"
            placeholder="Link label"
            value={link.label}
            onChange={(event) => {
              const updated = [...nextLinks];
              updated[index] = { ...link, label: event.target.value };
              onChange(updated);
            }}
          />
          <input
            aria-label={`Link url ${index + 1}`}
            className="field-input"
            placeholder="https://example.com"
            value={link.url}
            onChange={(event) => {
              const updated = [...nextLinks];
              updated[index] = { ...link, url: event.target.value };
              onChange(updated);
            }}
          />
        </div>
      ))}
      <button
        className="button button--outline"
        type="button"
        onClick={() =>
          onChange([
            ...nextLinks,
            { id: `link-${nextLinks.length + 1}`, label: '', url: 'https://' },
          ])
        }
      >
        Add another link
      </button>
    </div>
  );
}
